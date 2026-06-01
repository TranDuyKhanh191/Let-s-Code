import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogoutIcon, SparklesIcon, ClockIcon } from '@heroicons/react/outline';
import { PlayIcon, AcademicCapIcon, DocumentTextIcon } from "@heroicons/react/solid";
import { motion, Variants } from 'framer-motion';
import { api } from '../../services/api';

// --- ANIMATION VARIANTS ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

// --- SUB-COMPONENTS ---
const PatternOverlay = React.memo(() => (
  <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay bg-[image:radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.8)_1px,transparent_0)] bg-[length:16px_16px]"></div>
));

const DynamicBackground = React.memo(() => {
  const [showPurpleGlow, setShowPurpleGlow] = useState(true);
  useEffect(() => {
    const timer = setInterval(() => setShowPurpleGlow(p => !p), 4000);
    return () => clearInterval(timer);
  }, []);
  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none"><div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div><div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[length:6rem_6rem] [mask-image:radial-gradient(circle_at_center,black,transparent_80%)]"></div></div>
      <div className={`fixed top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-[#9c00e5] blur-[180px] rounded-full pointer-events-none mix-blend-screen transition-all duration-[5000ms] ease-in-out ${showPurpleGlow ? 'opacity-25 scale-110 translate-x-10' : 'opacity-10 scale-90'}`}></div>
      <div className={`fixed bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-[#00d2ff] blur-[180px] rounded-full pointer-events-none mix-blend-screen transition-all duration-[5000ms] ease-in-out ${!showPurpleGlow ? 'opacity-20 scale-110 -translate-x-10' : 'opacity-5 scale-90'}`}></div>
    </>
  );
});

// Mock courses for student
const COURSE_THEMES: any = {
  purple: { name: 'Tím', primary: 'from-violet-600 via-purple-600 to-fuchsia-600', text: 'text-purple-400', bg: 'bg-purple-950/40', bgHover: 'hover:bg-purple-900/50', border: 'border-purple-500/30', hoverBorder: 'group-hover:border-purple-400/60', hex: '#a855f7', bgSolid: 'bg-[#a855f7]' },
  blue: { name: 'Xanh Dương', primary: 'from-blue-600 via-cyan-600 to-teal-500', text: 'text-cyan-400', bg: 'bg-blue-950/40', bgHover: 'hover:bg-blue-900/50', border: 'border-cyan-500/30', hoverBorder: 'group-hover:border-cyan-400/60', hex: '#06b6d4', bgSolid: 'bg-[#06b6d4]' },
  green: { name: 'Xanh Lá', primary: 'from-emerald-600 via-green-600 to-lime-500', text: 'text-emerald-400', bg: 'bg-emerald-950/40', bgHover: 'hover:bg-emerald-900/50', border: 'border-emerald-500/30', hoverBorder: 'group-hover:border-emerald-400/60', hex: '#34d399', bgSolid: 'bg-[#34d399]' },
};



export default function StudentHomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get("/api/enrollments/my-courses");
        if (response.data.success) {
          const themes = ['purple', 'blue', 'green'];
          const fetchedCourses = response.data.courses.map((course: any, index: number) => ({
             ...course,
             themeKey: themes[index % themes.length]
          }));
          setCourses(fetchedCourses);
        }
      } catch (error) {
        console.error("Lỗi khi fetch khoá học", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

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

  return (
    <div className="flex flex-col min-h-screen bg-[#0f0518] text-slate-200 font-sans selection:bg-[#ffe400] selection:text-black overflow-x-hidden">
      <DynamicBackground />

      {/* HEADER */}
      <header className="sticky top-0 z-50 font-sans border-b shadow-2xl bg-[#1a0b2e]/80 backdrop-blur-xl border-white/5 transition-all duration-300">
        <div className="container px-4 mx-auto lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* LEFT: LOGO/BRANDING */}
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/student/home')}>
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[#00d2ff] to-[#3a7bd5] flex items-center justify-center shadow-[0_0_20px_rgba(0,210,255,0.3)] group overflow-hidden">
                <PatternOverlay />
                <SparklesIcon className="w-6 h-6 text-white relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-1" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                  Let's Code
                </h1>
                <p className="text-[10px] font-black tracking-widest text-[#00d2ff] uppercase drop-shadow-[0_0_8px_rgba(0,210,255,0.5)]">Student Portal</p>
              </div>
            </div>

            {/* RIGHT: CLOCK & USER */}
            <div className="flex items-center gap-4 lg:gap-6">
              {/* CLOCK */}
              <div className="hidden md:flex items-center gap-3 px-4 py-1.5 border border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors shadow-lg backdrop-blur-sm group">
                <div className="p-2 rounded-xl bg-black/30 group-hover:bg-[#00d2ff]/20 transition-colors">
                  <ClockIcon className="w-5 h-5 text-[#00d2ff] animate-[pulse_3s_infinite]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-lg font-bold leading-none text-white tracking-widest group-hover:text-[#00d2ff] transition-colors">
                    {formattedTime}
                  </span>
                  <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">
                    {formattedDate}
                  </span>
                </div>
              </div>

              {/* USER PROFILE */}
              <div className="flex items-center gap-3 pl-2 group">
                <div className="hidden text-right lg:block">
                  <p className="text-sm font-bold text-white leading-tight group-hover:text-[#00d2ff] transition-colors">{user?.full_name || "Học sinh"}</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider group-hover:text-white transition-colors">Student</p>
                </div>
                <div className="relative w-11 h-11">
                  <div className="absolute inset-0 border-2 border-transparent border-t-[#00d2ff] border-r-[#9c00e5] rounded-full group-hover:rotate-180 transition-transform duration-700 ease-in-out"></div>
                  <div className="absolute inset-[3px] rounded-full overflow-hidden border border-white/10 shadow-lg">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${user?.full_name || 'H'}&background=1a0b2e&color=fff&bold=true`} 
                      alt="Avatar" 
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                </div>
              </div>

              <div className="w-[1px] h-6 bg-white/10 hidden md:block"></div>
              
              {/* LOGOUT */}
              <button 
                onClick={logout}
                title="Đăng xuất"
                className="items-center justify-center hidden w-10 h-10 text-gray-400 transition-all duration-300 rounded-full md:flex hover:text-red-500 hover:bg-red-500/10 active:scale-95 group/logout"
              >
                <LogoutIcon className="w-5 h-5 transition-transform duration-300 group-hover/logout:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="relative z-10 flex-1 min-h-screen p-6 md:p-8 lg:px-12">
        <div className="container mx-auto max-w-6xl">
          
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="mb-12">
            <div className="relative pt-2">
              <h1 className="mb-3 text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-xl">
                Khóa Học Của Bạn
              </h1>
              <p className="flex items-center gap-2 text-lg font-medium text-gray-400">
                <SparklesIcon className="w-5 h-5 text-[#00d2ff]" /> 
                Tiếp tục hành trình học tập và lập trình của bạn!
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {isLoading ? (
              <div className="col-span-full py-12 text-center text-gray-400">Đang tải dữ liệu khóa học...</div>
            ) : courses.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-400">Bạn chưa được ghi danh vào khóa học nào.</div>
            ) : courses.map(course => {
              const theme = COURSE_THEMES[course.themeKey];
              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4, transition: { duration: 0.1 } }}
                  onClick={() => navigate(`/student/courses/${course.id}`, { state: { courseInfo: course } })}
                  className={`group relative flex flex-col cursor-pointer h-full backdrop-blur-2xl border rounded-[2rem] overflow-hidden shadow-lg ${theme.bg} ${theme.bgHover} ${theme.border} ${theme.hoverBorder}`}
                >
                  <div className={`relative h-40 bg-gradient-to-br ${theme.primary} p-5 flex flex-col justify-between overflow-hidden`}>
                    <PatternOverlay />
                    <AcademicCapIcon className="absolute w-36 h-36 text-white transition-all duration-300 ease-out -right-8 -bottom-10 opacity-20 rotate-12 group-hover:rotate-0 group-hover:scale-110" />
                    <div className="relative z-10 flex items-start justify-between">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2.5 py-1 text-[10px] uppercase font-black tracking-wider rounded-full border bg-white/20 text-white border-white/30 backdrop-blur-md shadow-sm">
                          Đang học
                        </span>
                        <span className="px-2.5 py-1 text-[10px] uppercase font-black tracking-wider rounded-full border bg-black/30 text-white border-white/10 backdrop-blur-md shadow-sm">
                          {course.course_code}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 flex flex-col flex-1 p-6">
                    <div className="mb-4">
                      <h3 className="mb-2 text-xl font-black leading-tight text-white transition-colors line-clamp-2 group-hover:text-white drop-shadow-sm">
                        {course.name}
                      </h3>
                      <p className="text-sm font-medium leading-relaxed text-gray-300 line-clamp-2">
                        {course.short_description}
                      </p>
                    </div>

                    <div className="mt-auto">
                      <div className="flex items-center justify-between mb-2 text-xs font-bold">
                        <span className="text-gray-400">Tiến độ</span>
                        <span className={theme.text}>{course.progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className={`h-full bg-gradient-to-r ${theme.primary} rounded-full`}
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-5 mt-5 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          <DocumentTextIcon className={`w-4 h-4 ${theme.text}`} />
                          <span className="text-xs font-bold text-gray-400">
                            <span className="text-white">{course.lesson_count}</span> bài học
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute z-20 transition-all duration-200 translate-y-4 opacity-0 bottom-6 right-6 group-hover:opacity-100 group-hover:translate-y-0">
                    <button 
                      title="Tiếp tục học" 
                      className={`p-3.5 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.3)] bg-gradient-to-r ${theme.primary} text-white hover:scale-110 transition-transform`}
                    >
                      <PlayIcon className="w-5 h-5 pl-0.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
