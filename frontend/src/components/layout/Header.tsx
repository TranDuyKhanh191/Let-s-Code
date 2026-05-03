import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
// Đảm bảo đường dẫn ảnh chính xác
import Logo from "../../assets/logo/z4731633710147_b8c7aee20afa54bd5d8be2decf7dd3d4-removebg-preview.png"; 
import { 
  HomeIcon, 
  BookOpenIcon, 
  LogoutIcon,
  MenuIcon,
  XIcon,
  UserCircleIcon,
  SearchIcon,
  ClockIcon 
} from "@heroicons/react/outline";

export default function Header() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // --- LOGIC ĐỒNG HỒ REAL-TIME ---
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString("vi-VN", {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });

  const formattedDate = currentTime.toLocaleDateString("vi-VN", {
      weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
  });

  const handleLogout = () => {
    logout();
    nav("/login");
  };

  const checkActive = (path) => {
    if (path === "/teacher/programs") {
      return location.pathname.includes("/teacher/programs") || location.pathname.includes("/teacher/courses");
    }
    if (path === "/teacher/profile") return location.pathname.includes("/teacher/profile");
    return location.pathname === path;
  };

  const menuItems = [
    { name: "Tổng quan", path: "/teacher/home", icon: <HomeIcon className="w-5 h-5" /> },
    { name: "Lớp học", path: "/teacher/programs", icon: <BookOpenIcon className="w-5 h-5" /> },
  ];

  return (
    <header className="sticky top-0 z-50 font-sans border-b shadow-2xl bg-[#1a0b2e]/80 backdrop-blur-xl border-white/5 transition-all duration-300">
      <div className="container px-4 mx-auto lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* --- LEFT: LOGO --- */}
          <Link to="/teacher/home" className="relative flex items-center shrink-0 group">
             <div className="absolute inset-0 bg-[#9c00e5] blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-full"></div>
             <img 
                src={Logo} 
                alt="LetsCode" 
                className="relative z-10 object-contain w-auto transition-all duration-500 h-14 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(255,228,0,0.5)]" 
             />
          </Link>

          {/* --- MIDDLE: MENU DESKTOP --- */}
          <nav className="hidden md:flex items-center gap-2 p-1.5 mx-4 border rounded-full bg-white/5 border-white/10 backdrop-blur-md shadow-inner">
            {menuItems.map((item) => {
              const isActive = checkActive(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-500 overflow-hidden group
                    ${isActive 
                      ? "text-white shadow-[0_0_20px_rgba(156,0,229,0.3)]" 
                      : "text-gray-400 hover:text-white"
                    }`}
                >
                  <div className={`absolute inset-0 transition-all duration-500 ease-out
                    ${isActive 
                        ? "bg-gradient-to-r from-[#9c00e5] to-[#5b0085] opacity-100" 
                        : "bg-white/10 opacity-0 group-hover:opacity-100"
                    }`}></div>
                  
                  <div className="relative z-10 flex items-center gap-2">
                      <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                        {item.icon}
                      </span>
                      {item.name}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* --- RIGHT: SEARCH, CLOCK & USER & LOGOUT --- */}
          <div className="flex items-center gap-4 lg:gap-6">
          
            <div className="w-[1px] h-8 bg-gradient-to-b from-transparent via-white/20 to-transparent hidden md:block"></div>

            {/* 2. REAL-TIME CLOCK */}
            <div className="hidden md:flex items-center gap-3 px-4 py-1.5 border border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-default shadow-lg backdrop-blur-sm group">
                <div className="p-2 rounded-xl bg-black/30 group-hover:bg-[#ffe400]/20 transition-colors">
                    <ClockIcon className="w-5 h-5 text-[#ffe400] animate-[pulse_3s_infinite]" />
                </div>
                <div className="flex flex-col">
                    <span className="font-mono text-lg font-bold leading-none text-white tracking-widest group-hover:text-[#ffe400] transition-colors">
                        {formattedTime}
                    </span>
                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">
                        {formattedDate}
                    </span>
                </div>
            </div>

            {/* 3. User Profile */}
            <Link 
                to="/teacher/profile" 
                className="flex items-center gap-3 pl-2 transition-all group"
                title="Hồ sơ cá nhân"
            >
                <div className="hidden text-right lg:block">
                    <p className="text-sm font-bold text-white leading-tight group-hover:text-[#ffe400] transition-colors">{user?.full_name || "Giáo viên"}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider group-hover:text-white transition-colors">Teacher</p>
                </div>
                
                <div className="relative w-11 h-11">
                    <div className="absolute inset-0 border-2 border-transparent border-t-[#ffe400] border-r-[#9c00e5] rounded-full group-hover:rotate-180 transition-transform duration-700 ease-in-out"></div>
                    <div className="absolute inset-[3px] rounded-full overflow-hidden border border-white/10 shadow-lg">
                        <img 
                            src={`https://ui-avatars.com/api/?name=${user?.full_name || 'T'}&background=1a0b2e&color=fff&bold=true`} 
                            alt="Avatar" 
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                        />
                    </div>
                </div>
            </Link>

            {/* --- NEW: DESKTOP LOGOUT BUTTON --- */}
            {/* Vạch ngăn cách nhỏ */}
            <div className="w-[1px] h-6 bg-white/10 hidden md:block"></div>
            
            {/* Nút đăng xuất */}
            <button 
                onClick={handleLogout}
                title="Đăng xuất"
                className="items-center justify-center hidden w-10 h-10 text-gray-400 transition-all duration-300 rounded-full md:flex hover:text-red-500 hover:bg-red-500/10 active:scale-95 group/logout"
            >
                <LogoutIcon className="w-6 h-6 transition-transform duration-300 group-hover/logout:translate-x-1" />
            </button>
            {/* ---------------------------------- */}

            {/* Mobile Menu Toggle */}
            <button className="p-2 text-white transition-colors rounded-xl md:hidden hover:bg-white/10 active:scale-95" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <XIcon className="w-7 h-7" /> : <MenuIcon className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* --- MOBILE MENU --- */}
      {isMenuOpen && (
        <div className="absolute left-0 right-0 border-t shadow-2xl md:hidden bg-[#150a22]/95 backdrop-blur-xl border-white/10 animate-fade-in-down z-40">
          <div className="flex flex-col p-4 space-y-3">
            
            <div className="flex flex-col items-center justify-center gap-1 p-4 mb-2 border rounded-2xl bg-gradient-to-r from-white/5 to-white/0 border-white/10">
                <div className="flex items-center gap-2 text-[#ffe400]">
                    <ClockIcon className="w-5 h-5" />
                    <span className="font-mono text-xl font-bold">{formattedTime}</span>
                </div>
                <span className="text-xs font-medium tracking-widest text-gray-300 uppercase">{formattedDate}</span>
            </div>

            <div className="relative">
                <SearchIcon className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
                <input 
                    type="text" 
                    placeholder="Tìm lớp học..." 
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#ffe400]/50 transition-colors"
                />
            </div>

            {menuItems.map((item) => (
                <Link 
                  key={item.name} 
                  to={item.path} 
                  onClick={() => setIsMenuOpen(false)} 
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${checkActive(item.path) ? "bg-[#9c00e5] text-white shadow-lg shadow-purple-900/50" : "text-gray-400 hover:text-white hover:bg-white/10"}`}
                >
                  {item.icon} {item.name}
                </Link>
            ))}
            
            <div className="h-[1px] bg-white/10 my-2"></div>

            <Link to="/teacher/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 font-medium text-gray-300 transition-colors rounded-xl hover:text-white hover:bg-white/10">
                <UserCircleIcon className="w-5 h-5" /> Hồ sơ cá nhân
            </Link>

            <button onClick={handleLogout} className="flex items-center w-full gap-3 px-4 py-3 font-bold text-red-400 transition-all rounded-xl hover:bg-red-500/10 hover:text-red-300">
                <LogoutIcon className="w-5 h-5" /> Đăng xuất
            </button>
          </div>
        </div>
      )}
    </header>
  );
}