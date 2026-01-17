import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';

const RegisterPage = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [msg, setMsg] = useState('');
    const handleRegister = async (formData) => {
        setLoading(true);
        setMsg('');
        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', formData);
            setMsg(res.data.msg);
            // Đăng ký xong thì chuyển hướng người dùng sang trang Đăng nhập
            setTimeout(() => {
                navigate('/login');
            }, 2000);;
        } catch (err) {
            // Hiển thị lỗi từ Backend (ví dụ: Trùng tên đăng nhập)
            setMsg(err.response?.data?.msg || "Có lỗi xảy ra khi đăng ký");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-[15px] font-['Roboto']">
            {msg && (
                <div className="fixed top-5 right-5 z-[9999] animate-in slide-in-from-right duration-300">
                    <div className="bg-[#10b981] text-white px-5 py-3 rounded-lg shadow-2xl flex items-center gap-3 border-b-4 border-green-700">
                        <div className="bg-white/20 rounded-full p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <span className="font-[600] text-[15px]">{msg}</span>
                    </div>
                </div>
            )}
            {/* Box chứa nội dung chính */}
            <div className="bg-[#ffffff] w-full max-w-[500px] rounded-[16px] shadow-[0px_10px_25px_rgba(0,0,0,0.1)] px-[40px] py-[10px]">

                {/* Tiêu đề trang */}
                <div className="text-center mb-[30px]">
                    <h1 className="text-[28px] font-[800] text-[#1f2937] mb-[8px]">Tạo tài khoản</h1>
                </div>

                {/* Gọi Component RegisterForm và truyền dữ liệu */}
                <RegisterForm onSubmit={handleRegister} loading={loading} />

                {/* Liên kết quay lại trang Đăng nhập */}
                <div className="mt-[25px] pt-[20px] border-t-[1px] border-[#e5e7eb] text-center">
                    <p className="text-[14px] text-[#4b5563]">
                        Bạn đã có tài khoản rồi?{' '}
                        <Link
                            to="/login"
                            className="text-[#2563eb] font-[700] hover:underline transition-all"
                        >
                            Đăng nhập tại đây
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;