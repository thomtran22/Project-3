import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RegisterForm = ({ onSubmit, loading}) => {
  const [provinces, setProvinces] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    homeTown: '',
    username: '',
    password: '',
    role: 'patient',
    medical_specialty: ''
  });

  //Lấy tỉnh thành tự động
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await axios.get('https://provinces.open-api.vn/api/p/');
        setProvinces(res.data);
        if (res.data.length > 0) {
          setFormData(prev => ({ ...prev, homeTown: res.data[0].name }));
        }
      } catch (err) {
        console.error("Không lấy được danh sách tỉnh thành", err);
      }
    };
    fetchProvinces();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  return (
    <form onSubmit={(e)=> {
      e.preventDefault(); 
      onSubmit(formData);
    }} className="flex flex-col gap-[20px] font-['Roboto']">
      {/* Họ và tên */}
      <div className="flex flex-col gap-[6px]">
        <label className="text-[15px] font-[600] text-[#374151] text-left">Họ và tên <span className="text-[#BE2135]">*</span></label>
        <input 
          name="fullName"
          type="text"
          required
          placeholder="Nhập họ và tên..."
          className="w-full h-[42px] border-[1px] border-[#d1d5db] rounded-[8px] px-[14px] text-[16px] outline-none focus:border-[#2563eb] transition-all"
          onChange={handleChange}/>
      </div>
      
      <div className="grid grid-cols-2 gap-[15px]">
        {/* Ngày tháng năm sinh */}
        <div className="flex flex-col gap-[6px]">
          <label className="text-[15px] font-[600] text-[#374151] text-left">Ngày sinh <span className="text-[#BE2135]">*</span></label>
          <input
            name="dateOfBirth"
            type="date"
            required
            className="w-full h-[42px] border-[1px] border-[#d1d5db] rounded-[8px] px-[14px] text-[16px] outline-none focus:border-[#2563eb]"
            onChange={handleChange}/>
        </div>
        {/* Quê quán */}
        <div className="flex flex-col gap-[6px]">
          <label className="text-[15px] font-[600] text-[#374151] text-left">Quê quán</label>
          <select
            name="homeTown"
            value={formData.homeTown}
            onChange={handleChange}
            className="w-full h-[42px] border-[1px] border-[#d1d5db] rounded-[8px] px-[14px] text-[16px] bg-[#ffffff] outline-none focus:border-[#2563eb]"
          >
            {provinces.length > 0 ? (
              provinces.map((p) => (
                <option key={p.code} value={p.name}>{p.name}</option>
              ))
            ) : (
              <option>Đang tải danh sách...</option>
            )}
          </select>
        </div>
      </div>

      {/* Tên đăng nhập */}
      <div className="flex flex-col gap-[6px]">
        <label className="text-[15px] font-[600] text-[#374151] text-left">Tên đăng nhập <span className="text-[#BE2135]">*</span></label>
        <input 
          name="username"
          type="text"
          required
          placeholder="Nhập tên đăng nhập..."
          className="w-full h-[42px] border-[1px] border-[#d1d5db] rounded-[8px] px-[14px] text-[16px] outline-none focus:border-[#2563eb]"
          onChange={handleChange}/>
      </div>

      {/* Mật khẩu */}
      <div className="flex flex-col gap-[6px]">
        <label className="text-[15px] font-[600] text-[#374151] text-left">Mật khẩu <span className="text-[#BE2135]">*</span></label>
        <input 
          name="password"
          type="password"
          required
          placeholder="Nhập mật khẩu..."
          className="w-full h-[42px] border-[1px] border-[#d1d5db] rounded-[8px] px-[14px] text-[16px] outline-none focus:border-[#2563eb] transition-all"
          onChange={handleChange}/>
      </div>

      {/* Vai trò */}
      <div className="flex flex-col gap-[6px]">
        <label className="text-[15px] font-[600] text-[#374151] text-left">Vai trò</label>
        <select 
          name="role"
          value={formData.role}
          className="w-full h-[42px] border-[1px] border-[#d1d5db] rounded-[8px] px-[14px] text-[16px] bg-[#ffffff] outline-none focus:border-[#2563eb"  onChange={handleChange}>
          <option value="patient">Bệnh nhân</option>
          <option value="doctor">Bác sĩ</option>
        </select>
      </div>

      {/* Chuyên khoa */}
      {formData.role === 'doctor' && (
        <div className="flex flex-col gap-[6px] animate-in fade-in duration-[400ms]">
          <label className="text-[15px] font-[600] text-[#374151] text-left">Chuyên khoa y tế <span className="text-[#BE2135]">*</span></label>
          <select
            name="medical_specialty"
            value={formData.medical_specialty}
            onChange={handleChange}
            required={formData.role === 'doctor'}
            className="w-full h-[42px] border-[1px] border-[#10b981] rounded-[8px] px-[14px] text-[16px] bg-[#ffffff] outline-none focus:border-[#059669]"
          >
            <option value="">-- Chọn chuyên khoa --</option>
            <option value="Tim mạch">Tim mạch</option>
          </select>
        </div>
      )}

      {/* Nút Đăng ký */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full h-[48px] mt-[10px] rounded-[10px] text-[#ffffff] font-[700] text-[17px] ${
          loading ? 'bg-[#9ca3af]' : 'bg-[#2563eb] hover:bg-[#1e40af]'
        } transition-all duration-[200ms] shadow-[0px_4px_6px_rgba(0,0,0,0.1)]`}
      >
        {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ TÀI KHOẢN'}
      </button>
    </form>
  );
};

export default RegisterForm;
