import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { BsChatDots, BsShieldCheck } from "react-icons/bs";
import { GoHistory } from "react-icons/go";
import { IoPersonOutline, IoPeopleOutline, IoMedkitOutline } from "react-icons/io5";
import { CiLock, CiFolderOn } from "react-icons/ci";
import { AiOutlineGlobal } from "react-icons/ai";
import { MdLogout } from "react-icons/md";

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState('patient');
  const [userName, setUserName] = useState('Người dùng');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const role = decoded.role;
        if (role) setUserRole(role);
        setUserName(decoded.username);

        // Chặn truy cập trái phép vào các trang bắt đầu bằng /admin
        const isAdminPath = location.pathname.startsWith('/admin');
        if (isAdminPath && role !== 'admin') {
          alert("Bạn không có quyền truy cập khu vực Quản trị!");
          return navigate(role === 'doctor' ? '/manage-patients' : '/chat');
        }
      } catch (error) {
        localStorage.clear();
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [location.pathname, navigate]);

  // Khai báo menu linh hoạt
  let menuItems = [];

  if (userRole === 'admin') {
    menuItems = [
      { name: 'Bảng điều khiển', path: '/admin-dashboard', icon: <BsShieldCheck /> },
      { name: 'Quản lý Bác sĩ', path: '/admin/doctors', icon: <IoMedkitOutline /> },
      { name: 'Quản lý Bệnh nhân', path: '/admin/patients', icon: <IoPeopleOutline /> },
      { name: 'Kho tri thức chung', path: '/knowledge-global', icon: <AiOutlineGlobal /> },
      { name: 'Hồ sơ cá nhân', path: '/profile', icon: <IoPersonOutline /> },
    ];
  } else {
    // Menu dùng chung cho Bác sĩ và Bệnh nhân
    menuItems = [
      { name: 'Cuộc trò chuyện mới', path: '/chat', icon: <BsChatDots /> },
      { name: 'Lịch sử chat', path: '/history', icon: <GoHistory /> },
      { name: 'Kho tri thức riêng', path: '/knowledge-private', icon: <CiLock /> },
    ];

    // Riêng bác sĩ có thêm quản lý bệnh nhân
    if (userRole === 'doctor') {
      menuItems.push({ name: 'Quản lý bệnh nhân', path: '/manage-patients', icon: <CiFolderOn /> });
    }

    // TẤT CẢ (Bác sĩ & Bệnh nhân) đều thấy Kho tri thức chung ở cuối
    menuItems.push({ name: 'Kho tri thức chung', path: '/knowledge-global', icon: <AiOutlineGlobal /> });
    menuItems.push({ name: 'Hồ sơ cá nhân', path: '/profile', icon: <IoPersonOutline /> });
  }

  return (
    <div className="flex h-screen bg-[#f3f4f6] font-['Roboto']">
      <div className="w-[280px] bg-white border-r border-[#e5e7eb] flex flex-col shadow-sm text-[15px]">
        <div className="p-6 border-b">
          <h1 className="text-xl font-black text-[#2563eb]">Chatbot for life</h1>
          <div className="mt-5 p-3 bg-[#f8fafc] rounded-xl flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${userRole === 'admin' ? 'bg-red-500' : 'bg-[#2563eb]'}`}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-[#1f2937] truncate w-[140px]">{userName}</p>
              <p className="text-[10px] font-bold uppercase text-gray-400">{userRole === 'admin' ? 'Quản trị viên' : userRole === 'doctor' ? 'Bác sĩ' : 'Bệnh nhân'}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname === item.path ? 'bg-[#2563eb] text-white shadow-md' : 'text-[#4b5563] hover:bg-[#f3f4f6]'}`}>
              <span className="text-lg">{item.icon}</span>
              <span className="font-semibold">{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-all">
            <MdLogout size={18} /> Đăng xuất
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto bg-[#f9fafb]">{children}</div>
    </div>
  );
};
export default MainLayout;