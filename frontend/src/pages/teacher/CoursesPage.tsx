import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  PlayIcon, EmojiSadIcon, EyeIcon, XIcon, DocumentTextIcon, ChevronLeftIcon,
  SearchIcon, CalendarIcon, ChartBarIcon, HashtagIcon, SortAscendingIcon,
  SortDescendingIcon, ViewGridIcon, ViewListIcon, TableIcon, CheckIcon,
  FilterIcon, AcademicCapIcon, SparklesIcon, TagIcon, BadgeCheckIcon
} from "@heroicons/react/solid";
// 👆 Đã xóa "HashIcon" ở dòng trên vì thư viện không có, và HashtagIcon đã được import rồi

import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";

import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

// --- CONSTANTS & CONFIG ---
const ESSENTIAL_CODES = ["REA", "REAX", "REB", "REBX", "REC", "RECX", "RED", "REDX"];
const PRIME_CODES = ["RPA", "RPAX", "RPB", "RPBX", "RPC", "RPCX", "RPD", "RPDX"];

const COURSE_THEMES: any = {
  purple: { name: 'Tím', primary: 'from-violet-600 via-purple-600 to-fuchsia-600', text: 'text-purple-400', bg: 'bg-purple-950/40', bgHover: 'hover:bg-purple-900/50', border: 'border-purple-500/30', hoverBorder: 'group-hover:border-purple-400/60', hex: '#a855f7', bgSolid: 'bg-[#a855f7]' },
  blue: { name: 'Xanh Dương', primary: 'from-blue-600 via-cyan-600 to-teal-500', text: 'text-cyan-400', bg: 'bg-blue-950/40', bgHover: 'hover:bg-blue-900/50', border: 'border-cyan-500/30', hoverBorder: 'group-hover:border-cyan-400/60', hex: '#06b6d4', bgSolid: 'bg-[#06b6d4]' },
  green: { name: 'Xanh Lá', primary: 'from-emerald-600 via-green-600 to-lime-500', text: 'text-emerald-400', bg: 'bg-emerald-950/40', bgHover: 'hover:bg-emerald-900/50', border: 'border-emerald-500/30', hoverBorder: 'group-hover:border-emerald-400/60', hex: '#34d399', bgSolid: 'bg-[#34d399]' },
  orange: { name: 'Cam', primary: 'from-orange-600 via-amber-600 to-yellow-500', text: 'text-orange-400', bg: 'bg-orange-950/40', bgHover: 'hover:bg-orange-900/50', border: 'border-orange-500/30', hoverBorder: 'group-hover:border-orange-400/60', hex: '#fb923c', bgSolid: 'bg-[#fb923c]' },
  pink: { name: 'Hồng', primary: 'from-pink-600 via-rose-600 to-red-500', text: 'text-pink-400', bg: 'bg-pink-950/40', bgHover: 'hover:bg-pink-900/50', border: 'border-pink-500/30', hoverBorder: 'group-hover:border-pink-400/60', hex: '#ec4899', bgSolid: 'bg-[#ec4899]' },
};

const API_URL = "http://localhost:3000/api/courses";

interface Course {
  id: number; 
  program_id: number; 
  name: string; 
  slug?: string; 
  lesson_count: number; 
  status: string;
  sort_order: number;
  course_code?: string; 
  short_description?: string;
  general_objectives?: string; 
  age_group?: string; 
  progress?: number;
  lastAccessed?: string; 
  created_at?: string;
}

// --- ANIMATION VARIANTS ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "tween", duration: 0.2, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15 } }
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

// Grid Item
const CourseGridItem = React.memo(({ course, isPinned, theme, onPin, onView, onEnter }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
      transition={{ duration: 0.2 }}
      onClick={() => onEnter(course)}
      whileHover={{ y: -4, transition: { duration: 0.1 } }}
      className={`group relative flex flex-col cursor-pointer h-full backdrop-blur-2xl border rounded-[2rem] overflow-hidden shadow-lg ${theme.bg} ${theme.bgHover} ${theme.border} ${theme.hoverBorder} ${isPinned ? `ring-[3px] ring-offset-4 ring-offset-[#0f0518] ring-[${theme.hex}]` : ''}`}
    >
      <div className={`relative h-36 bg-gradient-to-br ${theme.primary} p-4 flex flex-col justify-between overflow-hidden`}>
          <PatternOverlay />
          <AcademicCapIcon className="absolute w-32 h-32 text-white transition-all duration-300 ease-out -right-6 -bottom-8 opacity-20 rotate-12 group-hover:rotate-0 group-hover:scale-110"/>
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex flex-wrap gap-2">
              <span className={`px-2.5 py-1 text-[10px] uppercase font-black tracking-wider rounded-full border bg-white/20 text-white border-white/30 backdrop-blur-md shadow-sm`}>
                Sẵn sàng
              </span>
              {course.course_code && <span className="px-2.5 py-1 text-[10px] uppercase font-black tracking-wider rounded-full border bg-black/30 text-white border-white/10 backdrop-blur-md shadow-sm">{course.course_code}</span>}
            </div>
            <button onClick={(e) => { e.stopPropagation(); onPin(course.id); }} title={isPinned ? "Bỏ ghim" : "Ghim"} aria-label={isPinned ? "Bỏ ghim" : "Ghim"} className={`p-2 rounded-full transition-all backdrop-blur-md shadow-sm ${isPinned ? `bg-white text-black` : 'bg-black/30 text-white/80 hover:bg-white hover:text-black'}`}>
              <HashtagIcon className="w-4 h-4" />
            </button>
          </div>
      </div>
      <div className="relative z-10 flex flex-col flex-1 p-5">
        <div className="mb-4">
            <h3 className="mb-2 text-xl font-black leading-tight text-white transition-colors line-clamp-2 group-hover:text-white drop-shadow-sm">{course.name}</h3>
            <p className="text-sm font-medium leading-relaxed text-gray-300 line-clamp-3">{course.short_description}</p>
        </div>
        <div className="flex items-center pt-4 mt-auto border-t divide-x border-white/5 divide-white/10">
            <div className="flex items-center flex-1 gap-2 pr-3"><DocumentTextIcon className={`w-4 h-4 ${theme.text}`} /><span className="text-xs font-bold text-gray-400"><span className="text-white">{course.lesson_count}</span> bài học</span></div>
            <div className="flex items-center flex-1 gap-2 pl-3"><ChartBarIcon className={`w-4 h-4 ${theme.text}`} /><span className="text-xs font-bold text-gray-400"><span className="text-white">{course.age_group}</span></span></div>
        </div>
      </div>
      <div className="absolute z-20 transition-all duration-200 translate-y-4 opacity-0 bottom-4 right-4 group-hover:opacity-100 group-hover:translate-y-0">
        <button onClick={(e) => { e.stopPropagation(); onView(course); }} title="Xem chi tiết" aria-label="Xem chi tiết" className={`p-3 rounded-full shadow-lg bg-gradient-to-r ${theme.primary} text-white hover:scale-110 transition-transform`}>
          <EyeIcon className="w-5 h-5"/>
        </button>
      </div>
    </motion.div>
  );
});

// List Item
const CourseListItem = React.memo(({ course, isPinned, theme, onPin, onView, onEnter }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10, transition: { duration: 0.1 } }}
      transition={{ duration: 0.2 }}
      onClick={() => onEnter(course)}
      whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.03)', transition: { duration: 0.1 } }}
      className={`group relative flex flex-row items-center p-3 pr-5 cursor-pointer backdrop-blur-2xl rounded-[1.2rem] overflow-hidden shadow-md border transition-all duration-200 hover:shadow-xl hover:border-white/20 ${theme.bg} ${theme.border} ${isPinned ? `border-${theme.hex}/60 bg-white/[0.02]` : ''}`}
    >
      <div className={`relative h-24 w-24 rounded-xl bg-gradient-to-br ${theme.primary} flex items-center justify-center mr-5 overflow-hidden shrink-0 shadow-lg`}>
          <PatternOverlay />
          <AcademicCapIcon className="relative z-10 w-12 h-12 transition-transform duration-300 text-white/80 group-hover:scale-110"/>
      </div>
      <div className="flex flex-col justify-center flex-1 mr-6">
          <div className="flex items-center gap-3 mb-1.5">
              {isPinned && <HashtagIcon className={`w-5 h-5 ${theme.text}`} />}
              <h3 className={`text-lg font-black text-white group-hover:${theme.text} transition-colors`}>{course.name}</h3>
              <div className="flex gap-1 ml-2">
                {course.course_code && <span className="px-2 py-0.5 text-[10px] uppercase font-black rounded border bg-white/10 text-white border-white/20">{course.course_code}</span>}
              </div>
          </div>
          <p className="mb-3 text-sm font-medium text-gray-300 line-clamp-1">{course.short_description}</p>
          <div className="flex items-center gap-5 text-xs font-bold text-gray-400">
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/20"><DocumentTextIcon className={`w-3.5 h-3.5 ${theme.text}`}/> <span className="text-white">{course.lesson_count}</span> bài</span>
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/20"><ChartBarIcon className={`w-3.5 h-3.5 ${theme.text}`}/> <span className="text-white">{course.age_group}</span></span>
              <span className="flex items-center gap-1.5 ml-auto font-medium text-gray-500"><CalendarIcon className={`w-3.5 h-3.5`}/> {course.lastAccessed}</span>
          </div>
      </div>
      <div className="flex flex-col items-end w-auto gap-3 pl-6 my-2 border-l border-white/5">
          <button onClick={(e) => { e.stopPropagation(); onView(course); }} title="Xem chi tiết" aria-label="Xem chi tiết" className="p-2 text-gray-400 transition-all rounded-full bg-white/5 hover:bg-white/20 hover:text-white group-hover:scale-110"><EyeIcon className="w-5 h-5"/></button>
          <button onClick={(e) => { e.stopPropagation(); onPin(course.id); }} title={isPinned ? "Bỏ ghim" : "Ghim"} aria-label={isPinned ? "Bỏ ghim" : "Ghim"} className={`p-2 rounded-full transition-all group-hover:scale-110 ${isPinned ? `bg-white text-black shadow-[0_0_10px_${theme.hex}]` : 'bg-white/5 text-gray-400 hover:text-white'}`}><HashtagIcon className="w-5 h-5" /></button>
      </div>
    </motion.div>
  );
});

// Table Row
const CourseTableRow = React.memo(({ course, isPinned, theme, onPin, onView, onEnter }: any) => {
  return (
    <motion.tr 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0, transition: { duration: 0.1 } }}
      transition={{ duration: 0.15 }}
      onClick={() => onEnter(course)}
      className={`transition-all cursor-pointer group hover:bg-white/[0.04] ${isPinned ? 'bg-white/[0.02]' : ''}`}
    >
      <td className="p-5 pl-8">
          <div className="flex items-center gap-5">
              <div className={`w-14 h-14 flex items-center justify-center rounded-2xl shrink-0 bg-gradient-to-br ${theme.primary} shadow-lg relative overflow-hidden group-hover:scale-105 transition-transform`}>
                 <PatternOverlay />
                 <AcademicCapIcon className={`w-7 h-7 text-white relative z-10`} />
              </div>
              <div>
                  <div className="flex items-center gap-2 mb-1">
                      {isPinned && <HashtagIcon className={`w-3.5 h-3.5 ${theme.text}`} />}
                      <span className={`font-black text-base text-white group-hover:${theme.text} transition-colors`}>{course.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <CalendarIcon className="w-3 h-3"/> {course.lastAccessed}
                  </div>
              </div>
          </div>
      </td>
      <td className="p-5">{course.course_code ? <span className="px-2 py-1 font-mono text-xs font-bold rounded-md text-white/80 bg-white/10">{course.course_code}</span> : <span className="text-gray-600">-</span>}</td>
      <td className="p-5">
          <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 text-[10px] uppercase font-black rounded-full border bg-green-500/10 text-green-400 border-green-500/20`}>
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex w-full h-full bg-green-400 rounded-full opacity-75 animate-ping"></span>
                <span className="relative inline-flex w-2 h-2 bg-green-500 rounded-full"></span>
              </span>
              Published
          </span>
      </td>
      <td className="p-5 font-bold text-white"><span className="font-medium text-gray-400">{course.lesson_count}</span> bài</td>
      <td className="p-5 font-bold text-white"><span className="font-medium text-gray-400">{course.age_group}</span></td>
      <td className="p-5 pr-8 text-right">
          <div className="flex items-center justify-end gap-2 transition-all transform translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0">
              <button onClick={(e) => { e.stopPropagation(); onPin(course.id); }} title={isPinned ? "Bỏ ghim" : "Ghim"} aria-label={isPinned ? "Bỏ ghim" : "Ghim"} className={`p-2 rounded-full transition-all hover:scale-110 ${isPinned ? `bg-${theme.hex} text-white shadow-sm` : 'text-gray-400 hover:text-white hover:bg-white/10'}`}><HashtagIcon className="w-4 h-4"/></button>
              <button onClick={(e) => { e.stopPropagation(); onView(course); }} title="Xem chi tiết" aria-label="Xem chi tiết" className="p-2 text-gray-400 transition-all rounded-full hover:text-white hover:bg-white/10 hover:scale-110"><EyeIcon className="w-4 h-4"/></button>
          </div>
      </td>
    </motion.tr>
  );
});

// --- MAIN PAGE COMPONENT ---
const CoursesPage = () => {
  const navigate = useNavigate();
  // 🔥 1. Hook để đọc query params từ URL
  const [searchParams, setSearchParams] = useSearchParams();

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [programName, setProgramName] = useState("");

  const [pinnedCourses, setPinnedCourses] = useState<number[]>([]);
  const [courseColors, setCourseColors] = useState<{[key: number]: string}>({});

  const [showSortSelector, setShowSortSelector] = useState(false);
  const [sortOption, setSortOption] = useState<"name_asc" | "name_desc" | "newest">("newest");
  
  const [showCodeFilter, setShowCodeFilter] = useState(false);
  
  // 🔥 2. State filterCode khởi tạo từ URL (nếu có), fallback về "all"
  const [filterCode, setFilterCode] = useState<string>(searchParams.get("code") || "all");

  const [viewMode, setViewMode] = useState<"grid" | "list" | "table">("grid");
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingCourse, setViewingCourse] = useState<Course | null>(null);

  // 🔥 3. Effect: Lắng nghe URL thay đổi để cập nhật filterCode
  useEffect(() => {
    const codeFromUrl = searchParams.get("code");
    if (codeFromUrl) {
      setFilterCode(codeFromUrl);
    } else {
      setFilterCode("all");
    }
  }, [searchParams]);

  // Load saved preferences
  useEffect(() => {
    const savedPins = localStorage.getItem("teacher_pinned_courses");
    const savedView = localStorage.getItem("teacher_view_mode");
    const savedColors = localStorage.getItem("teacher_course_colors"); 

    if (savedPins) setPinnedCourses(JSON.parse(savedPins));
    if (savedView) setViewMode(savedView as any);
    if (savedColors) setCourseColors(JSON.parse(savedColors));
  }, []);

  const getCourseTheme = useCallback((courseId: number) => {
      const colorKey = courseColors[courseId] || 'purple'; 
      return COURSE_THEMES[colorKey];
  }, [courseColors]);

  const handleColorChange = useCallback((courseId: number, colorKey: string) => {
      const newColors = { ...courseColors, [courseId]: colorKey };
      setCourseColors(newColors);
      localStorage.setItem("teacher_course_colors", JSON.stringify(newColors));
  }, [courseColors]);

  const togglePin = useCallback((courseId: number) => {
    setPinnedCourses(prev => {
        let newPins;
        if (prev.includes(courseId)) {
          newPins = prev.filter(id => id !== courseId);
        } else {
          newPins = [...prev, courseId];
        }
        localStorage.setItem("teacher_pinned_courses", JSON.stringify(newPins));
        return newPins;
    });
  }, []);

  const changeViewMode = (mode: "grid" | "list" | "table") => {
    setViewMode(mode);
    localStorage.setItem("teacher_view_mode", mode);
  };

  const handleEnterClass = useCallback((course: Course) => {
    navigate(`/teacher/courses/${course.id}`, { 
      state: { 
        courseInfo: {
          name: course.name,
          code: course.course_code
        } 
      } 
    });
  }, [navigate]);

  const handleViewDetails = useCallback((course: Course) => {
    setViewingCourse(course);
    setIsModalOpen(true);
  }, []);

  // 🔥 UPDATE: Mapping logic to include sort_order and FILTER PUBLISHED only
  const fetchCourses = async () => {
    setIsLoading(true);
    const selectedProgramId = localStorage.getItem("selected_program_id");
    const selectedProgramName = localStorage.getItem("selected_program_name");

    if (!selectedProgramId) {
      navigate("/teacher/programs");
      return;
    }
    setProgramName(selectedProgramName || "Danh sách khóa học");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
          navigate("/login");
          return;
      }

      const headers: any = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };
      const response = await fetch(`${API_URL}/me`, { headers });
      
      if (response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
      }

      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

      const data = await response.json();
      let rawList = [];
      if (data.courses && Array.isArray(data.courses)) rawList = data.courses;
      else if (Array.isArray(data)) rawList = data;
      else if (data.data && Array.isArray(data.data)) rawList = data.data;

      const mappedData = rawList.map((item: any) => ({
        id: item.id,
        program_id: item.program_id,
        name: item.name || "Chưa đặt tên",
        slug: item.slug || "",
        lesson_count: item.lesson_count || 0,
        status: item.status || 'draft',
        sort_order: item.sort_order ?? 9999,
        course_code: item.course_code ? String(item.course_code).trim().toUpperCase() : "", 
        short_description: item.short_description || "Chưa có mô tả.",
        general_objectives: item.general_objectives || "",
        age_group: item.age_group || "Mọi lứa tuổi",
        progress: item.progress || 0,
        lastAccessed: item.updated_at ? new Date(item.updated_at).toLocaleDateString('vi-VN') : "Mới",
        created_at: item.created_at
      }));

      // 🔥 STRICT FILTER: Chỉ lấy program_id khớp VÀ status là 'published'
      const filtered = mappedData.filter((c: Course) => 
        String(c.program_id) === String(selectedProgramId) && 
        c.status === 'published'
      );
      
      setCourses(filtered);

    } catch (error) {
      console.error("Lỗi tải danh sách:", error);
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  const currentFilterList = useMemo(() => {
    if (programName.toLowerCase().includes("prime")) {
        return PRIME_CODES;
    }
    return ESSENTIAL_CODES;
  }, [programName]);

  const processedCourses = useMemo(() => {
    let result = [...courses];
    
    // Filter bằng biến filterCode (được đồng bộ từ URL)
    if (filterCode !== "all") {
        result = result.filter(c => c.course_code === filterCode);
    }

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(lowerTerm) || 
        (c.course_code && c.course_code.toLowerCase().includes(lowerTerm))
      );
    }

    result.sort((a, b) => {
        const isAPinned = pinnedCourses.includes(a.id);
        const isBPinned = pinnedCourses.includes(b.id);
        if (isAPinned && !isBPinned) return -1;
        if (!isAPinned && isBPinned) return 1;
        if (isAPinned && isBPinned) return 0;

        if (sortOption === "name_asc") return a.name.localeCompare(b.name);
        else if (sortOption === "name_desc") return b.name.localeCompare(a.name);
        else if (sortOption === "newest") {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
            if (dateA === dateB) return a.sort_order - b.sort_order;
            return dateB - dateA;
        }
        
        return a.sort_order - b.sort_order;
    });

    return result;
  }, [courses, searchTerm, pinnedCourses, sortOption, filterCode]);

  const getSortLabel = () => {
      switch(sortOption) {
          case "name_asc": return "A-Z";
          case "name_desc": return "Z-A";
          case "newest": return "Mới nhất";
          default: return "Sắp xếp";
      }
  };

  const modalTheme = useMemo(() => {
    if (!viewingCourse) return COURSE_THEMES['purple'];
    return getCourseTheme(viewingCourse.id) || COURSE_THEMES['purple'];
  }, [viewingCourse, getCourseTheme]);

  // 🔥 Helper cập nhật URL khi bấm filter thủ công
  const handleFilterChange = (code: string) => {
    setFilterCode(code);
    setShowCodeFilter(false);
    if (code === "all") {
      setSearchParams({}); // Xóa query param
    } else {
      setSearchParams({ code }); // Set ?code=...
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0f0518] text-slate-200 font-sans selection:bg-[#ffe400] selection:text-black overflow-x-hidden">
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; transition: all 0.3s ease; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }
      `}</style>

      <DynamicBackground />

      <div className="relative z-10">
        <Header />
      </div>

      <main className="relative z-10 flex-1 min-h-screen p-6 md:p-8 lg:px-12">
        <div className="container mx-auto max-w-7xl">

          {/* --- TOP NAVIGATION BAR --- */}
          <div className="flex flex-col justify-between gap-8 mb-12 lg:flex-row lg:items-end">
            <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="space-y-4">
              <button onClick={() => navigate("/teacher/programs")} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#ffe400] bg-[#ffe400]/10 rounded-full hover:bg-[#ffe400]/20 transition-all w-fit group">
                <ChevronLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Quay lại Chương trình
              </button>
              <div className="relative pt-2">
                  <h1 className="mb-3 text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 md:text-6xl drop-shadow-xl">{programName}</h1>
                  <p className="flex items-center max-w-2xl gap-2 text-lg font-medium text-gray-400"><SparklesIcon className="w-5 h-5 text-[#ffe400]"/> Quản lý tiến độ giảng dạy và tài nguyên lớp học.</p>
              </div>
            </motion.div>

            {/* --- TOOLBAR --- */}
            <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="flex flex-col items-end w-full gap-5 lg:w-auto">
              
              <div className="relative z-50 flex flex-wrap justify-end w-full gap-3 p-2 rounded-3xl bg-[#1a0b2e]/40 backdrop-blur-xl border border-white/10 shadow-xl">
                  {/* Filter by Code */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowCodeFilter(!showCodeFilter)} 
                      className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold transition-all border rounded-2xl 
                        ${filterCode !== 'all' ? 'bg-[#ffe400] text-black border-[#ffe400] shadow-[0_0_20px_rgba(255,228,0,0.4)] hover:bg-[#ffe400]/90' : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10'}
                      `}
                    >
                      <FilterIcon className="w-4 h-4" />
                      <span>{filterCode === 'all' ? 'Tất cả mã' : filterCode}</span>
                      <ChevronLeftIcon className={`w-3 h-3 ml-1 transition-transform duration-300 ${showCodeFilter ? '-rotate-90' : '-rotate-180'}`} />
                    </button>
                    
                    <AnimatePresence>
                      {showCodeFilter && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2, type: 'spring' }}
                          className="absolute right-0 z-50 w-64 mt-3 overflow-hidden border shadow-2xl bg-[#0f0518]/95 backdrop-blur-3xl border-white/10 rounded-3xl ring-1 ring-white/5 origin-top-right"
                        >
                            <div className="px-5 py-4 text-[11px] font-black tracking-widest text-gray-500 uppercase border-b border-white/5 bg-white/[0.02]">Lọc theo mã khóa học</div>
                            <div className="p-3 space-y-2 overflow-y-auto max-h-72 custom-scrollbar">
                                <button 
                                  onClick={() => handleFilterChange("all")} 
                                  className={`flex items-center justify-between w-full px-4 py-3 text-xs font-bold rounded-2xl transition-all ${filterCode === 'all' ? 'bg-[#ffe400] text-black shadow-lg shadow-yellow-500/30 scale-[1.02]' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
                                >
                                  <span>Tất cả mã</span>
                                  {filterCode === 'all' && <CheckIcon className="w-4 h-4"/>}
                                </button>
                                <div className="h-px my-2 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                                {currentFilterList.map((code) => {
                                  const isActive = filterCode === code;
                                  return (
                                    <button 
                                      key={code} 
                                      onClick={() => handleFilterChange(code)} 
                                      className={`flex items-center justify-between w-full px-4 py-3 text-xs font-bold rounded-2xl transition-all group ${isActive ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 scale-[1.02]' : 'text-gray-400 hover:bg-white/10 hover:text-white hover:translate-x-1'}`}
                                    >
                                      <span>{code}</span>
                                      {isActive && <CheckIcon className="w-4 h-4"/>}
                                    </button>
                                  )
                                })}
                            </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Sort Picker */}
                  <div className="relative">
                    <button onClick={() => setShowSortSelector(!showSortSelector)} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-300 transition-all border rounded-2xl bg-white/5 border-white/10 hover:border-[#ffe400]/50 hover:bg-white/10 hover:text-white">
                      {sortOption === 'name_desc' ? <SortDescendingIcon className="w-4 h-4" /> : <SortAscendingIcon className="w-4 h-4" />}
                      <span className="hidden sm:inline">{getSortLabel()}</span>
                    </button>
                    {showSortSelector && (
                      <div className="absolute right-0 z-50 w-48 p-2 mt-3 border shadow-2xl bg-[#1a0b2e]/95 backdrop-blur-3xl border-white/10 rounded-3xl origin-top-right">
                          <button onClick={() => { setSortOption("name_asc"); setShowSortSelector(false); }} className={`flex items-center w-full gap-3 px-4 py-3 text-xs font-bold rounded-2xl transition-all ${sortOption === 'name_asc' ? 'bg-white/10 text-[#ffe400]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}><SortAscendingIcon className="w-4 h-4"/> Tên A-Z</button>
                          <button onClick={() => { setSortOption("name_desc"); setShowSortSelector(false); }} className={`flex items-center w-full gap-3 px-4 py-3 text-xs font-bold rounded-2xl transition-all ${sortOption === 'name_desc' ? 'bg-white/10 text-[#ffe400]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}><SortDescendingIcon className="w-4 h-4"/> Tên Z-A</button>
                          <button onClick={() => { setSortOption("newest"); setShowSortSelector(false); }} className={`flex items-center w-full gap-3 px-4 py-3 text-xs font-bold rounded-2xl transition-all ${sortOption === 'newest' ? 'bg-white/10 text-[#ffe400]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}><CalendarIcon className="w-4 h-4"/> Mới nhất</button>
                      </div>
                    )}
                  </div>

                  {/* View Mode */}
                  <div className="flex p-1.5 border rounded-2xl bg-black/20 border-white/5 backdrop-blur-md">
                      <button onClick={() => changeViewMode("grid")} className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white/15 text-[#ffe400] shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`} title="Lưới"><ViewGridIcon className="w-4 h-4"/></button>
                      <button onClick={() => changeViewMode("list")} className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white/15 text-[#ffe400] shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`} title="Danh sách"><ViewListIcon className="w-4 h-4"/></button>
                      <button onClick={() => changeViewMode("table")} className={`p-2 rounded-xl transition-all ${viewMode === 'table' ? 'bg-white/15 text-[#ffe400] shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`} title="Bảng"><TableIcon className="w-4 h-4"/></button>
                  </div>
              </div>

              {/* KHỐI TÌM KIẾM */}
              <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 p-2 bg-[#1a0b2e]/50 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-xl w-full lg:w-auto hover:border-white/20 transition-colors">
                <div className="relative w-full group sm:w-72">
                  <SearchIcon className="absolute w-5 h-5 text-gray-500 transition-colors top-3 left-4 group-focus-within:text-[#ffe400]" />
                  <input type="text" placeholder="Tìm kiếm khóa học..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full py-2.5 pr-6 text-sm font-bold text-white placeholder-gray-500 transition-all bg-transparent border-none outline-none pl-12 focus:ring-0" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* --- RENDER CONTENT --- */}
          {isLoading ? (
            <div className="py-40 text-center">
              <div className="relative w-20 h-20 mx-auto mb-8">
                 <div className="absolute inset-0 border-4 rounded-full border-white/10"></div>
                 <div className="absolute inset-0 rounded-full border-4 border-t-[#ffe400] animate-spin border-l-transparent border-r-transparent border-b-transparent"></div>
              </div>
              <p className="text-sm font-bold tracking-widest text-gray-400 uppercase animate-pulse">Đang tải dữ liệu...</p>
            </div>
          ) : processedCourses.length > 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {processedCourses.map(course => (
                        <CourseGridItem 
                          key={course.id} 
                          course={course} 
                          isPinned={pinnedCourses.includes(course.id)} 
                          theme={getCourseTheme(course.id)}
                          onPin={togglePin}
                          onView={handleViewDetails}
                          onEnter={handleEnterClass}
                        />
                      ))}
                  </div>
                )}
                
                {viewMode === 'list' && (
                  <div className="flex flex-col gap-3">
                      {processedCourses.map(course => (
                        <CourseListItem 
                          key={course.id} 
                          course={course} 
                          isPinned={pinnedCourses.includes(course.id)} 
                          theme={getCourseTheme(course.id)}
                          onPin={togglePin}
                          onView={handleViewDetails}
                          onEnter={handleEnterClass}
                        />
                      ))}
                  </div>
                )}
                
                {viewMode === 'table' && (
                   <div className={`overflow-hidden border shadow-2xl backdrop-blur-2xl rounded-[2rem] bg-[#120822]/80 border-white/10`}>
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-xs font-black tracking-wider text-gray-400 uppercase border-b border-white/10 bg-white/[0.02]">
                          <th className="p-5 pl-8 rounded-tl-[2rem]">Khóa học</th><th className="p-5">Mã</th><th className="p-5">Trạng thái</th><th className="p-5">Bài học</th><th className="p-5">Độ tuổi</th><th className="p-5 pr-8 text-right rounded-tr-[2rem]">Hành động</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm text-gray-300 divide-y divide-white/5">
                          {processedCourses.map(course => (
                            <CourseTableRow 
                              key={course.id} 
                              course={course} 
                              isPinned={pinnedCourses.includes(course.id)} 
                              theme={getCourseTheme(course.id)}
                              onPin={togglePin}
                              onView={handleViewDetails}
                              onEnter={handleEnterClass}
                            />
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="col-span-full flex flex-col items-center justify-center py-32 text-center relative overflow-hidden border border-white/10 bg-white/5 backdrop-blur-2xl rounded-[3rem] group shadow-2xl">
              <div className="absolute inset-0 transition-opacity duration-1000 opacity-0 bg-[radial-gradient(circle_at_center,#ffe40010,transparent_50%)] group-hover:opacity-100"></div>
              <PatternOverlay />
              <motion.div animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="relative z-10 w-32 h-32 bg-gradient-to-br from-[#1a0b2e] to-[#2a1b3e] rounded-full flex items-center justify-center mb-8 border border-white/10 shadow-[0_0_60px_-10px_rgba(255,228,0,0.15)]">
                <EmojiSadIcon className="w-16 h-16 text-gray-500 transition-colors duration-300 group-hover:text-[#ffe400]" />
              </motion.div>
              <h3 className="relative z-10 mb-3 text-3xl font-black text-white">Không tìm thấy lớp học nào</h3>
              <p className="relative z-10 max-w-md mx-auto mb-10 text-lg font-medium leading-relaxed text-gray-400">
                {filterCode !== "all" ? <span>Không có khóa học nào thuộc mã <span className="font-bold text-white">"{filterCode}"</span>.</span> : "Có vẻ như chưa có lớp học nào phù hợp với tìm kiếm của bạn."}
              </p>
              <button onClick={() => handleFilterChange("all")} className="relative z-10 px-10 py-4 text-sm font-black text-black transition-all bg-[#ffe400] rounded-full shadow-xl hover:bg-white shadow-yellow-500/20 hover:-translate-y-1 hover:shadow-yellow-500/40 active:scale-95">Xóa bộ lọc tìm kiếm</button>
            </motion.div>
          )}
        </div>
      </main>

      <div className="relative z-0">
         <Footer />
      </div>

      {/* --- MODAL VIEW DETAIL --- */}
      <AnimatePresence>
      {isModalOpen && viewingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="absolute inset-0 bg-[#0f0518]/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></motion.div>
          <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" className={`relative w-full max-w-3xl rounded-[3rem] shadow-[0_0_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-3xl border-2 flex flex-col max-h-[85vh] ${modalTheme.border} ${modalTheme.bg}`} onClick={(e) => e.stopPropagation()}>
            <div className={`relative flex-shrink-0 h-48 bg-gradient-to-br ${modalTheme.primary} p-8 overflow-hidden flex flex-col justify-end`}>
               <PatternOverlay />
               <AcademicCapIcon className="absolute w-48 h-48 text-white pointer-events-none -right-10 -top-10 opacity-10 rotate-12"/>
               
               <button onClick={() => setIsModalOpen(false)} title="Đóng modal" aria-label="Đóng modal" className={`absolute top-6 right-6 p-2.5 rounded-full bg-black/20 text-white hover:text-black transition-all border border-white/10 hover:bg-white backdrop-blur-md z-20`}>
                    <XIcon className="w-6 h-6" />
               </button>

               <div className="relative z-10">
                    {/* 🔥 UPDATE: Thêm pr-12 để tránh bị nút X che mất Color Picker */}
                    <div className="flex items-center gap-3 pr-12 mb-4">
                        <span className={`px-3 py-1 text-[10px] uppercase font-black tracking-wider rounded-full border bg-white/20 text-white border-white/30 backdrop-blur-md shadow-sm`}>Ready</span>
                        {viewingCourse.course_code && <span className="px-3 py-1 text-[10px] uppercase font-black tracking-wider rounded-full border bg-black/20 text-white border-white/10 backdrop-blur-md shadow-sm">{viewingCourse.course_code}</span>}
                        {/* 🔥 UPDATE MODAL: Thêm Status Badge */}
                        <span className={`px-3 py-1 text-[10px] uppercase font-black tracking-wider rounded-full border bg-black/20 text-white border-white/10 backdrop-blur-md shadow-sm flex items-center gap-1`}>
                            <BadgeCheckIcon className="w-3 h-3"/> {viewingCourse.status}
                        </span>

                        <div className="flex gap-1.5 p-1.5 ml-auto bg-black/30 backdrop-blur-md rounded-full border border-white/10">
                            {Object.keys(COURSE_THEMES).map((key) => {
                                const theme = COURSE_THEMES[key];
                                const isActive = (courseColors[viewingCourse.id] || 'purple') === key;
                                return (
                                    <button key={key} onClick={() => handleColorChange(viewingCourse.id, key)} aria-label={`Đổi màu chủ đề sang ${theme.name}`} className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${theme.bgSolid} ${isActive ? 'scale-110 ring-[3px] ring-white shadow-sm' : 'opacity-80 hover:opacity-100 hover:scale-110'}`} title={theme.name}>
                                            {isActive && <CheckIcon className="w-4 h-4 text-black/60" />}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                    <h2 className="text-4xl font-black leading-tight text-white drop-shadow-md">{viewingCourse.name}</h2>
                    {viewingCourse.slug && <p className="px-3 py-1 mt-2 font-mono text-sm rounded-lg text-white/70 bg-black/10 w-fit">/{viewingCourse.slug}</p>}
               </div>
            </div>
            
            <div className="flex-1 p-8 space-y-8 overflow-y-auto custom-scrollbar bg-[#130725]/95">
               <div className="grid grid-cols-2 gap-5">
                  <div className={`p-5 text-center border bg-white/5 rounded-3xl ${modalTheme.border} shadow-sm`}>
                      <DocumentTextIcon className={`w-6 h-6 mx-auto mb-2 ${modalTheme.text}`}/>
                      <div className="mb-1 text-xs font-black tracking-wider text-gray-500 uppercase">Số bài học</div>
                      <div className="text-3xl font-black text-white">{viewingCourse.lesson_count}</div>
                  </div>
                  <div className={`p-5 text-center border bg-white/5 rounded-3xl ${modalTheme.border} shadow-sm`}>
                      <ChartBarIcon className={`w-6 h-6 mx-auto mb-2 ${modalTheme.text}`}/>
                      <div className="mb-1 text-xs font-black tracking-wider text-gray-500 uppercase">Độ tuổi</div>
                      <div className="text-2xl font-black text-white">{viewingCourse.age_group}</div>
                  </div>
               </div>
               
               <div className="space-y-4">
                 <h3 className={`text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3 ${modalTheme.text}`}><DocumentTextIcon className="w-5 h-5"/> Mô tả khóa học</h3>
                 <div className={`p-6 text-base leading-relaxed text-gray-300 border rounded-3xl bg-black/20 ${modalTheme.border} shadow-inner font-medium`}>{viewingCourse.short_description}</div>
               </div>

               {viewingCourse.general_objectives && (
                 <div className="space-y-4">
                   <h3 className={`text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3 ${modalTheme.text}`}><AcademicCapIcon className="w-5 h-5"/> Mục tiêu học tập</h3>
                   <div className={`p-6 text-base leading-relaxed text-gray-300 border rounded-3xl bg-black/20 ${modalTheme.border} shadow-inner font-medium relative overflow-hidden`}>
                     <PatternOverlay />
                     <div className="relative z-10">{viewingCourse.general_objectives}</div>
                   </div>
                 </div>
               )}

               <div className="pt-6 mt-8 border-t border-white/5">
                  <h3 className="mb-3 text-xs font-black tracking-widest text-gray-500 uppercase">Thông tin kỹ thuật</h3>
                  <div className="grid grid-cols-2 gap-4 font-mono text-xs text-gray-400 md:grid-cols-3">
                      <div className="p-3 border rounded-xl bg-white/5 border-white/5">
                        <span className="block mb-1 text-gray-500 uppercase text-[10px]">ID Khóa học</span>
                        <span className="text-white">#{viewingCourse.id}</span>
                      </div>
                      <div className="p-3 border rounded-xl bg-white/5 border-white/5">
                        <span className="block mb-1 text-gray-500 uppercase text-[10px]">Program ID</span>
                        <span className="text-white">#{viewingCourse.program_id}</span>
                      </div>
                      <div className="p-3 border rounded-xl bg-white/5 border-white/5">
                        <span className="block mb-1 text-gray-500 uppercase text-[10px]">Thứ tự hiển thị</span>
                        <span className="text-white">{viewingCourse.sort_order}</span>
                      </div>
                  </div>
               </div>
            </div>
            
            <div className="flex-shrink-0 p-6 border-t bg-[#0f0518] border-white/10">
               <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-500 rounded-full bg-white/5"><CalendarIcon className="w-4 h-4"/> Truy cập gần nhất: {viewingCourse.lastAccessed}</div>
                   <button onClick={() => { setIsModalOpen(false); handleEnterClass(viewingCourse); }} className={`flex items-center gap-3 px-10 py-4 rounded-2xl text-base font-black text-white bg-gradient-to-r ${modalTheme.primary} hover:opacity-90 transition-all shadow-lg hover:-translate-y-1 hover:shadow-${modalTheme.hex}/30 active:scale-95`}>
                        <PlayIcon className="w-6 h-6" /> Vào lớp học
                   </button>
               </div>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default CoursesPage;