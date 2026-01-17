import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IoSearchOutline } from "react-icons/io5";
import { AiOutlineDelete } from "react-icons/ai";

const ManageDoctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [search, setSearch] = useState('');

    const fetchDoctors = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/admin/doctors', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDoctors(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchDoctors(); }, []);

    const filtered = doctors.filter(d => d.username.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="p-8">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-2xl font-black text-[#1f2937] uppercase">Quản lý Bác sĩ</h2>
                    <p className="text-gray-500 text-sm">Danh sách đội ngũ chuyên gia y tế</p>
                </div>
            </div>

            <div className="relative mb-6 max-w-md">
                <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Tìm tên bác sĩ..." 
                    className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-[32px] shadow-sm overflow-hidden border border-gray-50">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                            <th className="px-6 py-4">Bác sĩ</th>
                            <th className="px-6 py-4">Chuyên khoa</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4 text-center">Tác vụ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filtered.map(doc => (
                            <tr key={doc._id} className="hover:bg-blue-50/20 transition-colors">
                                <td className="px-6 py-4 flex items-center gap-3">
                                    <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold">{doc.username.charAt(0)}</div>
                                    <span className="font-bold text-gray-700">{doc.username}</span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{doc.medical_specialty || 'Chưa cập nhật'}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{doc.email}</td>
                                <td className="px-6 py-4 text-center">
                                    <button className="p-2 text-gray-300 hover:text-red-500"><AiOutlineDelete size={20}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageDoctors;