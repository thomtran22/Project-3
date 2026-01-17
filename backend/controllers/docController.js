const Document = require("../models/Document");
const User = require("../models/User");
const { HfInference } = require("@huggingface/inference");
const pdf = require('pdf-parse-fork'); 
const fs = require('fs');

const hf = new HfInference(process.env.HUGGINGFACEHUB_API_KEY);

// 1. Lấy danh sách tài liệu theo phân quyền
exports.getDocs = async (req, res) => {
    try {
        const { role, userId } = req.user;
        const isGlobal = req.query.isGlobal === 'true';
        let query = {};

        if (isGlobal) {
            query = { isGlobal: true };
        } else {
            if (role === 'doctor') {
                query = { owner: userId, isGlobal: false }; 
            } else if (role === 'patient') {
                query = { sharedWith: { $in: [userId] }, isGlobal: false }; 
            } else {
                query = { isGlobal: false }; 
            }
        }

        const docs = await Document.find(query).sort({ createdAt: -1 });
        res.status(200).json(docs);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 2. Upload file (Bản sửa lỗi gộp Part và Xem file)
exports.uploadFile = async (req, res) => {
    try {
        const { role, userId } = req.user;
        const isGlobalUpload = req.body.isGlobal === 'true';

        if (role === 'patient') return res.status(403).json({ error: "Bệnh nhân không có quyền nạp file!" });
        if (isGlobalUpload && role !== 'admin') return res.status(403).json({ error: "Chỉ Admin mới được nạp kho chung!" });
        if (!req.file) return res.status(400).json({ error: "Không tìm thấy file!" });

        const fileUrl = req.file.path.replace(/\\/g, '/'); 
        const originalName = req.file.originalname;

        const dataBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdf(dataBuffer);
        const fullText = pdfData.text;

        const CHUNK_SIZE = 1000;
        const CHUNK_OVERLAP = 200;
        const chunks = [];

        for (let i = 0; i < fullText.length; i += (CHUNK_SIZE - CHUNK_OVERLAP)) {
            const chunk = fullText.substring(i, i + CHUNK_SIZE);
            if (chunk.trim().length > 100) {
                chunks.push(chunk);
            }
        }

        const uploadPromises = chunks.map(async (chunkContent, index) => {
            const vector = await hf.featureExtraction({
                model: "sentence-transformers/all-mpnet-base-v2",
                inputs: chunkContent,
                options: { wait_for_model: true }
            });

            const newDoc = new Document({
                fileName: `${originalName} (Part ${index + 1})`,
                fileUrl: fileUrl,
                originalName: originalName,
                content: chunkContent,
                embedding: vector,
                owner: userId,
                isGlobal: isGlobalUpload,
                metadata: { originalName: originalName, chunkIndex: index } 
            });

            return newDoc.save();
        });

        await Promise.all(uploadPromises);
        res.status(200).json({ msg: `Nạp thành công ${chunks.length} mảnh.` });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 3. Lấy toàn bộ bệnh nhân
exports.getAllPatients = async (req, res) => {
    try {
        const patients = await User.find({ role: 'patient' }).select('fullName username _id');
        res.status(200).json(patients);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 4. Chia sẻ file cho bệnh nhân
exports.shareFileToPatient = async (req, res) => {
    try {
        const { fileName, patientId } = req.body;
        // fileName ở đây là ID của tài liệu
        await Document.findOneAndUpdate({ _id: fileName }, { $addToSet: { sharedWith: patientId } });
        res.status(200).json({ msg: "Đã gán thành công!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 5. Xóa tài liệu (Xóa tất cả Part liên quan)
exports.deleteDocument = async (req, res) => {
    try {
        const { fileName } = req.params;
        const { userId, role } = req.user;

        let query = { 
            $or: [
                { originalName: fileName },
                { fileName: { $regex: fileName, $options: 'i' } }
            ]
        };
        
        if (role !== 'admin') { query.owner = userId; }

        const result = await Document.deleteMany(query);
        if (result.deletedCount === 0) return res.status(404).json({ error: "Không tìm thấy tài liệu!" });

        res.status(200).json({ msg: `Xóa thành công ${result.deletedCount} mảnh.` });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 6. Hủy chia sẻ
exports.unshareFileFromPatient = async (req, res) => {
    try {
        const { fileId, patientId } = req.body;
        await Document.findByIdAndUpdate(fileId, { $pull: { sharedWith: patientId } });
        res.status(200).json({ msg: "Đã hủy quyền truy cập." });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 7. Lấy tài liệu Global
exports.getGlobalDocs = async (req, res) => {
    try {
        const docs = await Document.find({ isGlobal: true }).sort({ createdAt: -1 });
        res.status(200).json(docs);
    } catch (err) { res.status(500).json({ error: err.message }); }
};