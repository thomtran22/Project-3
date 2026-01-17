import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import LoginForm from '../components/LoginForm';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (formData) => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
    
      localStorage.setItem('token', res.data.token);
      //Điều hướng dựa trên role
      const role = res.data.user.role;
      if (role === 'doctor') {
        navigate('/doctor-dashboard');
      } else if (role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/chat');
      }
    } catch (err) {
      alert(err.response?.data?.msg || "Sai tài khoản hoặc mật khẩu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-[20px] font-['Roboto']">
      <div className="bg-white w-full max-w-[400px] rounded-[12px] shadow-lg p-[35px]">
        <LoginForm onSubmit={handleLogin} loading={loading} />
        <div className="mt-[25px] pt-[20px] border-t-[1px] border-[#e5e7eb] text-center">
          <p className="text-[14px] text-[#4b5563]">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-[#2563eb] font-[700] hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;