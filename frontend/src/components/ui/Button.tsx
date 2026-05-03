import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  className?: string;
}

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {

  const baseStyle = "px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 active:scale-95";

  const variants = {
    // Gradient từ Tím sang Xanh đậm
    primary: "bg-gradient-to-r from-lc-purple to-lc-dark-blue text-white shadow-lg hover:shadow-lc-purple/50",
    // Viền trắng mờ
    outline: "bg-transparent border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50",
    // Nút trong suốt, chữ màu Vàng
    ghost: "bg-transparent text-lc-yellow hover:bg-white/10"
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}