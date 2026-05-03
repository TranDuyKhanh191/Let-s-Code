import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Logo from "../../assets/logo/logo_fb.png"; 
import "../../styles/admin.css";
import { 
  HomeIcon, 
  BookOpenIcon, 
  CalendarIcon, 
  UserGroupIcon,
  LogoutIcon,
  BellIcon,
  MenuIcon,
  XIcon,
  CogIcon
} from "@heroicons/react/outline";

export default function HeaderAdmin() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [indicatorPos, setIndicatorPos] = useState({ left: 0, width: 0 });
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const handleLogout = () => {
    logout();
    nav("/login");
  };

  // Update indicator position whenever route changes
  useEffect(() => {
    updateIndicatorPosition();
  }, [location.pathname]);

  // Update indicator on window resize
  useEffect(() => {
    window.addEventListener("resize", updateIndicatorPosition);
    return () => window.removeEventListener("resize", updateIndicatorPosition);
  }, []);

  const updateIndicatorPosition = () => {
    const activeIndex = menuItems.findIndex(item => checkActive(item.path));
    if (activeIndex !== -1 && itemRefs.current[activeIndex]) {
      const activeElement = itemRefs.current[activeIndex];
      if (activeElement && navRef.current) {
        const navRect = navRef.current.getBoundingClientRect();
        const itemRect = activeElement.getBoundingClientRect();
        
        setIndicatorPos({
          left: itemRect.left - navRect.left,
          width: itemRect.width
        });
      }
    }
  };

  const handleMenuHover = (index: number) => {
    const element = itemRefs.current[index];
    if (element && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect();
      const itemRect = element.getBoundingClientRect();
      
      setIndicatorPos({
        left: itemRect.left - navRect.left,
        width: itemRect.width
      });
    }
  };

  // Hàm kiểm tra active linh hoạt
  const checkActive = (path: string) => {
    if (path === "/admin/dashboard") {
      return location.pathname.includes("/admin/dashboard");
    }
    if (path === "/admin/courses") {
      return location.pathname.includes("/admin/courses");
    }
    if (path === "/admin/manage-teachers") {
      return location.pathname.includes("/admin/manage-teachers");
    }
    if (path === "/admin/lessons") {
      return location.pathname.includes("/admin/lessons");
    }
    return location.pathname === path;
  };

  // Danh sách menu Admin
  const menuItems = [
    { 
      name: "Dashboard", 
      path: "/admin/dashboard", 
      icon: <HomeIcon className="w-5 h-5" /> 
    },
    { 
      name: "Khóa học", 
      path: "/admin/courses",
      icon: <BookOpenIcon className="w-5 h-5" /> 
    },
    { 
      name: "Giáo viên", 
      path: "/admin/manage-teachers", 
      icon: <UserGroupIcon className="w-5 h-5" /> 
    },
    { 
      name: "Bài học", 
      path: "/admin/lessons", 
      icon: <CalendarIcon className="w-5 h-5" /> 
    },
  ];

  return (
    <header className="sticky top-0 z-50 font-sans border-b shadow-lg bg-gradient-to-r from-[#1a0b2e]/95 to-[#0f061a]/95 backdrop-blur-lg border-[#9c00e5]/20 header-morph">
      <div className="container px-4 mx-auto lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* LEFT: LOGO */}
          <Link to="/admin/dashboard" className="flex items-center gap-3 group">
             <div className="p-1 transition-all duration-300 rounded-lg bg-gradient-to-br from-[#9c00e5]/20 to-[#ff7c7c]/20 group-hover:from-[#9c00e5]/40 group-hover:to-[#ff7c7c]/40 icon-morph">
                <img src={Logo} alt="LetsCode" className="object-cover w-10 h-10 rounded-md" />
             </div>
             <div>
               <h1 className="text-xl font-black tracking-wide text-white">LETSCODE</h1>
               <span className="text-[10px] font-bold text-[#9c00e5] uppercase tracking-widest">Admin Panel</span>
             </div>
          </Link>

          {/* MIDDLE: MENU DESKTOP */}
          <nav ref={navRef} className="relative items-center hidden gap-1 p-1 border rounded-full md:flex bg-white/5 border-[#9c00e5]/20">
            {/* Animated Indicator Background */}
            <div 
              className="absolute top-1 bottom-1 rounded-full bg-gradient-to-r from-[#9c00e5]/40 to-[#ff7c7c]/40 blur-sm transition-all duration-500 ease-out pointer-events-none"
              style={{
                left: `${indicatorPos.left}px`,
                width: `${indicatorPos.width}px`,
                boxShadow: "0 0 20px rgba(156, 0, 229, 0.3)"
              }}
            />
            
            {menuItems.map((item, index) => {
              const isActive = checkActive(item.path);
              return (
                <Link
                  key={item.name}
                  ref={(el) => {itemRefs.current[index] = el;}}
                  to={item.path}
                  onMouseEnter={() => handleMenuHover(index)}
                  onMouseLeave={updateIndicatorPosition}
                  className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 z-10
                    ${isActive 
                      ? "text-white" 
                      : "text-gray-400 hover:text-white"
                    }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT: USER INFO & ACTIONS */}
          <div className="flex items-center gap-4">

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-[#9c00e5]/20">
              <div className="hidden text-right lg:block">
                <p className="text-sm font-bold text-white">{user?.full_name || "Admin"}</p>
                <p className="text-[10px] font-bold tracking-wider uppercase text-[#9c00e5]">{user?.role || "Administrator"}</p>
              </div>
              
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#9c00e5] to-[#ff7c7c] p-[2px] shadow-lg shadow-[#9c00e5]/40 header-morph-avatar">
                 <div className="flex items-center justify-center w-full h-full overflow-hidden font-bold text-white rounded-lg bg-gradient-to-br from-[#9c00e5] to-[#ff7c7c]">
                    {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "A"}
                 </div>
              </div>
              
              {/* Nút Logout Desktop */}
              <button 
                onClick={handleLogout}
                className="hidden p-2 text-gray-400 transition-colors lg:flex hover:text-red-400 hover:bg-red-400/10 rounded-lg"
                title="Đăng xuất" 
              >
                <LogoutIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Nút Menu Mobile */}
            <button 
              title={isMenuOpen ? "Đóng menu" : "Mở menu"}
              className="p-2 text-white md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <XIcon className="w-7 h-7" /> : <MenuIcon className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isMenuOpen && (
        <div className="absolute left-0 right-0 border-t shadow-2xl md:hidden bg-gradient-to-br from-[#1a0b2e] to-[#0f061a] border-[#9c00e5]/20 animate-fade-in-down z-40">
          <div className="flex flex-col p-4 space-y-2">
            {menuItems.map((item) => {
               const isActive = checkActive(item.path);
               return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all
                    ${isActive 
                      ? "bg-gradient-to-r from-[#9c00e5]/30 to-[#ff7c7c]/30 text-white border border-[#9c00e5]/50" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
               )
            })}
            <div className="pt-4 mt-2 border-t border-[#9c00e5]/20">
              <button 
                onClick={handleLogout}
                className="flex items-center w-full gap-3 px-4 py-3 font-bold text-red-400 transition-colors rounded-xl hover:bg-red-500/10"
              >
                <LogoutIcon className="w-5 h-5" />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
