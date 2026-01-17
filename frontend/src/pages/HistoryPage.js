import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { GoHistory, GoChevronRight } from "react-icons/go";
import { MdDeleteOutline } from "react-icons/md";

const HistoryPage = () => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchHistories = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/chat/list?t=${Date.now()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setConversations(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Lỗi lấy lịch sử:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchHistories(); }, []);

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Xóa cuộc hội thoại này?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/chat/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setConversations(prev => prev.filter(c => c._id !== id));
        } catch (err) { alert("Lỗi khi xóa!"); }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto font-['Roboto'] min-h-screen">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#eff6ff] text-[#2563eb] rounded-xl"><GoHistory size={28} /></div>
                    <h2 className="text-2xl font-black text-[#1f2937] uppercase">Lịch sử tư vấn</h2>
                </div>
                <button onClick={fetchHistories} className="text-sm font-bold text-[#2563eb]">LÀM MỚI</button>
            </div>

            {conversations.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed">
                    <p className="text-[#9ca3af]">Chưa có lịch sử cuộc trò chuyện.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {conversations.map((item) => (
                        <div 
                            key={item._id}
                            onClick={() => navigate(`/chat/${item._id}`)} // Chuyển hướng kèm ID
                            className="group flex items-center justify-between p-5 bg-white rounded-2xl border hover:border-[#2563eb] transition-all cursor-pointer shadow-sm"
                        >
                            <div className="flex flex-col gap-1">
                                <h3 className="font-bold text-[#1f2937] group-hover:text-[#2563eb]">
                                    {item.title || "Cuộc trò chuyện mới"}
                                </h3>
                                <p className="text-[12px] text-[#9ca3af]">
                                    {new Date(item.createdAt).toLocaleString('vi-VN')}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <button onClick={(e) => handleDelete(e, item._id)} className="p-2 text-[#9ca3af] hover:text-[#ef4444]"><MdDeleteOutline size={22} /></button>
                                <GoChevronRight className="text-[#d1d5db]" size={20} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HistoryPage;