import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  UserCircleIcon, LocationMarkerIcon, 
  BriefcaseIcon, CameraIcon, IdentificationIcon, MailIcon,
  ArrowLeftIcon,
  EyeIcon, EyeOffIcon // Import icon mắt
} from "@heroicons/react/solid";

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    username: (user as any)?.username || "", 
    email: user?.email || "",
    address: "Hà Nội, Việt Nam", 
  });

  // State quản lý ẩn/hiện thông tin (Mặc định là false - ẩn)
  const [showSensitiveData, setShowSensitiveData] = useState({
    username: false,
    email: false
  });

  // Hàm toggle trạng thái
  const toggleVisibility = (field: "username" | "email") => {
    setShowSensitiveData(prev => ({
        ...prev,
        [field]: !prev[field]
    }));
  };

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        full_name: user.full_name || "",
        username: (user as any).username || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  // Helper render text hoặc dấu sao
  const renderHiddenText = (text: string, isVisible: boolean) => {
      if (isVisible) return text;
      return "••••••••••••••••";
  };

  return (
    <div className="min-h-screen bg-[#0f0518] text-slate-200 font-sans pb-20 relative selection:bg-[#9c00e5] selection:text-white">
      
      {/* --- BACKGROUND DECORATION --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-[#9c00e5] opacity-[0.08] blur-[100px] rounded-full"></div>
         <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-[#4a00e0] opacity-[0.08] blur-[100px] rounded-full"></div>
      </div>

      {/* --- NÚT BACK TO HOME --- */}
      <div className="absolute z-50 top-6 left-6">
        <button 
            onClick={() => navigate('/teacher/home')}
            className="group flex items-center gap-2 px-5 py-2.5 bg-black/20 hover:bg-[#ffe400] hover:text-black border border-white/10 hover:border-[#ffe400] backdrop-blur-md rounded-full transition-all duration-300 shadow-lg"
        >
            <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-bold">Trang chủ</span>
        </button>
      </div>

      {/* --- HEADER SECTION --- */}
      <div className="relative z-10">
        {/* Banner */}
        <div className="h-60 w-full bg-gradient-to-r from-[#240b36] via-[#2a0845] to-[#150a22] relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0518] to-transparent"></div>
        </div>
        
        <div className="container max-w-3xl px-4 mx-auto">
            <div className="relative flex flex-col items-center -mt-20">
                
                {/* Avatar */}
                <div className="relative mb-4 group">
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-[#ffe400] to-[#9c00e5] rounded-full opacity-70 blur group-hover:opacity-100 transition duration-500"></div>
                    <div className="relative w-36 h-36 rounded-full border-[4px] border-[#0f0518] bg-[#1a0b2e] overflow-hidden shadow-2xl">
                        {user?.avatar_url ? (
                             <img src={user.avatar_url} alt="Avatar" className="object-cover w-full h-full" />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">
                                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "V"}
                            </div>
                        )}
                    </div>
                </div>

                {/* Name & Badges */}
                <div className="flex flex-col items-center space-y-3 text-center">
                    <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl drop-shadow-lg">
                        {user?.full_name || "Võ Đình Trọng"}
                    </h1>
                    
                    <div className="flex flex-wrap justify-center gap-3">
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffe400]/10 text-[#ffe400] border border-[#ffe400]/20 shadow-[0_0_10px_rgba(255,228,0,0.1)]">
                            <BriefcaseIcon className="w-3.5 h-3.5" /> {user?.role || "Teacher"}
                        </span>
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-slate-400 bg-white/5 border border-white/5">
                            <LocationMarkerIcon className="w-3.5 h-3.5 text-[#9c00e5]" /> {formData.address}
                        </span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="container relative z-10 max-w-3xl px-4 mx-auto mt-10">
        <div className="bg-[#150a22]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
            
            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#9c00e5] opacity-10 blur-[50px] rounded-full pointer-events-none"></div>

            {/* Title */}
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-[#9c00e5]/20 to-transparent border border-[#9c00e5]/20 text-[#d05eff]">
                    <UserCircleIcon className="w-6 h-6" /> 
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Thông tin tài khoản</h2>
                    <p className="text-sm text-slate-500">Thông tin định danh của bạn trên hệ thống</p>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                
                {/* Card: Username */}
                <div className="group relative bg-[#0a0412]/40 border border-white/5 rounded-2xl p-4 hover:border-[#9c00e5]/30 transition-colors duration-300">
                    <div className="flex items-center gap-3 mb-2">
                        <IdentificationIcon className="w-4 h-4 text-slate-500" />
                        <label className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                            Tên đăng nhập
                        </label>
                    </div>
                    <div className="flex items-center justify-between pl-7">
                        <span className="font-mono text-sm tracking-wide md:text-base text-slate-200">
                            {renderHiddenText(formData.username || "giaovien", showSensitiveData.username)}
                        </span>
                        <button 
                            onClick={() => toggleVisibility('username')}
                            className="p-1.5 text-slate-500 hover:text-[#ffe400] hover:bg-white/5 rounded-lg transition-colors"
                            title={showSensitiveData.username ? "Ẩn" : "Hiện"}
                        >
                            {showSensitiveData.username ? (
                                <EyeOffIcon className="w-4 h-4" />
                            ) : (
                                <EyeIcon className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Card: Email */}
                <div className="group relative bg-[#0a0412]/40 border border-white/5 rounded-2xl p-4 hover:border-[#9c00e5]/30 transition-colors duration-300">
                    <div className="flex items-center gap-3 mb-2">
                        <MailIcon className="w-4 h-4 text-slate-500" />
                        <label className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                            Email
                        </label>
                    </div>
                    <div className="flex items-center justify-between pl-7">
                        <span className="pr-2 text-sm font-medium truncate md:text-base text-slate-200">
                             {renderHiddenText(formData.email || "teacher@gmail.com", showSensitiveData.email)}
                        </span>
                        <button 
                            onClick={() => toggleVisibility('email')}
                            className="p-1.5 text-slate-500 hover:text-[#ffe400] hover:bg-white/5 rounded-lg transition-colors shrink-0"
                            title={showSensitiveData.email ? "Ẩn" : "Hiện"}
                        >
                            {showSensitiveData.email ? (
                                <EyeOffIcon className="w-4 h-4" />
                            ) : (
                                <EyeIcon className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;