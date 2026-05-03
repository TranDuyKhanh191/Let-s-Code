import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../../services/api"; // Import API thật
import Logo from "../../assets/logo/logo_fb.png";

// ... (Giữ nguyên phần Icons như cũ) ...
// Để gọn code, tôi dùng lại Icons cũ, bạn giữ nguyên phần khai báo Icons nhé
const Icons = {
  Key: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
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
  ),
  Check: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  )
};

// Component Input & Blob giữ nguyên ...
const FloatingInput = ({ id, type, label, value, onChange, icon: Icon }: any) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;
  return (
    <div className="relative group">
      <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${isFocused ? "text-[#9c00e5]" : "text-gray-400"}`}>
        <Icon className="w-5 h-5" />
      </div>
      <input
        id={id} type={type} value={value} onChange={onChange}
        onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}
        className={`peer block w-full pl-12 pr-4 pt-6 pb-2 rounded-xl border-2 bg-gray-50/50 outline-none transition-all duration-300 ${isFocused ? "border-[#9c00e5] ring-4 ring-[#9c00e5]/10 bg-white" : "border-gray-100 hover:border-gray-200 text-gray-900"}`}
        placeholder=" " 
      />
      <label htmlFor={id} className={`absolute left-12 transition-all duration-300 pointer-events-none origin-[0] ${(isFocused || hasValue) ? "top-2 text-xs font-bold text-[#9c00e5] scale-100" : "top-4 text-base font-medium text-gray-500 scale-100"}`}>{label}</label>
    </div>
  );
};
const AnimatedBlob = ({ className, delay = "0s" }: { className: string, delay?: string }) => (
  <div className={`absolute rounded-full mix-blend-overlay filter blur-3xl opacity-40 animate-blob ${className}`} style={{ animationDelay: delay }} />
);

// --- MAIN COMPONENT ---

export default function VerifyOtpPage() {
  const nav = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || "";

  const [email, setEmail] = useState(emailFromState);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Thêm state cho gửi lại
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!email) {
      nav("/forgot-password");
    }
  }, [email, nav]);

  // Xử lý gửi lại OTP
  const handleResend = async () => {
    if (resending) return;
    try {
      setResending(true);
      setResendStatus(null);
      setError(null);
      
      // Gọi lại API quên mật khẩu để Backend gửi mail mới
      await api.post("/auth/forgot-password", { email });
      
      setResendStatus("Đã gửi lại mã OTP thành công!");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Không thể gửi lại mã.");
    } finally {
      setResending(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otp || otp.length < 6) {
      setError("Vui lòng nhập đủ 6 số OTP.");
      return;
    }

    setLoading(true);
    // Chuyển sang trang Reset Password kèm OTP và Email
    setTimeout(() => {
        nav("/reset-password", { state: { email: email, otp: otp } });
    }, 500);
  };

  return (
    <div className="flex min-h-screen overflow-hidden font-sans bg-gray-50 selection:bg-[#9c00e5] selection:text-white">
      
      {/* Cột trái giữ nguyên */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between items-center bg-[#9c00e5] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#9c00e5] via-[#7b0db6] to-[#4a0072] z-0"></div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <AnimatedBlob className="top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#ffe400]" delay="0s" />
          <AnimatedBlob className="bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#3fd9ff]" delay="2s" />
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
                    Xác Thực <span className="text-[#ffe400]">Bảo Mật</span>
                </h1>
                <p className="max-w-md text-lg font-medium leading-relaxed text-white/80">
                    Vui lòng nhập mã gồm 6 chữ số đã được gửi tới email <b>{email}</b>.
                </p>
            </div>
        </div>
        <div className="relative z-10 flex items-center justify-between w-full p-8 text-xs font-medium border-t text-white/60 border-white/10 bg-black/10 backdrop-blur-sm">
            <span>Secure Verification</span>
            <span>&copy; LetsCode Technology.</span>
        </div>
      </div>

      {/* Cột phải: Form nhập OTP */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-12 relative bg-[#fdf9db]/30">
        <div className="w-full max-w-[440px] px-4">
            <div className="bg-white p-8 sm:p-12 rounded-[2rem] shadow-[0_20px_50px_rgba(156,0,229,0.1)] relative overflow-hidden border border-purple-50">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#9c00e5] via-[#7b0db6] to-[#ffe400]"></div>

              <div className="mb-8 text-center">
                  <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Nhập mã OTP</h2>
                  <p className="mt-2 text-gray-500">Kiểm tra email của bạn để lấy mã xác thực.</p>
              </div>

              {/* Thông báo lỗi */}
              {error && (
                <div className="flex items-center gap-2 p-3 mb-6 text-sm text-red-700 border border-red-100 bg-red-50 rounded-xl">
                   <Icons.Warning className="flex-shrink-0 w-5 h-5" />
                   <span>{error}</span>
                </div>
              )}

              {/* Thông báo gửi lại thành công */}
              {resendStatus && (
                <div className="flex items-center gap-2 p-3 mb-6 text-sm text-green-700 border border-green-100 bg-green-50 rounded-xl">
                   <Icons.Check className="flex-shrink-0 w-5 h-5" />
                   <span>{resendStatus}</span>
                </div>
              )}

              <form onSubmit={submit} className="space-y-6">
                  <FloatingInput
                      id="otp"
                      type="text"
                      label="Mã OTP (6 số)"
                      value={otp}
                      onChange={(e: any) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length <= 6) setOtp(val);
                      }}
                      icon={Icons.Key}
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
                              <span>Tiếp tục</span>
                              <Icons.ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                          </div>
                      )}
                  </button>
              </form>

              {/* Nút gửi lại OTP đã được nâng cấp */}
              <div className="pt-6 mt-8 text-center border-t border-gray-100">
                  <p className="text-sm text-gray-400">
                    Không nhận được mã?{' '}
                    <button 
                      type="button"
                      onClick={handleResend} 
                      disabled={resending}
                      className="font-bold text-[#9c00e5] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resending ? "Đang gửi..." : "Gửi lại"}
                    </button>
                  </p>
              </div>
            </div>
        </div>
      </div>
      <style>{`
        @keyframes shine { 100% { transform: translateX(100%); } }
        .animate-shine { animation: shine 1s; }
        @keyframes blob { 0% { transform: translate(0,0) scale(1); } 33% { transform: translate(30px,-50px) scale(1.1); } 66% { transform: translate(-20px,20px) scale(0.9); } 100% { transform: translate(0,0) scale(1); } }
        .animate-blob { animation: blob 7s infinite; }
      `}</style>
    </div>
  );
}