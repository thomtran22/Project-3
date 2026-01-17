import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IoPeopleOutline, IoMedkitOutline, IoChatbubblesOutline } from "react-icons/io5";

const AdminDashboard = () => {
    const [stats, setStats] = useState({ doctors: 0, patients: 0, totalFiles: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                // Gọi các API để đếm số lượng
                const [resDocs, resPats] = await Promise.all([
                    axios.get('http://localhost:5000/api/admin/doctors', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('http://localhost:5000/api/admin/patients', { headers: { Authorization: `Bearer ${token}` } })
                ]);
                setStats({
                    doctors: resDocs.data.length,
                    patients: resPats.data.length,
                    totalFiles: 0 
                });
            } catch (err) { console.error(err); }
        };
        fetchStats();
    }, []);

    const cards = [
        { title: 'Tổng Bác sĩ', count: stats.doctors, icon: <IoMedkitOutline />, color: 'bg-blue-600' },
        { title: 'Tổng Bệnh nhân', count: stats.patients, icon: <IoPeopleOutline />, color: 'bg-green-600' },
        { title: 'Tài liệu chung', count: stats.totalFiles, icon: <IoChatbubblesOutline />, color: 'bg-orange-600' },
    ];

    return (
        <div className="p-8 bg-[#f9fafb] min-h-screen">
            <h2 className="text-2xl font-black text-[#1f2937] mb-8">BẢNG ĐIỀU KHIỂN QUẢN TRỊ</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cards.map((card, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-[32px] shadow-sm flex items-center gap-5 border border-gray-100">
                        <div className={`w-14 h-14 ${card.color} text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg`}>
                            {card.icon}
                        </div>
                        <div>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{card.title}</p>
                            <p className="text-2xl font-black text-[#1f2937]">{card.count}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;