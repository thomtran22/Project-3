import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { IoSearchOutline } from "react-icons/io5";
import { AiOutlineEye } from "react-icons/ai";
import { HiOutlineUserGroup } from "react-icons/hi";

const ManagePatients = () => {
    const [patients, setPatients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState('');

    const fetchPatients = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            // Giải mã token để lấy role
            const decoded = jwtDecode(token);
            const role = decoded.role;
            setUserRole(role);

            // Chọn API dựa trên role (Dùng chung giao diện, khác đầu số API)
            const apiUrl = role === 'admin' 
                ? 'http://localhost:5000/api/admin/patients' 
                : 'http://localhost:5000/api/docs/patients'; 
            const res = await axios.get(apiUrl, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPatients(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Lỗi lấy danh sách:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const filteredPatients = patients.filter(p =>
        p.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center">Đang tải dữ liệu...</div>;

    return (
        <div className="p-8 font-['Roboto'] bg-[#f9fafb] min-h-screen">
            <div className="flex items-center gap-4 mb-10">
                <div className={`p-4 bg-white rounded-2xl shadow-sm ${userRole === 'admin' ? 'text-red-500' : 'text-[#2563eb]'}`}>
                    <HiOutlineUserGroup size={32} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-[#1f2937]">
                        {userRole === 'admin' ? 'Quản trị Bệnh nhân' : 'Danh sách Bệnh nhân'}
                    </h2>
                    <p className="text-gray-500 text-sm font-medium">
                        {userRole === 'admin' ? 'Chế độ: Toàn quyền hệ thống' : 'Chế độ: Bác sĩ điều trị'}
                    </p>
                </div>
            </div>

            <div className="relative max-w-2xl mb-8">
                <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Tìm bệnh nhân theo tên..."
                    className="w-full pl-12 pr-4 py-4 bg-white border border-transparent rounded-2xl outline-none focus:border-[#2563eb] shadow-sm transition-all"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-[#f8fafc]">
                        <tr className="text-gray-400 text-[11px] uppercase tracking-widest font-bold">
                            <th className="px-8 py-5">Bệnh nhân</th>
                            <th className="px-8 py-5">Ngày tham gia</th>
                            <th className="px-8 py-5 text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredPatients.map((patient) => (
                            <tr key={patient._id} className="hover:bg-[#fcfdfe] transition-colors">
                                <td className="px-8 py-5 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center font-bold">
                                        {patient.username?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#1f2937]">{patient.username}</p>
                                        <p className="text-[10px] text-gray-400 font-mono italic">{patient.role}</p>
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-sm text-gray-500 font-medium">
                                    {new Date(patient.createdAt).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="px-8 py-5 text-center">
                                    <button className="px-5 py-2.5 bg-[#f0f9ff] text-[#0284c7] rounded-xl text-xs font-bold hover:bg-[#0284c7] hover:text-white transition-all">
                                        <AiOutlineEye size={16} /> Hồ sơ
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManagePatients;