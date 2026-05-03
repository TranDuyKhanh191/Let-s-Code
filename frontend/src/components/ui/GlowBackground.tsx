import React from "react";

export default function GlowBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
       {/* Đốm TÍM chủ đạo - Lớn, xoay chậm */}
       <div className="absolute -top-[20%] -left-[10%] w-[800px] h-[800px] bg-[#9c00e5]/30 rounded-full mix-blend-screen filter blur-[100px] animate-spin-slow opacity-60"></div>
       
       {/* Đốm VÀNG điểm nhấn - Trôi nổi bên phải */}
       <div className="absolute top-[30%] -right-[20%] w-[600px] h-[600px] bg-[#ffe400]/20 rounded-full mix-blend-screen filter blur-[100px] animate-float opacity-50"></div>
       
       {/* Đốm TÍM phụ - Ở dưới đáy */}
       <div className="absolute -bottom-[20%] left-[20%] w-[700px] h-[700px] bg-[#9c00e5]/20 rounded-full mix-blend-screen filter blur-[120px] animate-float opacity-40"></div>
       
       {/* Lớp lưới chấm mờ để tạo texture */}
       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
    </div>
  );
}