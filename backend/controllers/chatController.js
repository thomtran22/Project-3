const Document = require("../models/Document");
const Conversation = require("../models/Conversation");
const { HfInference } = require("@huggingface/inference");
const mongoose = require('mongoose');
const { Groq } = require("groq-sdk");

// Khởi tạo API
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const hf = new HfInference(process.env.HUGGINGFACEHUB_API_KEY);

//Tạo cuộc hội thoại mới
exports.createConversation = async (req, res) => {
    try {
        const newConv = new Conversation({ 
            user: req.user.userId, 
            title: "Cuộc trò chuyện mới", 
            messages: [] 
        });
        await newConv.save();
        res.status(201).json(newConv);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
};

// Lấy danh sách hội thoại
exports.getConversations = async (req, res) => {
    try {
        const list = await Conversation.find({ user: req.user.userId }).sort({ createdAt: -1 });
        res.status(200).json(list);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
};

//Lấy tin nhắn
exports.getMessagesByConversationId = async (req, res) => {
    try {
        const conv = await Conversation.findById(req.params.id);
        res.status(200).json(conv ? conv.messages : []);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
};

//Đã sửa lỗi 400 và lỗi bốc nhầm mục lục
exports.chatWithAI = async (req, res) => {
    try {
        const { content, knowledgeType, conversationId } = req.body;
        const userId = new mongoose.Types.ObjectId(req.user.userId);
        
        console.log("Đang tạo vector câu hỏi (HF)...");
        const queryVector = await hf.featureExtraction({
            model: "sentence-transformers/all-mpnet-base-v2", 
            inputs: content,
            options: { wait_for_model: true } 
        });

        console.log("Đang truy vấn database sâu...");
        let filterQuery = (knowledgeType === 'global') 
            ? { isGlobal: { $eq: true } } 
            : { 
                $and: [
                    { isGlobal: { $eq: false } },
                    { $or: [{ owner: { $eq: userId } }, { sharedWith: { $eq: userId } }] }
                ]
            };

        // Truy vấn với numCandidates cao để tìm xuyên qua mục lục
        const relevantDocs = await Document.aggregate([{
            $vectorSearch: {
                index: "vector_index", 
                path: "embedding",
                queryVector: queryVector,
                numCandidates: 300, // Quét rộng để tìm nội dung chi tiết
                limit: 4,           // Chỉ lấy 4 mảnh để tránh lỗi 400 trên Groq
                filter: filterQuery 
            }
        }]);

        // Gộp context và LOẠI BỎ mục lục quyết liệt
        const context = relevantDocs.length > 0 
            ? relevantDocs
                .map(d => d.content)
                .join("\n---\n")
                .split('\n')
                // Loại bỏ các dòng chứa nhiều dấu chấm liên tiếp (đặc trưng mục lục)
                .filter(line => !line.includes('....') && !line.includes('....')) 
                .join('\n')
                .substring(0, 2500) // Giới hạn cứng ký tự để an toàn cho API
            : "";

        console.log(`--- ĐÃ TRÍCH XUẤT ${relevantDocs.length} MẢNH (ĐÃ LỌC RÁC) ---`);
        console.log(context.substring(0, 500) + "...");

        console.log("Đang gọi Meta Llama 3.1...");
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { 
                    role: "system", 
                    content: `BẠN LÀ TRỢ LÝ Y KHOA.
                    NHIỆM VỤ: Trả lời câu hỏi CHỈ dựa trên tài liệu được cung cấp dưới đây.
                    
                    TÀI LIỆU:
                    "${context}"
                    
                    YÊU CẦU:
                    1. Nếu thấy danh sách Suy giáp, U tụy, Cường thượng thận... hãy liệt kê đầy đủ.
                    2. Nếu tài liệu trích xuất chỉ có tiêu đề mục lục mà không có giải thích, hãy báo không tìm thấy thông tin chi tiết.
                    3. Tuyệt đối không tự bịa kiến thức ngoài.` 
                },
                { role: "user", content: content }
            ],
            model: "llama-3.1-8b-instant",
            max_tokens: 500, // Giới hạn token trả về để tránh lỗi 400
            temperature: 0, 
            top_p: 0.1
        });

        const aiResponse = chatCompletion.choices[0].message.content;
        const aiMsg = { sender: 'ai', content: aiResponse };

        // Lưu lịch sử
        await Conversation.findByIdAndUpdate(conversationId, { 
            $push: { messages: [{ sender: 'user', content: content }, aiMsg] } 
        });

        res.status(200).json({ aiMsg });
    } catch (err) {
        console.error("LỖI TẠI SERVER:", err);
        res.status(500).json({ error: "Lỗi hệ thống: " + err.message });
    }
};