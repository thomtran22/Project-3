import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { AiOutlineCloudUpload, AiOutlineFilePdf, AiOutlineDelete, AiOutlineGlobal, AiOutlineClose } from "react-icons/ai";

const AdminKnowledge = () => {
    const [docs, setDocs] = useState([]);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [userRole, setUserRole] = useState('');
    const [viewFile, setViewFile] = useState(null); // State lưu URL file để hiển thị Modal

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const decoded = jwtDecode(token);
                setUserRole(decoded.role);
            }
            const res = await axios.get('http://localhost:5000/api/docs/global', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDocs(Array.isArray(res.data) ? res.data : []);
        } catch (err) { console.error("Lỗi lấy dữ liệu:", err); }
    };

    useEffect(() => { fetchData(); }, []);

    // 1. Logic gộp các Part kiến thức thành 1 file duy nhất để hiển thị
    const displayDocs = docs.reduce((acc, current) => {
        const name = current.originalName || current.fileName.split(' (Part')[0];
        if (!acc.find(item => (item.originalName || item.fileName.split(' (Part')[0]) === name)) {
            acc.push({ ...current, displayName: name });
        }
        return acc;
    }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('isGlobal', true);

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/docs/upload', formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            setFile(null);
            fetchData();
            alert("Đã cập nhật tri thức mới thành công!");
        } catch (err) { alert("Lỗi tải lên!"); }
        finally { setLoading(false); }
    };

    const handleDelete = async (fileName) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa toàn bộ tri thức của file: ${fileName}?`)) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/docs/delete/${encodeURIComponent(fileName)}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (err) { alert("Lỗi khi xóa!"); }
    };

    return (
        <div className="p-10 bg-[#f9fafb] min-h-screen font-['Roboto'] text-[#1f2937] relative">
            <h2 className="text-2xl font-bold mb-10 uppercase tracking-tight">Kho tri thức chung</h2>

            {/* Form nạp file - Chỉ Admin mới thấy */}
            {userRole === 'admin' && (
                <div className="bg-white p-10 rounded-[32px] shadow-sm border-2 border-dashed border-blue-100 text-center mb-10 transition-all hover:border-blue-400">
                    <input type="file" id="upload" hidden onChange={(e) => setFile(e.target.files[0])} accept=".pdf" />
                    <label htmlFor="upload" className="cursor-pointer flex flex-col items-center group">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <AiOutlineCloudUpload size={36} />
                        </div>
                        <p className="font-bold text-gray-700 text-lg">{file ? file.name : "Nhấn để chọn tài liệu PDF hệ thống"}</p>
                    </label>
                    {file && (
                        <button onClick={handleUpload} disabled={loading} className="mt-6 px-10 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-lg hover:scale-105 transition-all">
                            {loading ? "ĐANG XỬ LÝ DỮ LIỆU..." : "XÁC NHẬN NẠP KIẾN THỨC"}
                        </button>
                    )}
                </div>
            )}

            {/* Danh sách dải trắng bo góc 32px */}
            <div className="flex flex-col gap-4">
                {displayDocs.length > 0 ? displayDocs.map((doc) => (
                    <div key={doc._id} className="bg-white p-6 rounded-[32px] shadow-sm flex items-center justify-between border border-transparent hover:border-gray-100 transition-all">
                        <div className="flex items-center gap-6">
                            <AiOutlineFilePdf size={35} className="text-red-500" />
                            <div>
                                <p className="font-bold text-[17px]">{doc.displayName}</p>
                                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-bold uppercase tracking-widest mt-1 inline-block">
                                    Hệ thống
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Nút Xem: Mở Modal thay vì tải về */}
                            <button 
                                onClick={() => setViewFile(`http://localhost:5000/${doc.fileUrl}`)}
                                className="px-8 py-2.5 bg-[#f3f4f6] text-[#1f2937] rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
                            >
                                Xem
                            </button>
                            
                            {userRole === 'admin' && (
                                <button 
                                    onClick={() => handleDelete(doc.originalName || doc.displayName)}
                                    className="p-2 text-gray-300 hover:text-red-500 transition-all"
                                >
                                    <AiOutlineDelete size={22} />
                                </button>
                            )}
                        </div>
                    </div>
                )) : (
                    <div className="py-20 text-center text-gray-400 italic bg-white rounded-[32px] border border-dashed">
                        Chưa có tài liệu tri thức nào được nạp vào hệ thống.
                    </div>
                )}
            </div>

            {/* MODAL XEM PDF TRỰC TIẾP TRÊN TRANG */}
            {viewFile && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
                    <div className="bg-white w-full max-w-6xl h-[92vh] rounded-[40px] overflow-hidden flex flex-col relative shadow-2xl border border-gray-100">
                        {/* Header của Modal */}
                        <div className="p-5 border-b flex justify-between items-center bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <AiOutlineGlobal className="text-blue-600" size={24} />
                                <span className="font-black text-gray-700 uppercase tracking-tight">Trình xem tài liệu hệ thống</span>
                            </div>
                            <button 
                                onClick={() => setViewFile(null)}
                                className="w-10 h-10 flex items-center justify-center bg-white text-gray-500 rounded-full shadow-sm hover:bg-red-500 hover:text-white transition-all"
                            >
                                <AiOutlineClose size={20} />
                            </button>
                        </div>
                        
                        {/* Nhúng PDF Viewer */}
                        <div className="flex-1 bg-gray-100">
                            <iframe 
                                src={`${viewFile}#toolbar=1`} 
                                className="w-full h-full border-none"
                                title="PDF Preview"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminKnowledge;