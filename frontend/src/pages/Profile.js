import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  IoPersonCircleOutline, 
  IoLocationOutline, 
  IoCalendarOutline, 
  IoRibbonOutline, 
  IoMailOutline, 
} from "react-icons/io5";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu DB:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // Nếu đang tải hoặc user chưa có dữ liệu thì hiện loading
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen text-[16px] font-[600] text-[#6b7280] animate-pulse">
        Đang đồng bộ dữ liệu thực tế từ Database...
      </div>
    );
  }

  return (
    <div className="p-[40px] max-w-[1100px] mx-auto animate-fadeIn">
      <div className="grid grid-cols-[320px_1fr] gap-[30px]">
        
        {/* CỘT TRÁI: THẺ TÀI KHOẢN */}
        <div className="bg-[#ffffff] p-[40px] rounded-[35px] border-[1px] border-[#f3f4f6] shadow-[0_20px_50px_rgba(0,0,0,0.02)] flex flex-col items-center h-fit">
          <div className="relative mb-[25px]">
            <div className="w-[130px] h-[130px] bg-[#2563eb] rounded-[30px] flex items-center justify-center text-[#ffffff] text-[48px] font-[800] shadow-[0_25px_50px_-12px_rgba(37,99,235,0.4)]">
              {user.username?.charAt(0).toUpperCase()}
            </div>
          </div>
          
          <h3 className="text-[24px] font-[900] text-[#111827] text-center leading-[1.2]">
            {user.fullName}
          </h3>
          
          <div className="mt-[15px] px-[18px] py-[6px] bg-[#eff6ff] rounded-[99px] border-[1px] border-[#dbeafe]">
            <span className="text-[10px] font-[800] text-[#2563eb] uppercase tracking-[1.5px]">
              {user.role === 'doctor' ? 'Bác sĩ' : 'Bệnh nhân'}
            </span>
          </div>
        </div>

        {/* CỘT PHẢI: CHI TIẾT DỮ LIỆU */}
        <div className="flex flex-col gap-[30px]">
          <div className="bg-[#ffffff] p-[45px] rounded-[40px] border-[1px] border-[#f3f4f6] shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-[40px]">
                <h4 className="text-[20px] font-[900] text-[#111827] flex items-center gap-[12px]">
                  <span className="w-[5px] h-[24px] bg-[#2563eb] rounded-[10px]"></span>
                  Thông tin hồ sơ chi tiết
                </h4>
            </div>

            <div className="grid grid-cols-[1fr_1fr] gap-x-[50px] gap-y-[40px]">
              <DetailItem icon={<IoMailOutline />} label="Tên tài khoản" value={user.username} />
              <DetailItem icon={<IoLocationOutline />} label="Quê quán" value={user.homeTown} />
              <DetailItem 
                icon={<IoCalendarOutline />} 
                label="Ngày sinh" 
                value={user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN') : null} 
              />
              <DetailItem icon={<IoPersonCircleOutline />} label="Họ và tên" value={user.fullName} />
              
              {user.role === 'doctor' && (
                <div className="col-span-2 p-[25px] bg-[#f8fafc] rounded-[24px] border-[1px] border-[#e2e8f0] mt-[10px]">
                  <DetailItem 
                    icon={<IoRibbonOutline />} 
                    label="Lĩnh vực chuyên môn" 
                    value={user.medical_specialty} 
                    isSpecial 
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ icon, label, value, isSpecial = false }) => (
  <div className="flex gap-[18px] items-start group">
    <div className="w-[48px] h-[48px] bg-[#f9fafb] rounded-[16px] flex items-center justify-center text-[#9ca3af] text-[22px] group-hover:bg-[#2563eb] group-hover:text-[#ffffff] transition-all duration-300">
      {icon}
    </div>
    <div className="flex flex-col gap-[2px]">
      <p className="text-[11px] font-[800] text-[#9ca3af] uppercase tracking-[1px]">{label}</p>
      <p className={`text-[16px] font-[700] ${isSpecial ? 'text-[#2563eb]' : 'text-[#374151]'}`}>
        {value || "Đang tải dữ liệu..."}
      </p>
    </div>
  </div>
);

export default ProfilePage;