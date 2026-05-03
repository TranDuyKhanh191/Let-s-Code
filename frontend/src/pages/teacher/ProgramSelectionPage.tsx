import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CubeIcon, LightningBoltIcon, ArrowRightIcon, SparklesIcon } from "@heroicons/react/solid";
// 1. Import thêm 'Variants' để định nghĩa kiểu dữ liệu
import { motion, Variants } from "framer-motion";

import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

const ProgramSelectionPage = () => {
  const navigate = useNavigate();

  const [showPurpleGlow, setShowPurpleGlow] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setShowPurpleGlow(prev => !prev);
    }, 4000); 
    return () => clearInterval(timer);
  }, []);

  const handleSelectProgram = (programId: number, programName: string) => {
    localStorage.setItem("selected_program_id", programId.toString());
    localStorage.setItem("selected_program_name", programName);
    navigate("/teacher/courses");
  };

  // 2. SỬA LỖI TYPESCRIPT: Thêm ': Variants' vào sau tên biến
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  // 2. SỬA LỖI TYPESCRIPT: Thêm ': Variants'
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0f0518] text-white font-sans selection:bg-[#ffe400] selection:text-black overflow-hidden">
      <Header />

      <main className="relative flex flex-col items-center justify-center flex-1 px-4 py-20">
        
        {/* --- BACKGROUND LAYER --- */}
        {/* 3. SỬA LỖI INLINE STYLES: Chuyển sang Tailwind Arbitrary Values */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[length:4rem_4rem] [mask-image:radial-gradient(circle_at_center,black,transparent_80%)]"
        >
        </div>
        
        {/* 2. Purple Glow (Top Left) */}
        <div 
          className={`absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#9c00e5] blur-[120px] rounded-full pointer-events-none mix-blend-screen transition-all duration-[4000ms] ease-in-out
            ${showPurpleGlow ? 'opacity-40 scale-110' : 'opacity-10 scale-90'}
          `}
        ></div>

        {/* 3. Yellow Glow (Bottom Right) */}
        <div 
          className={`absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#ffe400] blur-[120px] rounded-full pointer-events-none mix-blend-screen transition-all duration-[4000ms] ease-in-out
            ${!showPurpleGlow ? 'opacity-30 scale-110' : 'opacity-10 scale-90'}
          `}
        ></div>

        {/* --- CONTENT LAYER --- */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="z-10 w-full max-w-6xl text-center"
        >
          {/* TITLE SECTION */}
          <motion.div variants={itemVariants} className="mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 border rounded-full shadow-lg bg-white/5 border-white/10 backdrop-blur-md">
              <SparklesIcon className="w-5 h-5 text-[#ffe400]" />
              <span className="text-sm font-semibold tracking-wide text-gray-300 uppercase">Lộ trình học tập chuẩn quốc tế</span>
            </div>
            
            <h1 className="mb-6 text-5xl font-black tracking-tighter md:text-7xl">
              Lựa chọn <br className="md:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe400] via-[#ffb700] to-[#ff9900] drop-shadow-[0_0_15px_rgba(255,228,0,0.3)]">
                Giải pháp SPIKE™
              </span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg font-medium leading-relaxed text-gray-400 md:text-xl">
              Hệ thống sẽ tự động điều chỉnh giáo án, thử thách và tài nguyên học tập dựa trên bộ công cụ Robotics bạn chọn.
            </p>
          </motion.div>

          {/* CARDS SECTION */}
          <div className="grid grid-cols-1 gap-8 px-4 md:grid-cols-2 lg:gap-16">
            
            {/* CARD 1: SPIKE ESSENTIAL */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectProgram(1, "Spike Essential")}
              className="relative h-full group"
            >
              {/* Card Body */}
              <div className="relative h-full overflow-hidden bg-[#1a0b2e]/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 cursor-pointer transition-all duration-500 hover:border-[#ffe400]/50 hover:shadow-[0_0_50px_-10px_rgba(255,228,0,0.3)] flex flex-col items-center text-center">
                
                {/* Hover Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#ffe400]/10 to-transparent opacity-0 group-hover:opacity-100 transition-duration-500"></div>

                {/* Icon Container */}
                <div className="relative mb-10">
                  <div className="absolute inset-0 bg-[#ffe400] blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full"></div>
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="relative w-40 h-40 bg-gradient-to-br from-[#2a1b3d] to-[#1a0b2e] border border-[#ffe400]/30 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500"
                  >
                    <CubeIcon className="w-20 h-20 text-[#ffe400] drop-shadow-[0_0_15px_rgba(255,228,0,0.5)]" />
                  </motion.div>
                </div>

                {/* Text Content */}
                <h2 className="text-3xl font-black text-white mb-3 group-hover:text-[#ffe400] transition-colors">SPIKE™ Essential</h2>
                <div className="w-12 h-1 bg-[#ffe400]/30 rounded-full mb-6 group-hover:w-24 group-hover:bg-[#ffe400] transition-all duration-500"></div>
                <p className="flex-1 mb-10 leading-relaxed text-gray-400">
                  Khơi dậy niềm đam mê STEAM cho học sinh <strong className="text-white">Tiểu học (Lớp 1-5)</strong> thông qua các bài học kể chuyện vui nhộn.
                </p>

                {/* Button */}
                <div className="w-full py-4 rounded-2xl bg-[#ffe400]/10 border border-[#ffe400]/20 text-[#ffe400] font-bold text-lg group-hover:bg-[#ffe400] group-hover:text-black transition-all duration-300 flex items-center justify-center gap-3">
                  Truy cập Essential <ArrowRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </motion.div>

            {/* CARD 2: SPIKE PRIME */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectProgram(2, "Spike Prime")}
              className="relative h-full group"
            >
              <div className="relative h-full overflow-hidden bg-[#1a0b2e]/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 cursor-pointer transition-all duration-500 hover:border-[#00d2ff]/50 hover:shadow-[0_0_50px_-10px_rgba(0,210,255,0.3)] flex flex-col items-center text-center">
                
                <div className="absolute inset-0 bg-gradient-to-b from-[#00d2ff]/10 to-transparent opacity-0 group-hover:opacity-100 transition-duration-500"></div>

                <div className="relative mb-10">
                  <div className="absolute inset-0 bg-[#00d2ff] blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full"></div>
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
                    className="relative w-40 h-40 bg-gradient-to-br from-[#2a1b3d] to-[#1a0b2e] border border-[#00d2ff]/30 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500"
                  >
                    <LightningBoltIcon className="w-20 h-20 text-[#00d2ff] drop-shadow-[0_0_15px_rgba(0,210,255,0.5)]" />
                  </motion.div>
                </div>

                <h2 className="text-3xl font-black text-white mb-3 group-hover:text-[#00d2ff] transition-colors">SPIKE™ Prime</h2>
                <div className="w-12 h-1 bg-[#00d2ff]/30 rounded-full mb-6 group-hover:w-24 group-hover:bg-[#00d2ff] transition-all duration-500"></div>
                <p className="flex-1 mb-10 leading-relaxed text-gray-400">
                  Phát triển tư duy phản biện và kỹ năng lập trình phức tạp cho học sinh <strong className="text-white">THCS (Lớp 6-9)</strong>.
                </p>

                <div className="w-full py-4 rounded-2xl bg-[#00d2ff]/10 border border-[#00d2ff]/20 text-[#00d2ff] font-bold text-lg group-hover:bg-[#00d2ff] group-hover:text-black transition-all duration-300 flex items-center justify-center gap-3">
                  Truy cập Prime <ArrowRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </motion.div>

          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default ProgramSelectionPage;