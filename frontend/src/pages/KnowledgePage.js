import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { AiOutlineCloudUpload, AiOutlineFilePdf, AiOutlineDelete, AiOutlineEye, AiOutlineClose } from "react-icons/ai";
import { IoCloseOutline } from "react-icons/io5";

const KnowledgePage = () => {
    const location = useLocation();
    const isGlobalPage = location.pathname === '/knowledge-global';
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [documents, setDocuments] = useState([]); 
    const [patients, setPatients] = useState([]);   
    const [user, setUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState("");
    const [viewFile, setViewFile] = useState(null); // State để xem PDF trực tiếp
    const token = localStorage.getItem('token');

    const fetchData = async () => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const userRes = await axios.get('http://localhost:5000/api/auth/me', { headers });
            setUser(userRes.data);

            const docsRes = await axios.get(`http://localhost:5000/api/docs/list?isGlobal=${isGlobalPage}`, { headers });
            setDocuments(docsRes.data);

            if (userRes.data.role === 'doctor') {
                const pRes = await axios.get('http://localhost:5000/api/docs/patients', { headers });
                setPatients(pRes.data);
            }
        } catch (err) { console.error("Lỗi tải dữ liệu:", err); }
    };

    useEffect(() => { fetchData(); }, [isGlobalPage]);

    // LOGIC GỘP CÁC PART TRÙNG TÊN
    const displayDocs = documents.reduce((acc, current) => {
        const name = current.originalName || current.fileName.split(' (Part')[0];
        if (!acc.find(item => (item.originalName || item.fileName.split(' (Part')[0]) === name)) {
            acc.push({ ...current, displayName: name });
        }
        return acc;
    }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return alert("Vui lòng chọn file!");
        const formData = new FormData();
        formData.append('file', file);
        formData.append('isGlobal', isGlobalPage ? 'true' : 'false');

        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/docs/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
            });
            alert("Nạp tri thức thành công!");
            setFile(null);
            fetchData();
        } catch (err) { alert("Lỗi: " + (err.response?.data?.error || err.message)); }
        finally { setLoading(false); }
    };

    const handleShare = async (pId) => {
        try {
            await axios.post('http://localhost:5000/api/docs/share', { fileName: selectedFileName, patientId: pId }, { headers: { Authorization: `Bearer ${token}` } });
            alert("Đã gán thành công!");
            setShowModal(false);
            fetchData();
        } catch (err) { alert("Lỗi chia sẻ"); }
    };

    // Gửi tên file gốc để xóa sạch các Part
    const handleDeleteDocument = async (fileName) => {
        if (!window.confirm(`Xác nhận xóa vĩnh viễn file: ${fileName}?`)) return;
        try {
            const headers = { Authorization: `Bearer ${token}` };
            await axios.delete(`http://localhost:5000/api/docs/delete/${encodeURIComponent(fileName)}`, { headers });
            alert("Đã xóa toàn bộ các mảnh tri thức thành công!");
            fetchData(); 
        } catch (err) {
            alert("Lỗi khi xóa: " + (err.response?.data?.error || err.message));
        }
    };

    const handleUnshare = async (fileId, pId) => {
        if (!window.confirm("Xác nhận thu hồi quyền truy cập của bệnh nhân này?")) return;
        try {
            const headers = { Authorization: `Bearer ${token}` };
            await axios.post('http://localhost:5000/api/docs/unshare', 
                { fileId: fileId, patientId: pId }, 
                { headers }
            );
            alert("Đã hủy quyền truy cập thành công!");
            fetchData();
        } catch (err) { alert("Lỗi khi hủy gán"); }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto font-['Roboto'] relative">
            <h2 className="text-2xl font-black text-[#1f2937] mb-8 uppercase tracking-tight">
                {isGlobalPage ? "Kho tri thức chung" : "Kho hồ sơ riêng"}
            </h2>
            
            {((user?.role === 'admin' && isGlobalPage) || (user?.role === 'doctor' && !isGlobalPage)) && (
                <div className="bg-white p-10 rounded-[40px] border-2 border-dashed border-[#e5e7eb] flex flex-col items-center justify-center shadow-sm mb-12">
                    <AiOutlineCloudUpload size={40} className="text-[#2563eb] mb-4" />
                    <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} className="hidden" id="fileInput"/>
                    <label htmlFor="fileInput" className="cursor-pointer px-8 py-4 bg-[#f3f4f6] rounded-2xl font-bold mb-6 hover:bg-gray-200 transition-colors">
                        {file ? file.name : "Chọn file PDF"}
                    </label>
                    <button onClick={handleUpload} disabled={!file || loading} className="bg-[#2563eb] text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-700 disabled:bg-gray-400">
                        {loading ? "ĐANG XỬ LÝ..." : "NẠP VÀO HỆ THỐNG"}
                    </button>
                </div>
            )}

            <div className="space-y-4">
                {displayDocs.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-6 bg-white rounded-[32px] border border-[#f3f4f6] shadow-sm hover:border-blue-100 transition-all">
                        <div className="flex items-center gap-5">
                            <AiOutlineFilePdf size={32} className="text-red-500" />
                            <div>
                                <p className="font-extrabold text-[#1f2937] text-lg">{doc.displayName}</p>
                                {doc.sharedWith && doc.sharedWith.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {doc.sharedWith.map((pId) => (
                                            <span key={pId} className="text-[11px] bg-blue-50 text-blue-600 px-2 py-1 rounded-lg flex items-center gap-2 border border-blue-100">
                                                ID BN: {pId.substring(18)} 
                                                <button onClick={() => handleUnshare(doc._id, pId)} className="text-red-500 font-bold hover:scale-125 transition-transform">×</button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            {/* NÚT XEM MỞ MODAL */}
                            <button 
                                onClick={() => setViewFile(`http://localhost:5000/${doc.fileUrl}`)} 
                                className="bg-[#f3f4f6] px-6 py-3 rounded-xl font-bold hover:bg-gray-200"
                            >
                                Xem
                            </button>
                            
                            {/* NÚT XÓA: Dùng doc.displayName để xóa sạch các Part */}
                            {((user?.role === 'doctor' && !isGlobalPage) || (user?.role === 'admin' && isGlobalPage)) && (
                                <button 
                                    onClick={() => handleDeleteDocument(doc.displayName)} 
                                    className="bg-red-50 text-red-600 px-6 py-3 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-colors"
                                >
                                    Xóa
                                </button>
                            )}

                            {user?.role === 'doctor' && !isGlobalPage && (
                                <button onClick={() => { setSelectedFileName(doc._id); setShowModal(true); }} className="bg-[#eff6ff] text-[#2563eb] px-6 py-3 rounded-xl font-bold hover:bg-blue-100">Gán bệnh nhân</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL XEM PDF TRỰC TIẾP */}
            {viewFile && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
                    <div className="bg-white w-full max-w-6xl h-[92vh] rounded-[40px] overflow-hidden flex flex-col relative shadow-2xl border border-gray-100">
                        <div className="p-5 border-b flex justify-between items-center bg-gray-50/50">
                            <span className="font-black text-gray-700 uppercase tracking-tight">Chi tiết tài liệu</span>
                            <button onClick={() => setViewFile(null)} className="w-10 h-10 flex items-center justify-center bg-white text-gray-500 rounded-full shadow-sm hover:bg-red-500 hover:text-white transition-all">
                                <AiOutlineClose size={20} />
                            </button>
                        </div>
                        <div className="flex-1 bg-gray-100">
                            <iframe src={`${viewFile}#toolbar=1`} className="w-full h-full border-none" title="PDF Preview" />
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL CHỌN BỆNH NHÂN */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-lg rounded-[40px] p-10 shadow-2xl">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-[#1f2937]">Chọn bệnh nhân</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500"><IoCloseOutline size={28}/></button>
                        </div>
                        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                            {patients.map(p => (
                                <div key={p._id} onClick={() => handleShare(p._id)} className="p-5 border-2 border-[#f3f4f6] rounded-[24px] hover:border-[#2563eb] cursor-pointer flex items-center gap-4 transition-all">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center font-bold text-[#2563eb]">
                                        {p.fullName ? p.fullName.charAt(0).toUpperCase() : 'P'}
                                    </div>
                                    <p className="font-bold text-[#374151]">{p.fullName || p.username}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default KnowledgePage;