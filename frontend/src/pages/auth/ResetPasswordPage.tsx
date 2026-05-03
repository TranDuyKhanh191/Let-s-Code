import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// 👇 1. BỎ COMMENT DÒNG NÀY ĐỂ DÙNG API THẬT
import { api } from "../../services/api"; 
import Logo from "../../assets/logo/logo_fb.png";

// ============================================================================
// 1. ASSETS & ICONS (GIỮ NGUYÊN)
// ============================================================================

const Icons = {
  Lock: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  Key: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
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
  CheckCircle: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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

// ============================================================================
// 2. UI COMPONENTS (GIỮ NGUYÊN)
// ============================================================================

const Toast = ({ type, message, onClose }: { type: 'success' | 'error', message: string; onClose: () => void }) => {
  const isError = type === 'error';
  return (
    <div className={`flex items-start w-full gap-3 p-4 mb-6 text-sm border rounded-xl animate-fade-in-down shadow-sm ${isError ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
      <div className={`flex-shrink-0 mt-0.5 ${isError ? 'text-red-500' : 'text-green-500'}`}>
        {isError ? <Icons.Warning className="w-5 h-5" /> : <Icons.CheckCircle className="w-5 h-5" />}
      </div>
      <div className="flex-1">
        <h4 className={`font-bold ${isError ? 'text-red-800' : 'text-green-800'}`}>
            {isError ? 'Thất bại' : 'Thành công'}
        </h4>
        <p className={`mt-1 leading-relaxed ${isError ? 'text-red-600' : 'text-green-600'}`}>{message}</p>
      </div>
      <button onClick={onClose} className={`transition-colors ${isError ? 'text-red-400 hover:text-red-600' : 'text-green-400 hover:text-green-600'}`}>
           <span className="sr-only">Close</span>
           <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
      </button>
    </div>
  );
};

const FloatingInput = ({ id, type, label, value, onChange, icon: Icon, rightElement }: any) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;

  return (
    <div className="relative group">
      <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${isFocused ? "text-[#9c00e5]" : "text-gray-400"}`}>
        <Icon className="w-5 h-5" />
      </div>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`peer block w-full pl-12 pr-12 pt-6 pb-2 rounded-xl border-2 bg-gray-50/50 outline-none transition-all duration-300
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

const AnimatedBlob = ({ className, delay = "0s" }: { className: string, delay?: string }) => (
  <div className={`absolute rounded-full mix-blend-overlay filter blur-3xl opacity-40 animate-blob ${className}`} style={{ animationDelay: delay }} />
);

// ============================================================================
// 3. MAIN PAGE: RESET PASSWORD
// ============================================================================

export default function ResetPasswordPage() {
  const nav = useNavigate();
  const location = useLocation();

  const { email, otp } = location.state || {}; 

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', content: string } | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!email || !otp) {
      nav("/forgot-password");
    }
  }, [email, otp, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (password !== confirmPassword) {
      setMessage({ type: 'error', content: "Mật khẩu xác nhận không khớp." });
      return;
    }
    if (password.length < 6) {
       setMessage({ type: 'error', content: "Mật khẩu phải có ít nhất 6 ký tự." });
       return;
    }
    if (!email || !otp) {
        setMessage({ type: 'error', content: "Thiếu thông tin xác thực. Vui lòng thực hiện lại." });
        return;
    }

    try {
      setLoading(true);

      // 👇 2. ĐÂY LÀ PHẦN QUAN TRỌNG: GỌI API THẬT
      // Đảm bảo endpoint "/auth/reset-password/otp" đúng với file auth.routes.ts ở Backend
      await api.post("/auth/reset-password/otp", { 
          email: email, 
          otp: otp, 
          newPassword: password 
      });
      
      // Nếu API không báo lỗi, nghĩa là thành công
      setIsSuccess(true);
      
      // Chuyển hướng về login sau 3s
      setTimeout(() => nav("/login"), 3000);

    } catch (err: any) {
      console.error(err);
      setMessage({ 
        type: 'error', 
        content: err?.response?.data?.error || err?.response?.data?.message || "Đổi mật khẩu thất bại. Vui lòng thử lại." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen overflow-hidden font-sans bg-gray-50 selection:bg-[#9c00e5] selection:text-white">
      
      {/* ================= TRÁI (BRANDING) ================= */}
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
                <h1 className="text-5xl font-black tracking-tighter text-white drop-shadow-md">
                    Thiết Lập <span className="text-[#ffe400]">Mật Khẩu</span>
                </h1>
                <p className="max-w-md text-lg font-medium leading-relaxed text-white/80">
                    Tạo mật khẩu mới mạnh mẽ để bảo vệ tài khoản và dữ liệu lớp học của bạn.
                </p>
            </div>
        </div>

        <div className="relative z-10 flex items-center justify-between w-full p-8 text-xs font-medium border-t text-white/60 border-white/10 bg-black/10 backdrop-blur-sm">
            <span>Security Update</span>
            <span>&copy; LetsCode Technology.</span>
        </div>
      </div>

      {/* ================= PHẢI (FORM) ================= */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-12 relative bg-[#fdf9db]/30">
        <div className="w-full max-w-[480px] px-4">
            
            <div className="bg-white p-8 sm:p-12 rounded-[2rem] shadow-[0_20px_50px_rgba(156,0,229,0.1)] relative overflow-hidden border border-purple-50">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#9c00e5] via-[#7b0db6] to-[#ffe400]"></div>

              {/* GIAO DIỆN KHI THÀNH CÔNG */}
              {isSuccess ? (
                  <div className="py-10 text-center animate-fade-in-down">
                      <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 text-green-600 bg-green-100 rounded-full animate-bounce-slow">
                          <Icons.CheckCircle className="w-10 h-10" />
                      </div>
                      <h2 className="mb-4 text-3xl font-extrabold text-gray-900">Thành công!</h2>
                      <p className="mb-8 text-gray-600">
                          Mật khẩu của bạn đã được cập nhật. <br/>
                          
                          Đang chuyển hướng về trang đăng nhập...
                      </p>
                      {/* Thanh progress bar giả lập */}
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div className="h-full bg-green-500 animate-progress-bar"></div>
                      </div>
                  </div>
              ) : (
                /* GIAO DIỆN NHẬP FORM */
                <>
                  <div className="mb-8 text-center">
                      <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Đặt lại mật khẩu</h2>
                      <p className="mt-2 text-gray-500">Nhập mật khẩu mới cho tài khoản của bạn.</p>
                  </div>

                  {message && <Toast type={message.type} message={message.content} onClose={() => setMessage(null)} />}

                  <form onSubmit={submit} className="space-y-6">
                      
                      {/* Password Input */}
                      <FloatingInput
                          id="password"
                          type={showPass ? "text" : "password"}
                          label="Mật khẩu mới"
                          value={password}
                          onChange={(e: any) => setPassword(e.target.value)}
                          icon={Icons.Lock}
                          rightElement={
                              <button type="button" onClick={() => setShowPass(!showPass)} className="text-gray-400 hover:text-[#9c00e5] transition-colors p-1 rounded-md hover:bg-purple-50">
                                  {showPass ? <Icons.EyeOff className="w-5 h-5" /> : <Icons.Eye className="w-5 h-5" />}
                              </button>
                          }
                      />

                      {/* Confirm Password Input */}
                      <FloatingInput
                          id="confirmPassword"
                          type={showConfirmPass ? "text" : "password"}
                          label="Xác nhận mật khẩu"
                          value={confirmPassword}
                          onChange={(e: any) => setConfirmPassword(e.target.value)}
                          icon={Icons.Key}
                          rightElement={
                              <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="text-gray-400 hover:text-[#9c00e5] transition-colors p-1 rounded-md hover:bg-purple-50">
                                  {showConfirmPass ? <Icons.EyeOff className="w-5 h-5" /> : <Icons.Eye className="w-5 h-5" />}
                              </button>
                          }
                      />

                      <button
                          type="submit"
                          disabled={loading}
                          className="group relative w-full flex items-center justify-center py-4 px-6 rounded-2xl bg-gradient-to-r from-[#9c00e5] to-[#7b0db6] text-white font-bold text-lg shadow-xl shadow-purple-200 hover:shadow-2xl hover:shadow-purple-300 hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                      >
                          <div className="absolute inset-0 w-full h-full -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shine" />
                          
                          {loading ? (
                              <div className="flex items-center gap-3">
                                  <Icons.Spinner className="w-6 h-6 animate-spin" />
                                  <span>Đang xử lý...</span>
                              </div>
                          ) : (
                              <div className="flex items-center gap-2">
                                  <span>Xác nhận đổi mật khẩu</span>
                                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                  </svg>
                              </div>
                          )}
                      </button>
                  </form>
                </>
              )}
            </div>
        </div>
      </div>

      <style>{`
        @keyframes shine { 100% { transform: translateX(100%); } }
        .animate-shine { animation: shine 1s; }
        @keyframes fade-in-down {
            0% { opacity: 0; transform: translateY(-10px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down { animation: fade-in-down 0.3s ease-out forwards; }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        @keyframes bounce-slow {
            0%, 100% { transform: translateY(-5%); }
            50% { transform: translateY(5%); }
        }
        .animate-bounce-slow { animation: bounce-slow 3s infinite ease-in-out; }
        @keyframes progress-bar {
            0% { width: 0%; }
            100% { width: 100%; }
        }
        .animate-progress-bar { animation: progress-bar 3s linear forwards; }
      `}</style>
    </div>
  );
}