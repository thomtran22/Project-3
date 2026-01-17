import React, { useState } from 'react';

const LoginForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[16px] font-['Roboto']">
      {/* Tên đăng nhập */}
      <div className="flex flex-col gap-[6px]">
        <label className="text-[14px] font-[600] text-[#374151] text-left">Tên đăng nhập <span className="text-[#BE2135]">*</span></label>
        <input
          name="username"
          type="text"
          required
          onChange={handleChange}
          className="w-full h-[40px] border-[1px] border-[#d1d5db] rounded-[6px] px-[12px] text-[15px] outline-none focus:border-[#2563eb] transition-all"
          placeholder="Nhập tên đăng nhập..."
        />
      </div>

      {/* Mật khẩu */}
      <div className="flex flex-col gap-[6px]">
        <div className="flex justify-between items-center">
          <label className="text-[14px] font-[600] text-[#374151]">Mật khẩu <span className="text-[#BE2135]">*</span></label>
        </div>
        <input
          name="password"
          type="password"
          required
          onChange={handleChange}
          className="w-full h-[40px] border-[1px] border-[#d1d5db] rounded-[6px] px-[12px] text-[15px] outline-none focus:border-[#2563eb] transition-all"
          placeholder="Nhập mật khẩu..."
        />
      </div>

      {/* Nút Đăng nhập */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full h-[42px] mt-[10px] rounded-[8px] text-white font-[700] text-[16px] transition-all ${
          loading ? 'bg-[#9ca3af]' : 'bg-[#2563eb] hover:bg-[#1e40af] active:scale-[0.98]'
        }`}
      >
        {loading ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP'}
      </button>
    </form>
  );
};

export default LoginForm;