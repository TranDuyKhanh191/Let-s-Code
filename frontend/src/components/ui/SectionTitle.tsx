import React from "react";

interface SectionTitleProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function SectionTitle({ icon, title, subtitle }: SectionTitleProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 p-2 border shadow-sm rounded-xl bg-white/10 border-white/20 backdrop-blur-md">
          {icon}
        </div>
        
        {/* Đã giảm size chữ: từ text-2xl xuống text-xl */}
        <h2 className="m-0 text-xl font-bold tracking-tight text-white md:text-2xl whitespace-nowrap">
          {title}
        </h2>

        {subtitle && (
          <p className="m-0 text-sm font-medium text-gray-400 truncate">
            <span className="mx-2 opacity-50">-</span> {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}