import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Logo from "../../assets/logo/logo_fb.png";

// ... (Giữ nguyên phần Icons)
const Icons = {
  User: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Lock: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  Eye: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  EyeOff: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ),
  ArrowRight: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  ),
  Spinner: ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  ),
  Warning: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
};

const ErrorToast = ({ message, onClose }: { message: string; onClose: () => void }) => {
  return (
    <div className="flex items-start w-full gap-3 p-4 mb-6 text-sm border border-red-100 shadow-sm bg-red-50 rounded-xl animate-fade-in-down">
      <div className="flex-shrink-0 text-red-500 mt-0.5">
        <Icons.Warning className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-red-800">Đăng nhập thất bại</h4>
        <p className="mt-1 leading-relaxed text-red-600">{message}</p>
      </div>
      {/* SỬA LỖI 1: Thêm aria-label và title cho nút đóng */}
      <button 
        onClick={onClose} 
        className="text-red-400 transition-colors hover:text-red-600"
        aria-label="Đóng thông báo"
        title="Đóng"
        type="button"
      >
        <span className="sr-only">Close</span>
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

const AnimatedBlob = ({ className, delay = "0s" }: { className: string, delay?: string }) => (
  // SỬA LỖI: animationDelay là dynamic nên inline-style ở đây chấp nhận được, nhưng cần đảm bảo các style khác clean
  <div 
    className={`absolute rounded-full mix-blend-overlay filter blur-3xl opacity-40 animate-blob ${className}`}
    style={{ animationDelay: delay }}
  />
);

const FeatureCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = [
    { title: "Quản Lý Lớp Học Thông Minh", desc: "Theo dõi tiến độ học tập của học sinh theo thời gian thực với các báo cáo trực quan." },
    { title: "Kho Tài Liệu Khổng Lồ", desc: "Truy cập hàng nghìn bài giảng Robotics và Lập trình được chuẩn hóa quốc tế." },
    { title: "Kết Nối Đa Nền Tảng", desc: "Hệ thống hoạt động mượt mà trên mọi thiết bị: Laptop, Tablet và Smartphone." }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="relative w-full h-32 max-w-md mx-auto mt-12">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 flex flex-col items-center transition-all duration-700 ease-in-out transform
            ${index === activeIndex ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}
          `}
        >
          <h3 className="mb-2 text-2xl font-bold text-white">{slide.title}</h3>
          <p className="font-medium leading-relaxed text-center text-white/90">
            {slide.desc}
          </p>
        </div>
      ))}
      <div className="absolute left-0 right-0 flex justify-center gap-2 -bottom-8">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            aria-label={`Slide ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === activeIndex ? "w-8 bg-[#ffe400]" : "w-2 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

interface FloatingInputProps {
  id: string;
  type: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ElementType;
  rightElement?: React.ReactNode;
  autoComplete?: string;
}

const FloatingInput = ({ id, type, label, value, onChange, icon: Icon, rightElement, autoComplete }: FloatingInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
      const checkAutofill = setInterval(() => {
          if (inputRef.current && inputRef.current.value !== value) {
              const event = { target: inputRef.current } as React.ChangeEvent<HTMLInputElement>;
              onChange(event);
          }
      }, 500);
      return () => clearInterval(checkAutofill);
  }, [value, onChange]);

  const hasValue = value.length > 0;

  return (
    <div className="relative group">
      <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${isFocused ? "text-[#9c00e5]" : "text-gray-400"}`}>
        <Icon className="w-5 h-5" />
      </div>
      <input
        ref={inputRef}
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoComplete={autoComplete}
        className={`peer block w-full pl-12 pr-4 pt-6 pb-2 rounded-xl border-2 bg-gray-50/50 outline-none transition-all duration-300
          ${isFocused 
            ? "border-[#9c00e5] ring-4 ring-[#9c00e5]/10 bg-white" 
            : "border-gray-100 hover:border-gray-200 text-gray-900"
          }
        `}
        placeholder=" " 
      />
      <label
        htmlFor={id}
        className={`absolute left-12 transition-all duration-300 pointer-events-none origin-[0]
          ${(isFocused || hasValue)
            ? "top-2 text-xs font-bold text-[#9c00e5] scale-100"
            : "top-4 text-base font-medium text-gray-500 scale-100"
          }
        `}
      >
        {label}
      </label>
      {rightElement && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
          {rightElement}
        </div>
      )}
    </div>
  );
};

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
      setPassword("");
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const cleanIdentifier = identifier.trim();
    const cleanPassword = password;

    if (!cleanIdentifier || !cleanPassword) {
      setError("Vui lòng điền đầy đủ thông tin đăng nhập.");
      return;
    }
    
    try {
      setLoading(true);
      
      const response: any = await login(cleanIdentifier, cleanPassword);
      
      const userRole = response?.user?.role || response?.role || "";
      
      if (userRole === "admin") {
          nav("/admin/dashboard");
      } else {
          nav("/teacher/home");
      }

    } catch (err: any) {
      const msg = err?.response?.data?.error || "Sai tài khoản hoặc mật khẩu.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen overflow-hidden font-sans bg-gray-50 selection:bg-[#9c00e5] selection:text-white">
      
      {/* LEFT COLUMN: BRANDING */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between items-center bg-[#9c00e5] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#9c00e5] via-[#7b0db6] to-[#4a0072] z-0"></div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <AnimatedBlob className="top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#ffe400]" delay="0s" />
          <AnimatedBlob className="bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#3fd9ff]" delay="2s" />
          <AnimatedBlob className="top-[40%] right-[20%] w-32 h-32 bg-white opacity-20" delay="4s" />
        </div>
        <div className="relative z-10 w-full h-full flex flex-col justify-center items-center px-12 py-16 backdrop-blur-[1px]">
            <div className="relative mb-10 group">
                <div className="absolute transition duration-1000 rounded-full opacity-25 -inset-1 bg-white/30 blur group-hover:opacity-50"></div>
                <div className="relative p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-2xl">
                    <img src={Logo} alt="LETSCODE" className="object-cover w-40 h-40 transition duration-500 transform drop-shadow-2xl rounded-2xl hover:scale-105" />
                </div>
            </div>
            <div className="space-y-4 text-center">
                <h1 className="text-6xl font-black tracking-tighter text-white drop-shadow-md">
                    LETS<span className="text-[#ffe400]">CODE</span>
                </h1>
                <div className="inline-block px-4 py-1.5 rounded-full border border-white/30 bg-white/10 text-white text-xs font-bold tracking-[0.2em] uppercase backdrop-blur-md">
                    Education Platform 2.0
                </div>
            </div>
            <FeatureCarousel />
        </div>
        <div className="relative z-10 flex items-center justify-between w-full p-8 text-xs font-medium border-t text-white/60 border-white/10 bg-black/10 backdrop-blur-sm">
            <span>Ver 2.5.0 (Build 2024)</span>
            <span>&copy; LetsCode Technology. All rights reserved.</span>
        </div>
      </div>

      {/* RIGHT COLUMN: LOGIN FORM */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-12 relative bg-[#fdf9db]/30">
        <div className="w-full max-w-[440px] px-4">
            <div className="bg-white p-8 sm:p-10 rounded-[2rem] shadow-[0_20px_50px_rgba(156,0,229,0.1)] relative overflow-hidden border border-purple-50">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#9c00e5] via-[#7b0db6] to-[#ffe400]"></div>

              <div className="mb-8 text-center">
                  <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Đăng nhập</h2>
                  <p className="mt-2 text-gray-500">Nhập thông tin tài khoản để tiếp tục.</p>
              </div>

              {error && <ErrorToast message={error} onClose={() => setError(null)} />}

              <form onSubmit={submit} className="space-y-6" autoComplete="off">
                  {/* SỬA LỖI 2, 3, 6, 7: Thay thế inline style bằng Tailwind class và thêm aria attribute */}
                  <input 
                    type="text" 
                    name="fakeUsername"
                    className="hidden" 
                    autoComplete="off"
                    aria-hidden="true"
                    tabIndex={-1}
                    readOnly 
                  />
                  <input 
                    type="password" 
                    name="fakePassword"
                    className="hidden" 
                    autoComplete="off"
                    aria-hidden="true" 
                    tabIndex={-1}
                    readOnly
                  />

                  <FloatingInput
                      id="identifier"
                      type="text"
                      label="Email hoặc Tên đăng nhập"
                      value={identifier}
                      autoComplete="username"
                      onChange={(e) => {
                          setIdentifier(e.target.value);
                          if(error) setError(null);
                      }}
                      icon={Icons.User}
                  />
                  <FloatingInput
                      id="password"
                      type={showPassword ? "text" : "password"}
                      label="Mật khẩu"
                      value={password}
                      autoComplete="new-password"
                      onChange={(e) => {
                          setPassword(e.target.value);
                          if(error) setError(null);
                      }}
                      icon={Icons.Lock}
                      rightElement={
                          <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="text-gray-400 hover:text-[#9c00e5] transition-colors focus:outline-none p-1 rounded-md hover:bg-purple-50"
                              title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                          >
                              {showPassword ? <Icons.EyeOff className="w-5 h-5" /> : <Icons.Eye className="w-5 h-5" />}
                          </button>
                      }
                  />

                  <div className="flex items-center justify-between">
                      <label className="flex items-center cursor-pointer select-none group">
                          <div className="relative">
                              <input 
                                  type="checkbox" 
                                  className="sr-only peer"
                                  checked={rememberMe}
                                  onChange={(e) => setRememberMe(e.target.checked)}
                              />
                              <div className="w-5 h-5 border-2 border-gray-300 rounded-md peer-checked:bg-[#9c00e5] peer-checked:border-[#9c00e5] transition-all"></div>
                              <svg className="absolute w-3 h-3 text-white transition-opacity opacity-0 pointer-events-none top-1 left-1 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                              </svg>
                          </div>
                          <span className="ml-2.5 text-sm font-semibold text-gray-500 group-hover:text-[#9c00e5] transition-colors">Ghi nhớ tôi</span>
                      </label>

                      <button
                          type="button"
                          onClick={() => nav("/forgot-password")}
                          className="text-sm font-bold text-[#9c00e5] hover:text-[#7b0db6] hover:underline transition-all"
                      >
                          Quên mật khẩu?
                      </button>
                  </div>

                  <button
                      type="submit"
                      disabled={loading}
                      className="group relative w-full flex items-center justify-center py-4 px-6 rounded-2xl bg-gradient-to-r from-[#9c00e5] to-[#7b0db6] text-white font-bold text-lg shadow-xl shadow-purple-200 hover:shadow-2xl hover:shadow-purple-300 hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                  >
                      <div className="absolute inset-0 w-full h-full -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shine" />
                      {loading ? (
                          <div className="flex items-center gap-3">
                              <Icons.Spinner className="w-6 h-6 animate-spin" />
                              <span>Đang xác thực...</span>
                          </div>
                      ) : (
                          <div className="flex items-center gap-2">
                              <span>Đăng nhập ngay</span>
                              <Icons.ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                          </div>
                      )}
                  </button>
              </form>

              <div className="mt-8 text-center">
                  <p className="text-sm font-medium text-gray-400">
                      Bạn chưa có tài khoản?{' '}
                      <span className="text-gray-500 cursor-help hover:text-[#9c00e5] transition-colors">
                        Vui lòng liên hệ Admin trường học.
                      </span>
                  </p>
              </div>
            </div>
        </div>
      </div>
      
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        @keyframes shine { 100% { transform: translateX(100%); } }
        .animate-shine { animation: shine 1s; }
        @keyframes fade-in-down {
            0% { opacity: 0; transform: translateY(-10px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down { animation: fade-in-down 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}