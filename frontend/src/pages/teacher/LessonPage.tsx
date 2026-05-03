import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowLeftIcon, PlayIcon, CheckCircleIcon,
  VideoCameraIcon, DocumentTextIcon,
  ClockIcon, EmojiSadIcon, SearchIcon, ViewListIcon, ViewGridIcon, CollectionIcon,
  LightningBoltIcon, ChevronRightIcon, LockClosedIcon, SparklesIcon, HashtagIcon
} from "@heroicons/react/solid";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// --- CẤU HÌNH ---
const API_BASE_URL = "http://localhost:3000/api";

const LessonPage = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const location = useLocation(); 

  // --- STATE ---
  const [course, setCourse] = useState<any>(location.state?.courseInfo || null);
  const [rawLessons, setRawLessons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filter & Sort & Pin State
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'timeline'>('list');
  const [pinnedLessonIds, setPinnedLessonIds] = useState<number[]>([]);

  // Background Animation
  const [showPurpleGlow, setShowPurpleGlow] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setShowPurpleGlow(prev => !prev);
    }, 4000); 
    return () => clearInterval(timer);
  }, []);

  // --- 1. LOAD SAVED PINS ---
  useEffect(() => {
    if (id) {
        const savedPins = localStorage.getItem(`pinned_lessons_course_${id}`);
        if (savedPins) {
            try {
                setPinnedLessonIds(JSON.parse(savedPins));
            } catch (e) { console.error("Error parsing pins", e); }
        }
    }
  }, [id]);

  // --- 2. TOGGLE PIN ---
  const togglePin = (lessonId: number) => {
      let newPins;
      if (pinnedLessonIds.includes(lessonId)) {
          newPins = pinnedLessonIds.filter(pid => pid !== lessonId);
      } else {
          newPins = [...pinnedLessonIds, lessonId];
      }
      setPinnedLessonIds(newPins);
      localStorage.setItem(`pinned_lessons_course_${id}`, JSON.stringify(newPins));
  };

  // --- 3. FETCH DATA ---
  useEffect(() => {
    const fetchAllData = async () => {
      if (!id) return;
      if (!course) setIsLoading(true);
      setErrorMsg(null);

      const token = localStorage.getItem("token");
      if (!token) {
          navigate("/login");
          return;
      }
      
      const headers: any = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };

      try {
        // Fetch Course
        const courseRes = await fetch(`${API_BASE_URL}/courses/${id}`, { headers });
        if (courseRes.ok) {
           const courseJson = await courseRes.json();
           const fetchedData = courseJson.data || courseJson;
           setCourse((prev: any) => ({
             ...prev,          
             ...fetchedData,   
             name: fetchedData.name || prev?.name || "Khóa học không tên"
           }));
        } else if (!course) {
           setCourse({ name: "Chi tiết khóa học", code: `COURSE-${id}` });
        }

        // Fetch Lessons
        const lessonRes = await fetch(`${API_BASE_URL}/lessons/course/${id}`, { headers });
        if (lessonRes.status === 403) throw new Error("FORBIDDEN");
        if (lessonRes.ok) {
          const lessonJson = await lessonRes.json();
          let list: any[] = [];
          if (Array.isArray(lessonJson)) list = lessonJson;
          else if (lessonJson.data && Array.isArray(lessonJson.data)) list = lessonJson.data;
          else if (lessonJson.lessons) list = lessonJson.lessons;

          list = list.filter((l: any) => l.status === 'published');
          setRawLessons(list);
        }
      } catch (error: any) {
        if (error.message === "FORBIDDEN") setErrorMsg("Bạn không có quyền truy cập.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, [id, navigate]); 

  // --- 4. PROCESSING DATA (FILTER & SORT) ---
  const processedSyllabus = useMemo(() => {
    let lessons = [...rawLessons];

    // Filter
    if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        lessons = lessons.filter(l => 
            (l.title && l.title.toLowerCase().includes(lowerTerm)) ||
            (l.description && l.description.toLowerCase().includes(lowerTerm))
        );
    }

    // Sort
    lessons.sort((a, b) => {
        // Pinned first
        const isAPinned = pinnedLessonIds.includes(a.id);
        const isBPinned = pinnedLessonIds.includes(b.id);
        if (isAPinned && !isBPinned) return -1;
        if (!isAPinned && isBPinned) return 1;

        // Order
        const orderA = a.sort_order ?? 9999;
        const orderB = b.sort_order ?? 9999;
        if (orderA !== orderB) return orderA - orderB;

        // Name Natural Sort
        const titleA = a.title || "";
        const titleB = b.title || "";
        return titleA.localeCompare(titleB, undefined, { numeric: true, sensitivity: 'base' });
    });

    if (lessons.length > 0) {
        return [{
            id: 'main',
            title: "Nội dung chương trình",
            lessons: lessons.map((l: any) => ({
                id: l.id,
                title: l.title || l.name || "Bài học không tên",
                type: l.type || 'doc', 
                duration: l.duration || '45 phút',
                isCompleted: false, 
                description: l.description || "Nội dung bài giảng chi tiết."
            }))
        }];
    }
    return [];
  }, [rawLessons, searchTerm, pinnedLessonIds]);

  const totalLessons = rawLessons.length;
  const displayLessonsCount = processedSyllabus.reduce((acc, curr) => acc + curr.lessons.length, 0);

  const handleStartLesson = (lessonId: string | number) => {
    navigate(`/teacher/lessons/${lessonId}`);
  };

  const renderIcon = (type: string) => {
      if (type === 'video') return <VideoCameraIcon className="w-5 h-5"/>;
      return <DocumentTextIcon className="w-5 h-5"/>;
  };

  // --- RENDER ---
  if (isLoading && !course && rawLessons.length === 0) return (
    <div className="min-h-screen bg-[#0f0518] flex items-center justify-center text-white relative overflow-hidden">
       <div className="z-10 flex flex-col items-center gap-6">
          <div className="relative">
              <div className="w-20 h-20 border-4 border-[#ffe400]/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-20 h-20 border-4 border-[#ffe400] border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#ffe400] animate-pulse">
                  <LightningBoltIcon className="w-8 h-8" />
              </div>
          </div>
          <p className="text-sm font-bold tracking-[0.2em] text-[#ffe400] uppercase animate-pulse">Đang tải dữ liệu...</p>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f0518] text-slate-200 font-sans selection:bg-[#ffe400] selection:text-black pb-32 relative overflow-hidden">
      
      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[length:4rem_4rem] [mask-image:radial-gradient(circle_at_center,black,transparent_80%)]"></div>
      <div className={`fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-[#9c00e5] blur-[150px] rounded-full pointer-events-none mix-blend-screen transition-all duration-[4000ms] ease-in-out ${showPurpleGlow ? 'opacity-40 scale-110' : 'opacity-10 scale-90'}`}></div>
      <div className={`fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#ffe400] blur-[150px] rounded-full pointer-events-none mix-blend-screen transition-all duration-[4000ms] ease-in-out ${!showPurpleGlow ? 'opacity-30 scale-110' : 'opacity-10 scale-90'}`}></div>

      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0f0518]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl transition-all duration-300">
        <div className="container px-4 py-3 mx-auto lg:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <button 
                      onClick={() => navigate('/teacher/courses')} 
                      className="p-2.5 transition-all border text-white/70 bg-white/5 hover:bg-[#ffe400] hover:text-black rounded-xl group border-white/5 shadow-lg"
                      aria-label="Quay lại danh sách khóa học"
                      title="Quay lại danh sách khóa học"
                    >
                        <ArrowLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1"/>
                    </button>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-white md:text-2xl line-clamp-1 drop-shadow-md">{course?.name || "Đang tải tên..."}</h1>
                        <div className="flex items-center gap-3 mt-1 text-xs font-bold tracking-wider text-gray-400 uppercase">
                            <span className="text-[#ffe400] flex items-center gap-1 bg-[#ffe400]/10 px-2 py-0.5 rounded border border-[#ffe400]/20 shadow-[0_0_10px_rgba(255,228,0,0.1)]">
                                <LightningBoltIcon className="w-3 h-3"/> {totalLessons} bài học
                            </span>
                            {course?.code && <span className="hidden font-mono text-gray-500 sm:inline bg-white/5 px-2 py-0.5 rounded ml-2">{course.code}</span>}
                        </div>
                    </div>
                </div>
                <div className="flex items-center self-end w-full gap-3 md:self-auto md:w-auto">
                    <div className="relative w-full group md:w-auto">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><SearchIcon className="w-4 h-4 text-gray-500 group-focus-within:text-[#ffe400] transition-colors" /></div>
                        <input type="text" placeholder="Tìm kiếm bài học..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-[#1a0b2e]/50 border border-white/10 text-sm rounded-xl py-2.5 pl-10 pr-4 w-full md:w-64 focus:outline-none focus:border-[#ffe400]/50 focus:bg-[#201330] focus:ring-1 focus:ring-[#ffe400]/50 transition-all placeholder-gray-600 text-white shadow-inner backdrop-blur-sm" />
                    </div>
                    <div className="w-[1px] h-8 bg-white/10 mx-1 hidden md:block"></div>
                    <div className="flex bg-[#1a0b2e]/50 p-1 rounded-xl border border-white/10 shadow-inner backdrop-blur-sm shrink-0">
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#ffe400] text-black shadow-[0_0_15px_rgba(255,228,0,0.4)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`} aria-label="Xem dạng danh sách" title="Xem dạng danh sách"><ViewListIcon className="w-5 h-5"/></button>
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#ffe400] text-black shadow-[0_0_15px_rgba(255,228,0,0.4)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`} aria-label="Xem dạng lưới" title="Xem dạng lưới"><ViewGridIcon className="w-5 h-5"/></button>
                        <button onClick={() => setViewMode('timeline')} className={`p-2 rounded-lg transition-all ${viewMode === 'timeline' ? 'bg-[#ffe400] text-black shadow-[0_0_15px_rgba(255,228,0,0.4)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`} aria-label="Xem dạng dòng thời gian" title="Xem dạng dòng thời gian"><CollectionIcon className="w-5 h-5"/></button>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Body */}
      <main className="container relative z-10 px-4 pt-8 mx-auto lg:px-8 max-w-7xl">
        {errorMsg ? (
             <div className="flex flex-col items-center justify-center py-32 text-center border border-red-500/20 rounded-[3rem] bg-red-500/5 backdrop-blur-sm">
                <div className="p-6 bg-[#1a0b2e] rounded-full mb-6 border border-red-500/30"><LockClosedIcon className="w-16 h-16 text-red-500" /></div>
                <h3 className="mb-2 text-3xl font-black text-white">Quyền truy cập bị từ chối</h3>
                <p className="max-w-lg mx-auto mb-8 text-red-200/70">{errorMsg}</p>
                <button onClick={() => navigate('/teacher/courses')} className="px-8 py-3 font-bold text-black bg-[#ffe400] rounded-xl hover:bg-white transition-all">Quay lại danh sách</button>
            </div>
        ) : rawLessons.length === 0 && !isLoading ? (
             <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-white/10 rounded-[3rem] bg-white/5 backdrop-blur-sm">
                <div className="p-6 bg-[#1a0b2e] rounded-full mb-6 border border-white/5 shadow-2xl"><EmojiSadIcon className="w-16 h-16 text-gray-600" /></div>
                <h3 className="mb-2 text-2xl font-bold text-white">Chưa có bài học nào</h3>
                <p className="text-gray-500">Hiện tại chưa có bài học nào được xuất bản.</p>
            </div>
        ) : displayLessonsCount === 0 ? (
             <div className="py-20 text-center">
                 <p className="text-gray-500">Không tìm thấy bài học nào phù hợp với từ khóa "{searchTerm}".</p>
             </div>
        ) : (
            <div className="space-y-12">
                {processedSyllabus.map((section: any, sectionIdx: number) => (
                    <div key={sectionIdx}>
                        {/* Section Title */}
                        <div className="flex items-center gap-4 pl-2 mb-8">
                             <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ffe400] to-orange-500 flex items-center justify-center text-black font-black text-xl shadow-[0_0_20px_rgba(255,165,0,0.3)]">{sectionIdx + 1}</div>
                             <div>
                               <div className="flex items-center gap-2 mb-1"><SparklesIcon className="w-4 h-4 text-[#ffe400]" /><span className="text-xs font-bold tracking-widest text-[#ffe400] uppercase">Chương trình học</span></div>
                               <h2 className="text-3xl font-black tracking-tight text-white">{section.title}</h2>
                             </div>
                        </div>

                        {/* --- LIST VIEW --- */}
                        {viewMode === 'list' && (
                            <div className="bg-[#1a0b2e]/40 backdrop-blur-md border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl p-2 md:p-4">
                                <div className="divide-y divide-white/5">
                                    <AnimatePresence mode="popLayout">
                                        {section.lessons.map((lesson: any) => {
                                            const isPinned = pinnedLessonIds.includes(lesson.id);
                                            return (
                                                <motion.div 
                                                    layout 
                                                    key={lesson.id} 
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    transition={{ duration: 0.2 }}
                                                    onClick={() => handleStartLesson(lesson.id)} 
                                                    className={`relative flex items-center gap-5 p-4 rounded-xl transition-all cursor-pointer group hover:bg-white/[0.05] mb-1 ${isPinned ? 'bg-[#ffe400]/[0.05]' : ''}`}
                                                >
                                                    {isPinned && <div className="absolute top-2 right-2"><HashtagIcon className="w-3 h-3 text-[#ffe400]"/></div>}
                                                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#ffe400] rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                    
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 shadow-inner ${lesson.isCompleted ? 'bg-green-500/10 text-green-500 border-green-500/30' : isPinned ? 'bg-[#ffe400]/10 text-[#ffe400] border-[#ffe400]/30' : 'bg-[#150a22] text-gray-400 group-hover:text-black group-hover:bg-[#ffe400] group-hover:border-[#ffe400]'} transition-all duration-300 group-hover:scale-105`}>
                                                        {lesson.isCompleted ? <CheckCircleIcon className="w-7 h-7"/> : renderIcon(lesson.type)}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h4 className="text-lg font-bold text-white truncate pr-2 group-hover:text-[#ffe400] transition-colors">{lesson.title}</h4>
                                                            
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); togglePin(lesson.id); }} 
                                                                className={`p-1.5 rounded-lg transition-all shrink-0 border 
                                                                    ${isPinned 
                                                                        ? 'bg-[#ffe400] text-black border-[#ffe400] shadow-md shadow-yellow-500/30 scale-110' 
                                                                        : 'bg-white/5 border-white/10 text-gray-500 hover:text-white hover:bg-white/20 hover:border-white/30'
                                                                    }`}
                                                                title={isPinned ? "Bỏ ghim" : "Ghim bài học"}
                                                                aria-label={isPinned ? "Bỏ ghim" : "Ghim bài học"}
                                                            >
                                                                <HashtagIcon className="w-4 h-4"/>
                                                            </button>

                                                        </div>
                                                        <div className="flex flex-wrap items-center text-sm text-gray-400 gap-x-4">
                                                            <span className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded text-xs"><ClockIcon className="w-3 h-3 text-[#ffe400]"/> {lesson.duration}</span>
                                                            <span className="truncate max-w-[200px] md:max-w-lg text-gray-500 group-hover:text-gray-300 transition-colors text-xs">{lesson.description}</span>
                                                        </div>
                                                    </div>

                                                    <div className="hidden transition-all duration-300 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 sm:flex">
                                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#ffe400] group-hover:bg-[#ffe400] group-hover:text-black shadow-lg"><PlayIcon className="w-5 h-5 ml-0.5"/></div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}

                        {/* --- GRID VIEW --- */}
                        {viewMode === 'grid' && (
                            <motion.div layout className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <AnimatePresence mode="popLayout">
                                    {section.lessons.map((lesson: any) => {
                                        const isPinned = pinnedLessonIds.includes(lesson.id);
                                        return (
                                            <motion.div 
                                                layout
                                                key={lesson.id} 
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                transition={{ duration: 0.2 }}
                                                onClick={() => handleStartLesson(lesson.id)} 
                                                className={`group relative bg-[#1a0b2e]/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 hover:border-[#ffe400]/50 transition-all cursor-pointer flex flex-col shadow-lg overflow-hidden ${isPinned ? 'ring-2 ring-[#ffe400] shadow-[0_0_20px_rgba(255,228,0,0.15)]' : ''}`}
                                            >
                                                <div className="relative flex items-start justify-between mb-5">
                                                    <div className={`p-3 rounded-xl ${lesson.isCompleted ? 'bg-green-500/10 text-green-500' : isPinned ? 'bg-[#ffe400]/20 text-[#ffe400]' : 'bg-[#2a1b3d] text-purple-300 group-hover:bg-[#ffe400] group-hover:text-black shadow-inner'} transition-all duration-300`}>{renderIcon(lesson.type)}</div>
                                                    
                                                    {/* FIX CSS CONFLICT HERE */}
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); togglePin(lesson.id); }} 
                                                        className={`p-2 rounded-full transition-all border 
                                                            ${isPinned 
                                                                ? 'bg-[#ffe400] text-black border-[#ffe400] shadow-lg shadow-yellow-500/40 scale-110' 
                                                                : 'bg-black/30 border-white/10 text-gray-500 hover:bg-white hover:border-white hover:text-black'
                                                            }`}
                                                        aria-label={isPinned ? "Bỏ ghim" : "Ghim bài học"}
                                                        title={isPinned ? "Bỏ ghim" : "Ghim bài học"}
                                                    >
                                                        <HashtagIcon className="w-4 h-4"/>
                                                    </button>
                                                </div>
                                                <h4 className="relative text-lg font-bold text-white mb-2 line-clamp-2 leading-snug group-hover:text-[#ffe400] transition-colors">{lesson.title}</h4>
                                                <p className="relative flex-1 mb-6 text-sm leading-relaxed text-gray-400 line-clamp-2">{lesson.description}</p>
                                                <div className="relative flex items-center justify-between pt-4 mt-auto border-t border-white/10">
                                                    <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg"><ClockIcon className="w-3.5 h-3.5 text-[#ffe400]"/> {lesson.duration}</span>
                                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-[#ffe400] group-hover:text-black transition-all"><ChevronRightIcon className="w-4 h-4"/></div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </motion.div>
                        )}

                        {/* --- TIMELINE VIEW --- */}
                        {viewMode === 'timeline' && (
                            <div className="relative pb-8 pl-8 ml-4 space-y-8 border-l-2 border-white/10">
                                <AnimatePresence mode="popLayout">
                                    {section.lessons.map((lesson: any, idx: number) => {
                                        const isPinned = pinnedLessonIds.includes(lesson.id);
                                        return (
                                            <motion.div 
                                                layout
                                                key={lesson.id} 
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.2 }}
                                                className="relative pl-8 group"
                                            >
                                                <div className={`absolute -left-[43px] top-8 w-4 h-4 rounded-full border-4 border-[#0f0518] group-hover:scale-125 transition-all duration-300 z-10 box-content ${isPinned ? 'bg-[#ffe400]' : 'bg-[#2a1b3d] group-hover:bg-[#ffe400]'}`}></div>
                                                <div onClick={() => handleStartLesson(lesson.id)} className={`bg-[#1a0b2e]/60 backdrop-blur-md border border-white/10 rounded-[1.5rem] p-2 pr-6 hover:border-[#ffe400]/40 transition-all cursor-pointer shadow-lg relative overflow-hidden flex items-center gap-6 ${isPinned ? 'border-[#ffe400]/50 bg-[#ffe400]/5' : ''}`}>
                                                    <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center shrink-0 border border-white/5 transition-all duration-300 ${isPinned ? 'bg-[#ffe400]/10 text-[#ffe400]' : 'bg-[#ffffff]/5 text-gray-500 group-hover:text-[#ffe400] group-hover:bg-[#ffe400]/10'}`}>
                                                        <span className="mb-0.5 text-[10px] font-bold tracking-widest uppercase opacity-70">Bài</span>
                                                        <span className="text-2xl font-black">{idx + 1}</span>
                                                    </div>
                                                    <div className="flex-1 py-3">
                                                        <div className="flex items-start justify-between">
                                                             <h4 className="mb-2 text-xl font-bold text-white group-hover:text-[#ffe400] transition-colors">{lesson.title}</h4>
                                                             <button 
                                                                onClick={(e) => { e.stopPropagation(); togglePin(lesson.id); }} 
                                                                className={`p-1.5 rounded-full transition-all border
                                                                    ${isPinned 
                                                                        ? 'bg-[#ffe400] text-black border-[#ffe400] shadow-md scale-110' 
                                                                        : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white hover:text-black hover:border-white'
                                                                    }`}
                                                                aria-label={isPinned ? "Bỏ ghim" : "Ghim bài học"}
                                                                title={isPinned ? "Bỏ ghim" : "Ghim bài học"}
                                                             >
                                                                <HashtagIcon className="w-4 h-4"/>
                                                             </button>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-xs text-gray-400">
                                                            <span className="flex items-center gap-1.5"><ClockIcon className="w-3.5 h-3.5 text-[#ffe400]"/> {lesson.duration}</span>
                                                            <span className="hidden sm:flex items-center gap-1.5"><DocumentTextIcon className="w-3.5 h-3.5 text-[#ffe400]"/> Lý thuyết & Thực hành</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )}
      </main>
    </div>
  );
};

export default LessonPage;