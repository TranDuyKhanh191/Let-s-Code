import React, { useState, useEffect, useRef, useCallback, useMemo, useLayoutEffect } from "react";
import { ChallengeSandbox } from "../../components/ChallengeSandbox";
import {
  ArrowLeftIcon, PlayIcon, CheckCircleIcon,
  HomeIcon, PhotographIcon,
  QuestionMarkCircleIcon, BeakerIcon, LightningBoltIcon,
  ChevronLeftIcon, ChevronRightIcon, ArrowsExpandIcon, XIcon, DocumentTextIcon, ExternalLinkIcon,
  CubeIcon, ZoomInIcon, ZoomOutIcon, InformationCircleIcon, DesktopComputerIcon, CheckIcon, XCircleIcon,
  AcademicCapIcon, LightBulbIcon, HandIcon, HeartIcon, RefreshIcon, ChevronDownIcon,
  MapIcon, ArrowUpIcon, CollectionIcon, ViewListIcon, EyeIcon, EyeOffIcon
} from "@heroicons/react/solid";
import { useParams, useNavigate } from "react-router-dom";
import { Document, Page, pdfjs } from 'react-pdf';

// Cấu hình Worker cho PDF
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// --- INTERFACES ---
interface Media { id?: number; media_id?: number; url?: string; mime_type?: string; purpose?: string; media?: { id: number; url: string; mime_type: string; }; }
interface Objective { id?: number; lesson_id?: number | string; lessonId?: number | string; knowledge?: string; thinking?: string; skills?: string; attitude?: string; }
interface Preparation { notes?: string; teacher_notes?: string; equipment_list?: string; }
interface BuildStep { url?: string; image_url?: string; build_type?: string; sort_order?: number; }
interface QuizOption { option_text: string; is_correct: boolean; }
interface QuizAnswer { answer_text: string; is_correct: boolean; explanation?: string; }
interface Quiz { question_text: string; options?: QuizOption[]; answers?: QuizAnswer[]; }

// [UPDATED] Interface Challenge khớp với Backend
interface Challenge {
  id: number;
  title: string;
  subtitle?: string | null; // Thêm subtitle
  description: string;
  instructions?: string | null; // Thêm instructions (hướng dẫn chi tiết)
  media?: { id: number; media: { url: string; mime_type: string } }[];
}

interface LessonInfo { id?: number | string; title: string; description: string; thumbnail?: string; content?: string; objectives?: any; }

// Interface cho nội dung bài học
interface LessonContent {
  id: number;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  usage_text?: string | null;
  example_text?: string | null;
  sort_order?: number;
  media?: any[];
}

// --- CONSTANTS ---
const MEDIA_PURPOSE = { COVER: "cover", INTRO: "intro", MAIN: "main", GALLERY: "gallery", ATTACHMENT: "attachment", OTHER: "other" };
const BRAND_COLORS: Record<string, any> = {
  purple: { main: "#9c00e5", light: "#e5caf2" },
  blue: { main: "#443fff", light: "#3fd9ff" },
  green: { main: "#4fc5a5", light: "#46fb93" },
  orange: { main: "#ff862d", light: "#ffbd3f" },
  yellow: { main: "#ffe400", light: "#fdf9db" },
  pink: { main: "#ff7c7c", light: "#fcc7c7" },
};
const ITEM_COLORS = [
  { border: "border-blue-500", shadow: "shadow-blue-500/20", text: "text-blue-400", bg: "bg-blue-900/20" },
  { border: "border-red-500", shadow: "shadow-red-500/20", text: "text-red-400", bg: "bg-red-900/20" },
  { border: "border-green-500", shadow: "shadow-green-500/20", text: "text-green-400", bg: "bg-green-900/20" },
  { border: "border-yellow-400", shadow: "shadow-yellow-400/20", text: "text-yellow-400", bg: "bg-yellow-900/20" },
  { border: "border-purple-500", shadow: "shadow-purple-500/20", text: "text-purple-400", bg: "bg-purple-900/20" },
  { border: "border-orange-500", shadow: "shadow-orange-500/20", text: "text-orange-400", bg: "bg-orange-900/20" },
];
const API_BASE = "http://localhost:3000/api";

// --- UTILS ---
const smartFixUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  let fixedUrl = url;
  if (fixedUrl.includes('/public/media/')) fixedUrl = fixedUrl.replace('/public/media/', '/public/lesson-content/');
  if (fixedUrl.includes('/lesson_contents/')) fixedUrl = fixedUrl.replace('/lesson_contents/', '/lesson-content/');
  if (fixedUrl.includes('/lesson_content/')) fixedUrl = fixedUrl.replace('/lesson_content/', '/lesson-content/');
  return fixedUrl;
};

const parseList = (text?: string) => {
  if (!text) return ["Nội dung đang cập nhật..."];
  return text.split(/(?:\r\n|\r|\n|•|- )/g).filter(line => line.trim().length > 0);
};

// --- SUB-COMPONENTS ---
const ObjectiveCard = React.memo(({ title, icon, content, colorTheme }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const themes: any = {
    cyan: { base: "border-cyan-500/30 text-cyan-400 shadow-cyan-500/10", active: "border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.25)] bg-[#06b6d4]/10", gradient: "from-cyan-500" },
    slate: { base: "border-slate-500/30 text-slate-300 shadow-slate-500/10", active: "border-slate-400 shadow-[0_0_25px_rgba(148,163,184,0.2)] bg-[#64748b]/10", gradient: "from-slate-500" },
    yellow: { base: "border-yellow-500/30 text-yellow-400 shadow-yellow-500/10", active: "border-yellow-400 shadow-[0_0_25px_rgba(234,179,8,0.25)] bg-[#eab308]/10", gradient: "from-yellow-500" },
    orange: { base: "border-orange-500/30 text-orange-400 shadow-orange-500/10", active: "border-orange-400 shadow-[0_0_25px_rgba(249,115,22,0.25)] bg-[#f97316]/10", gradient: "from-orange-500" }
  };
  const theme = themes[colorTheme] || themes.slate;
  const currentStyle = isOpen ? theme.active : theme.base;
  const contentList = useMemo(() => parseList(content), [content]);

  return (
    <div className={`group relative mb-4 last:mb-0 transition-transform duration-500 ease-out transform-gpu ${isOpen ? 'translate-x-2' : 'hover:-translate-y-1'}`}>
      <div className={`absolute -inset-[1px] bg-gradient-to-r from-transparent via-${theme.gradient.split('-')[1]}-500/40 to-transparent rounded-2xl blur-md transition-opacity duration-700 ${isOpen ? 'opacity-70' : 'opacity-0 group-hover:opacity-40'}`}></div>
      <div className={`relative overflow-hidden rounded-2xl backdrop-blur-xl border transition-all duration-500 bg-[#0f0518]/80 ${currentStyle}`}>
        <div onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between px-6 py-5 cursor-pointer select-none">
          <div className="flex items-center gap-5">
            <div className={`p-3 rounded-xl bg-white/5 border border-white/10 transition-all duration-500 ${isOpen ? 'bg-white/10 scale-110 shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'group-hover:bg-white/10 group-hover:scale-105'}`}>
              <div className={`transition-transform duration-500 ${isOpen ? 'rotate-12 scale-110' : ''}`}>{icon}</div>
            </div>
            <div className="flex flex-col">
              <h3 className={`text-lg font-black tracking-[0.15em] uppercase transition-colors duration-300 ${isOpen ? 'text-white text-shadow-glow' : 'text-gray-200 group-hover:text-white'}`}>{title}</h3>
              <div className="w-24 h-[2px] bg-white/10 mt-2 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${theme.gradient} to-white transition-all duration-700 ease-out ${isOpen ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-1/2 group-hover:opacity-50'}`}></div>
              </div>
            </div>
          </div>
          <div className={`w-9 h-9 flex items-center justify-center rounded-full border border-white/5 transition-all duration-500 ${isOpen ? 'bg-white/20 rotate-180 border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'bg-white/5 group-hover:bg-white/10'}`}>
            <ChevronDownIcon className="w-5 h-5 text-white/80" />
          </div>
        </div>
        <div className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
          <div className="overflow-hidden">
            <div className="relative px-6 py-6 border-t border-white/5 bg-black/20">
              <div className="absolute inset-0 opacity-[0.07] pointer-events-none bg-[image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] bg-[length:30px_30px]"></div>
              <ul className="relative z-10 space-y-4">
                {contentList.map((line, idx) => (
                  <li key={idx} className={`flex items-start gap-4 transition-all duration-700 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ transitionDelay: `${idx * 100}ms` }}>
                    <div className={`mt-2 w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor] animate-pulse ${theme.base.split(' ')[1]}`}></div>
                    <span className="flex-1 text-gray-300 font-light leading-relaxed tracking-wide text-[17px] hover:text-white transition-colors">{line.trim()}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const ObjectivesSection = React.memo(({ objectives, sectionRef }: { objectives: Objective | null, sectionRef: any }) => {
  return (
    <section id="objectives" ref={sectionRef} className="animate-fade-in-up transform-gpu">
      <div className="relative">
        <div className="flex items-center justify-between pl-2 mb-10">
          <div className="relative pl-6 border-l-[6px] border-[#ffe400] rounded-l-sm">
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-wider drop-shadow-[0_0_15px_rgba(255,228,0,0.4)]">Mục tiêu <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe400] to-[#ffbd3f]">bài học</span></h2>
            <div className="flex items-center gap-2 mt-3 opacity-60">
              <div className="h-[1px] w-12 bg-[#ffe400]"></div>
              <p className="text-[10px] font-bold text-[#ffe400] uppercase tracking-[0.4em]">System Objectives Initialized</p>
            </div>
          </div>
          <div className="hidden md:block opacity-30 animate-blob mix-blend-overlay"><CubeIcon className="w-24 h-24 text-[#ffe400]" /></div>
        </div>
        <div className="grid gap-4">
          <ObjectiveCard title="Kiến thức" icon={<AcademicCapIcon className="w-6 h-6" />} content={objectives?.knowledge} colorTheme="cyan" />
          <ObjectiveCard title="Kỹ năng" icon={<HandIcon className="w-6 h-6" />} content={objectives?.skills} colorTheme="slate" />
          <ObjectiveCard title="Tư duy" icon={<LightBulbIcon className="w-6 h-6" />} content={objectives?.thinking} colorTheme="yellow" />
          <ObjectiveCard title="Thái độ" icon={<HeartIcon className="w-6 h-6" />} content={objectives?.attitude} colorTheme="orange" />
        </div>
      </div>
    </section>
  );
});

const OverviewSection = React.memo(({ sectionRef }: { sectionRef: any }) => {
  const timelineItems = useMemo(() => [
    { title: "Giới thiệu & Bối cảnh", color: "bg-[#4cc9f0]", icon: <PlayIcon className="w-5 h-5" />, desc: "Tìm hiểu chủ đề và vấn đề cần giải quyết." },
    { title: "Chuẩn bị & Kiểm tra", color: "bg-[#f72585]", icon: <BeakerIcon className="w-5 h-5" />, desc: "Kiểm tra dụng cụ và bộ LEGO Spike." },
    { title: "Lắp ráp Robot", color: "bg-[#4361ee]", icon: <PhotographIcon className="w-5 h-5" />, desc: "Thực hành lắp ráp mô hình theo hướng dẫn." },
    { title: "Lập trình & Vận hành", color: "bg-[#7209b7]", icon: <DesktopComputerIcon className="w-5 h-5" />, desc: "Viết code điều khiển robot hoạt động." },
    { title: "Thử thách Sáng tạo", color: "bg-[#f8961e]", icon: <LightningBoltIcon className="w-5 h-5" />, desc: "Nâng cấp robot để giải quyết thử thách." },
    { title: "Tổng kết & Đánh giá", color: "bg-[#f9c74f]", icon: <QuestionMarkCircleIcon className="w-5 h-5" />, desc: "Ôn tập kiến thức qua bài trắc nghiệm." },
  ], []);

  return (
    <section id="overview" ref={sectionRef} className="delay-100 animate-fade-in-up transform-gpu">
      <div className="relative p-8 rounded-3xl border border-white/10 bg-[#1a0b2e]/60 backdrop-blur-xl shadow-2xl">
        <div className="mb-12 text-center">
          <span className="px-4 py-1 rounded-full border border-[#ffe400] text-[#ffe400] text-xs font-bold uppercase tracking-[0.2em] bg-[#ffe400]/10">Lộ trình học tập</span>
          <h2 className="flex items-center justify-center gap-3 mt-4 text-3xl font-black text-white uppercase"><MapIcon className="w-8 h-8 text-[#ffe400]" /> Tổng quan bài học</h2>
        </div>
        <div className="absolute left-8 md:left-1/2 top-32 bottom-10 w-1 bg-gradient-to-b from-[#ffe400] via-purple-500 to-blue-500 md:-translate-x-1/2 rounded-full opacity-30"></div>
        <div className="relative space-y-8">
          {timelineItems.map((item, index) => (
            <div key={index} className={`flex items-center md:justify-between w-full group ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
              <div className="hidden w-5/12 md:block"></div>
              <div className="absolute left-8 md:left-1/2 w-10 h-10 rounded-full border-4 border-[#0f0518] bg-[#1a0b2e] z-10 md:-translate-x-1/2 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform duration-300 transform -translate-x-1/2">
                <div className={`w-3 h-3 rounded-full ${item.color} shadow-[0_0_10px_currentColor]`}></div>
              </div>
              <div className="w-full pl-16 md:pl-0 md:w-5/12">
                <div className={`relative p-[1px] rounded-2xl bg-gradient-to-r from-white/10 to-transparent hover:from-${item.color.replace('bg-', '')} transition-all duration-300 group-hover:-translate-y-1 transform-gpu`}>
                  <div className="bg-[#150a22] p-4 rounded-2xl border border-white/5 relative overflow-hidden">
                    <div className={`absolute top-0 right-0 w-16 h-16 ${item.color} opacity-10 blur-xl rounded-full -mr-8 -mt-8`}></div>
                    <div className="relative z-10 flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${item.color} text-white shadow-lg`}>{item.icon}</div>
                      <div>
                        <h3 className="mb-1 text-lg font-bold leading-tight text-white">{item.title}</h3>
                        <p className="text-xs font-medium text-gray-400">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

const IntroSection = React.memo(({ lessonInfo, videoUrl, sectionRef }: { lessonInfo: LessonInfo | null, videoUrl: string | undefined, sectionRef: any }) => (
  <section id="intro" ref={sectionRef} className="delay-100 animate-fade-in-up transform-gpu">
    <div className="relative group">
      <div className={`absolute -inset-1 bg-gradient-to-r from-[#ffe400] to-[#9c00e5] rounded-[2rem] blur opacity-30 group-hover:opacity-50 transition duration-1000 will-change-opacity`}></div>
      <div className="relative bg-[#1a0b2e]/60 backdrop-blur-xl border border-[#ffe400]/30 rounded-[1.8rem] overflow-hidden shadow-[0_0_30px_rgba(255,228,0,0.1)]">
        {videoUrl ? (
          <div className="relative bg-black aspect-video">
            <video src={videoUrl} controls className="object-contain w-full h-full" poster={lessonInfo?.thumbnail}>Trình duyệt không hỗ trợ thẻ video.</video>
          </div>
        ) : (
          <div className="aspect-video flex flex-col items-center justify-center bg-[#150a22]/50 text-white/30"><PlayIcon className="w-20 h-20 opacity-20" /><p className="mt-4 font-medium tracking-widest uppercase">Chưa có video bài giảng</p></div>
        )}
        <div className="p-8 bg-gradient-to-b from-[#1a0b2e]/80 to-[#150a22]/90">
          <h2 className="mb-4 text-3xl font-black leading-tight text-white lg:text-4xl">{lessonInfo?.title}</h2>
          <p className="text-lg text-gray-300 leading-relaxed font-light border-l-4 border-[#ffe400] pl-4">{lessonInfo?.description}</p>
        </div>
      </div>
    </div>
  </section>
));

const PreparationSection = React.memo(({ preparation, preparationMedia, sectionRef }: { preparation: Preparation, preparationMedia: Media[], sectionRef: any }) => (
  <section id="preparation" ref={sectionRef} className="delay-300 animate-fade-in-up transform-gpu">
    <div className="relative overflow-hidden bg-[#1a0b2e]/60 backdrop-blur-md border border-[#ffe400]/30 rounded-3xl p-8 shadow-[0_0_20px_rgba(255,228,0,0.05)]">
      <div className="flex items-center gap-4 pb-4 mb-8 border-b border-white/10"><div className="p-3 rounded-2xl bg-gradient-to-br from-[#ff862d] to-[#ffbd3f] shadow-lg shadow-orange-500/20"><BeakerIcon className="w-6 h-6 text-white" /></div><h2 className="text-2xl font-black tracking-wide text-white uppercase">Chuẩn bị & Dụng cụ</h2></div>
      <div className="relative z-10 space-y-8">
        <div className="p-6 border bg-white/5 rounded-2xl border-white/5 backdrop-blur-sm hover:border-[#ffe400]/30 transition-colors">
          <h3 className="text-[#ffbd3f] font-bold uppercase text-xs tracking-widest mb-3">Ghi chú giáo viên</h3>
          <p className="text-lg leading-relaxed text-gray-200 whitespace-pre-line">{preparation.notes || preparation.teacher_notes}</p>
        </div>
        <div>
          <h3 className="text-[#ffbd3f] font-bold uppercase text-xs tracking-widest mb-4">Kho vật liệu cần thiết</h3>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
            {preparationMedia.map((m) => (
              <div key={m.id || m.media_id} className="w-full h-48 cursor-pointer group perspective-1000">
                <div className="flip-card-inner">
                  <div className="flip-card-front bg-[#1f1130] border border-white/10 p-2 shadow-lg rounded-2xl">
                    <div className="relative w-full h-full overflow-hidden rounded-xl"><img loading="lazy" src={smartFixUrl(m.url || m.media?.url)} alt="tool" className="object-cover w-full h-full" /><div className="absolute bottom-0 left-0 right-0 p-2 text-center bg-black/60 backdrop-blur-sm"><span className="text-[10px] font-bold text-[#ffe400] uppercase tracking-wider">Hình ảnh mẫu</span></div></div>
                  </div>
                  <div className="flip-card-back bg-[#1a0b2e] border-2 border-[#ffe400] p-4 text-center shadow-[0_0_20px_#ffe400] flex flex-col items-center justify-center rounded-2xl"><CubeIcon className="w-8 h-8 text-[#ffe400] mb-2 animate-bounce" /><h4 className="text-sm font-bold text-white">Chi tiết vật liệu</h4></div>
                </div>
              </div>
            ))}
            {preparation.equipment_list && preparation.equipment_list.split(',').map((item, idx) => {
              const color = ITEM_COLORS[idx % ITEM_COLORS.length];
              return (
                <div key={idx} className="w-full h-48 cursor-pointer group perspective-1000">
                  <div className="flip-card-inner">
                    <div className={`flip-card-front bg-[#1f1130] border border-white/10 p-4 flex flex-col items-center justify-center shadow-lg rounded-2xl ${color.shadow} hover:border-white/30`}>
                      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-full ${color.border.replace('border', 'bg')}`}></div>
                      <div className={`mb-3 p-3 rounded-full ${color.bg}`}><CubeIcon className={`w-8 h-8 ${color.text}`} /></div>
                      <span className="text-sm font-bold text-center text-gray-200 line-clamp-2">{item.trim()}</span>
                      <div className="absolute bottom-3 text-[10px] text-gray-500 uppercase tracking-widest">Lật xem thông tin</div>
                    </div>
                    <div className={`flip-card-back bg-[#150a22] border-2 ${color.border} p-4 flex flex-col items-center justify-center text-center shadow-2xl rounded-2xl`}><InformationCircleIcon className={`w-8 h-8 ${color.text} mb-2`} /><h4 className={`text-xs font-bold uppercase tracking-widest ${color.text} mb-2`}>Thông số</h4><p className="text-xs font-medium text-white line-clamp-3">{item.trim()}</p></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  </section>
));

const BuildSection = React.memo(({ buildUrl, buildSteps, isFullscreen, setIsFullscreen, sectionRef }: any) => {
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pdfScale, setPdfScale] = useState(0.7);
  const [currentStep, setCurrentStep] = useState(0);
  const [pdfWidth, setPdfWidth] = useState(800);
  const pdfWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setPageNumber(1); }, [buildUrl]);

  useLayoutEffect(() => {
    const updateWidth = () => { if (pdfWrapperRef.current) setPdfWidth(pdfWrapperRef.current.offsetWidth); };
    const observer = new ResizeObserver(updateWidth);
    if (pdfWrapperRef.current) observer.observe(pdfWrapperRef.current);
    return () => observer.disconnect();
  }, [isFullscreen]);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => setNumPages(numPages), []);
  const changePage = (offset: number) => setPageNumber(prev => Math.min(Math.max(1, prev + offset), numPages || 1));
  const changeScale = (delta: number) => setPdfScale(prev => Math.min(Math.max(0.5, prev + delta), 3.0));
  const nextStep = () => { if (currentStep < buildSteps.length - 1) setCurrentStep(prev => prev + 1); };
  const prevStep = () => { if (currentStep > 0) setCurrentStep(prev => prev - 1); };

  return (
    <section id="build" ref={sectionRef}>
      {!isFullscreen && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4"><div className="p-3 rounded-2xl bg-gradient-to-br from-[#4fc5a5] to-[#46fb93] shadow-lg shadow-green-500/20"><PhotographIcon className="w-6 h-6 text-white" /></div><h2 className="text-2xl font-black tracking-wide text-white uppercase">Hướng dẫn xây dựng</h2></div>
          {!buildUrl && buildSteps.length > 0 && (<div className="px-4 py-1.5 rounded-full bg-[#1a0b2e] border border-[#ffe400] text-[#ffe400] font-bold text-sm shadow-[0_0_10px_rgba(255,228,0,0.2)]">{currentStep + 1} / {buildSteps.length}</div>)}
        </div>
      )}
      <div className="relative w-full max-w-4xl mx-auto h-[65vh] min-h-[500px] bg-white/5 rounded-3xl border border-white/5 transition-all">
        {buildUrl ? (
          <div ref={pdfWrapperRef} className={`flex flex-col bg-[#2d2d2d] overflow-hidden border border-[#ffe400]/50 shadow-2xl transition-all duration-300 z-50 ${isFullscreen ? 'fixed inset-0 w-screen h-screen rounded-none' : 'absolute inset-0 w-full h-full rounded-3xl'}`}>
            <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#1a0b2e] border-b border-[#ffe400]/20 shadow-md shrink-0">
              <div className="flex items-center gap-4 text-xs font-bold text-[#ffe400] uppercase"><DocumentTextIcon className="w-4 h-4" /><span>Trang {pageNumber} / {numPages || '--'}</span></div>
              <div className="flex gap-1">
                <button onClick={() => changeScale(-0.1)} aria-label="Thu nhỏ PDF" title="Thu nhỏ" className="p-1 text-white rounded hover:bg-white/10"><ZoomOutIcon className="w-4 h-4" /></button>
                <span className="self-center min-w-[3ch] text-center text-xs text-gray-400">{Math.round(pdfScale * 100)}%</span>
                <button onClick={() => changeScale(0.1)} aria-label="Phóng to PDF" title="Phóng to" className="p-1 text-white rounded hover:bg-white/10"><ZoomInIcon className="w-4 h-4" /></button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsFullscreen(!isFullscreen)} aria-label={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"} title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"} className={`p-1.5 text-xs font-bold hover:text-white bg-white/5 rounded border border-white/5 hover:border-white/20 transition-all ${isFullscreen ? 'text-[#ffe400] border-[#ffe400]' : 'text-gray-400'}`}>
                  {isFullscreen ? <XIcon className="w-4 h-4" /> : <ArrowsExpandIcon className="w-4 h-4" />}
                </button>
                <a href={buildUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-[#1a0b2e] bg-[#ffe400] rounded hover:bg-white transition-colors"><ExternalLinkIcon className="w-3 h-3" /> Tab Mới</a>
              </div>
            </div>
            <div className="relative flex items-center justify-center flex-1 p-4 overflow-auto bg-[#525659] custom-scrollbar">
              <Document file={buildUrl} onLoadSuccess={onDocumentLoadSuccess} loading={<div className="text-sm text-white animate-pulse">Đang tải...</div>} error={<div className="text-sm text-red-400">Lỗi tải PDF</div>} className="flex flex-col items-center justify-center shadow-2xl">
                <Page pageNumber={pageNumber} scale={pdfScale} width={isFullscreen ? pdfWidth - 40 : (pdfWidth > 0 ? Math.min(pdfWidth - 20, 900) : 600)} renderTextLayer={false} renderAnnotationLayer={false} className="overflow-hidden bg-white border rounded-sm shadow-2xl border-white/5" />
              </Document>
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3 px-4 py-2 bg-[#1a0b2e]/90 backdrop-blur-md rounded-full border border-[#ffe400]/30 shadow-xl z-20">
              <button onClick={() => changePage(-1)} disabled={pageNumber <= 1} aria-label="Trang trước" className="p-1.5 rounded-full bg-white/10 hover:bg-[#ffe400] text-white hover:text-black transition-all disabled:opacity-30"><ChevronLeftIcon className="w-5 h-5" /></button>
              <span className="min-w-[2rem] text-center text-sm font-bold text-white">{pageNumber}</span>
              <button onClick={() => changePage(1)} disabled={pageNumber >= (numPages || 1)} aria-label="Trang sau" className="p-1.5 rounded-full bg-white/10 hover:bg-[#ffe400] text-white hover:text-black transition-all disabled:opacity-30"><ChevronRightIcon className="w-5 h-5" /></button>
            </div>
          </div>
        ) : (buildSteps.length > 0 && buildSteps.some((b: any) => b.build_type !== 'pdf')) ? (
          <div className={`flex flex-col overflow-hidden bg-white/5 border border-[#ffe400]/30 shadow-2xl backdrop-blur-sm transition-all duration-300 z-50 ${isFullscreen ? 'fixed inset-0 w-screen h-screen rounded-none bg-black' : 'absolute inset-0 w-full h-full rounded-3xl'}`}>
            <div className="absolute top-0 left-0 right-0 z-20 flex items-start justify-between p-6 pointer-events-none bg-gradient-to-b from-black/80 to-transparent">
              <span className="px-4 py-1 text-xs border rounded-lg pointer-events-auto bg-black/50 text-white/80 backdrop-blur-md border-white/10">{isFullscreen ? 'Toàn màn hình' : 'Xem thường'}</span>
              <button onClick={() => setIsFullscreen(!isFullscreen)} aria-label={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"} className="p-2 text-white transition-all rounded-lg pointer-events-auto bg-white/10 hover:bg-white/20 hover:scale-110">{isFullscreen ? <XIcon className="w-6 h-6" /> : <ArrowsExpandIcon className="w-6 h-6" />}</button>
            </div>
            <div className="flex items-center justify-center w-full h-full"><img loading="lazy" src={buildSteps[currentStep].url || buildSteps[currentStep].image_url} alt="step" className={`object-contain transition-all duration-500 ${isFullscreen ? 'h-full w-auto' : 'h-full w-full p-4 lg:p-12'}`} onError={(e) => (e.currentTarget as HTMLImageElement).src = "https://placehold.co/800x600/1a0b2e/ffffff?text=No+Image"} /></div>
            <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
              <button onClick={prevStep} disabled={currentStep === 0} aria-label="Bước trước" className={`pointer-events-auto p-4 rounded-full transition-all transform hover:scale-110 active:scale-95 border border-white/10 backdrop-blur-md ${currentStep === 0 ? 'bg-black/20 text-gray-500 opacity-50 cursor-not-allowed' : 'bg-[#ffe400] text-black shadow-[0_0_20px_#ffe400]'}`}><ChevronLeftIcon className="w-8 h-8" /></button>
              <button onClick={nextStep} disabled={currentStep === buildSteps.length - 1} aria-label="Bước sau" className={`pointer-events-auto p-4 rounded-full transition-all transform hover:scale-110 active:scale-95 border border-white/10 backdrop-blur-md ${currentStep === buildSteps.length - 1 ? 'bg-black/20 text-gray-500 opacity-50 cursor-not-allowed' : 'bg-[#ffe400] text-black shadow-[0_0_20px_#ffe400]'}`}><ChevronRightIcon className="w-8 h-8" /></button>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed border-[#ffe400]/30 rounded-3xl bg-white/5"><PhotographIcon className="w-12 h-12 mb-2 text-gray-600" /><p className="font-medium text-gray-500">Chưa có hướng dẫn lắp ráp</p></div>
        )}
      </div>
    </section>
  );
});

const QuizSection = React.memo(({ quizzes, sectionRef }: { quizzes: Quiz[], sectionRef: any }) => {
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => { setCurrentQuizIndex(0); setUserAnswers({}); setIsCompleted(false); }, [quizzes]);

  const handleAnswerClick = useCallback((optionIndex: number) => {
    setUserAnswers(prev => {
      if (prev[currentQuizIndex] !== undefined) return prev;
      return { ...prev, [currentQuizIndex]: optionIndex };
    });
  }, [currentQuizIndex]);

  const handleNext = () => { if (currentQuizIndex < quizzes.length - 1) setCurrentQuizIndex(prev => prev + 1); else setIsCompleted(true); };
  const handlePrev = () => { if (currentQuizIndex > 0) setCurrentQuizIndex(prev => prev - 1); };
  const handleRestart = () => { setCurrentQuizIndex(0); setUserAnswers({}); setIsCompleted(false); };

  if (isCompleted) {
    const score = quizzes.reduce((acc, q, idx) => {
      const selectedIdx = userAnswers[idx];
      if (selectedIdx === undefined) return acc;
      const options = q.options || q.answers || [];
      const isCorrect = options[selectedIdx]?.is_correct;
      return acc + (isCorrect ? 1 : 0);
    }, 0);

    return (
      <section id="quiz" ref={sectionRef}>
        <div className="relative overflow-hidden bg-[#1a0b2e]/60 backdrop-blur-md border-2 border-[#ffe400] rounded-3xl shadow-[0_0_30px_rgba(255,228,0,0.15)] transition-shadow p-12 text-center animate-fade-in-up">
          <div className="mb-6 inline-block p-4 rounded-full bg-[#ffe400]/20 text-[#ffe400] border border-[#ffe400] animate-bounce"><AcademicCapIcon className="w-16 h-16" /></div>
          <h2 className="mb-4 text-3xl font-black text-white uppercase">Chúc mừng bạn đã hoàn thành!</h2>
          <p className="mb-8 text-lg text-gray-300">Bạn đã trả lời đúng <span className="text-[#ffe400] font-bold text-2xl">{score}</span> / <span className="text-2xl font-bold text-white">{quizzes.length}</span> câu hỏi.</p>
          <button onClick={handleRestart} className="inline-flex items-center gap-2 px-8 py-3 bg-[#ffe400] hover:bg-white text-black font-bold rounded-full transition-all shadow-[0_0_20px_rgba(255,228,0,0.4)] hover:scale-105 active:scale-95"><RefreshIcon className="w-5 h-5" /> Làm lại bài trắc nghiệm</button>
        </div>
      </section>
    )
  }

  return (
    <section id="quiz" ref={sectionRef}>
      <div className="relative overflow-hidden bg-[#1a0b2e]/60 backdrop-blur-md border-2 border-[#ffe400] rounded-3xl shadow-[0_0_30px_rgba(255,228,0,0.15)] hover:shadow-[0_0_50px_rgba(255,228,0,0.25)] transition-shadow transform-gpu">
        <div className="bg-gradient-to-r from-[#ffe400] to-[#fff282] p-6 text-center relative z-10"><h2 className="flex items-center justify-center gap-3 text-2xl font-black tracking-widest text-[#1a0b2e] uppercase"><QuestionMarkCircleIcon className="w-8 h-8" /> Tổng kết kiến thức</h2></div>
        <div className="relative z-10 p-8 md:p-12">
          {quizzes.length > 0 ? (
            <div className="max-w-2xl mx-auto">
              <div className="mb-8 text-center"><span className="inline-block px-4 py-1 rounded-full bg-[#ffe400]/10 text-[#ffe400] font-bold text-xs uppercase tracking-widest mb-4 border border-[#ffe400]/20">Câu hỏi {currentQuizIndex + 1} / {quizzes.length}</span><h3 className="text-2xl font-bold leading-relaxed text-white min-h-[4rem] flex items-center justify-center">{quizzes[currentQuizIndex].question_text}</h3></div>
              <div className="mb-8 space-y-3">
                {(quizzes[currentQuizIndex].options || quizzes[currentQuizIndex].answers || []).map((opt: any, idx) => {
                  const isCorrect = opt.is_correct;
                  const currentUserAnswer = userAnswers[currentQuizIndex];
                  const isAnswered = currentUserAnswer !== undefined;
                  let btnClass = "bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#ffe400] text-white";
                  let icon = null;
                  if (isAnswered) {
                    if (isCorrect) { btnClass = "bg-green-500/20 border-green-500 text-green-400"; icon = <CheckIcon className="w-5 h-5" />; }
                    else if (currentUserAnswer === idx) { btnClass = "bg-red-500/20 border-red-500 text-red-400"; icon = <XCircleIcon className="w-5 h-5" />; }
                    else { btnClass = "opacity-50 border-transparent text-gray-500"; }
                  } else { btnClass = "bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#ffe400] text-white cursor-pointer hover:scale-[1.02]"; }
                  return (
                    <button key={idx} onClick={() => handleAnswerClick(idx)} disabled={isAnswered} className={`w-full p-4 rounded-xl border font-bold text-lg transition-all duration-200 group flex items-center justify-between ${btnClass}`}>
                      <span>{opt.option_text || opt.answer_text}</span>
                      {icon || (!isAnswered && <div className={`w-4 h-4 border-2 rounded-full border-white/30 group-hover:border-[#ffe400]`}></div>)}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center justify-between pt-6 mt-8 border-t border-white/10">
                <button onClick={handlePrev} disabled={currentQuizIndex === 0} aria-label="Câu hỏi trước" className="flex items-center gap-2 font-bold text-gray-400 transition-colors hover:text-[#ffe400] disabled:opacity-30"><ChevronLeftIcon className="w-5 h-5" /> Câu trước</button>
                <div className="flex gap-1">{quizzes.map((_, idx) => (<div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === currentQuizIndex ? 'bg-[#ffe400] w-6 shadow-[0_0_8px_#ffe400]' : (userAnswers[idx] !== undefined ? 'bg-blue-500' : 'bg-gray-700')}`}></div>))}</div>
                <button onClick={handleNext} disabled={userAnswers[currentQuizIndex] === undefined} aria-label="Câu hỏi tiếp theo" className={`flex items-center gap-2 font-bold transition-colors ${userAnswers[currentQuizIndex] !== undefined ? 'text-[#ffe400] hover:text-white' : 'text-gray-600 cursor-not-allowed'}`}>{currentQuizIndex === quizzes.length - 1 ? "Hoàn thành" : "Tiếp theo"} <ChevronRightIcon className="w-5 h-5" /></button>
              </div>
            </div>
          ) : (<div className="py-10 text-center text-gray-500">Chưa có câu hỏi.</div>)}
        </div>
      </div>
    </section>
  );
});

// --- MAIN COMPONENT ---
const StudentLessonPlayer = () => {
  const params = useParams();
  const lessonId = params.lessonId || params.id;
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [lessonInfo, setLessonInfo] = useState<LessonInfo | null>(null);
  const [objectives, setObjectives] = useState<Objective | null>(null);
  const [preparation, setPreparation] = useState<Preparation | null>(null);
  const [buildSteps, setBuildSteps] = useState<BuildStep[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [lessonContents, setLessonContents] = useState<LessonContent[]>([]);

  // State quản lý Tab bài học
  const [activeTab, setActiveTab] = useState<number>(0);

  // [NEW] State quản lý các challenge đang được bật gợi ý
  const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});

  const [activeId, setActiveId] = useState("objectives");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const mainContentRef = useRef<HTMLDivElement>(null);
  const scrollPosRef = useRef(0);
  const sectionRefs = useRef<Record<string, HTMLElement>>({});

  const setSectionRef = useCallback((id: string) => (el: any) => {
    if (el) sectionRefs.current[id] = el;
  }, []);

  // [NEW] Toggle gợi ý cho từng challenge
  const toggleHint = (id: number) => {
    setRevealedHints(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSetFullscreen = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    setIsFullscreen((prev) => {
      const newState = typeof value === 'function' ? value(prev) : value;
      if (newState === true && prev === false) {
        if (mainContentRef.current) {
          scrollPosRef.current = mainContentRef.current.scrollTop;
        }
      }
      return newState;
    });
  }, []);

  useLayoutEffect(() => {
    if (!isFullscreen) {
      if (mainContentRef.current) {
        mainContentRef.current.scrollTop = scrollPosRef.current;
      }
    }
  }, [isFullscreen]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop > 300) {
      setShowScrollTop(true);
    } else {
      setShowScrollTop(false);
    }
  };

  const scrollToTop = () => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (isLoading || !mainContentRef.current || isFullscreen) return;

    const observer = new IntersectionObserver((entries) => {
      const visibleSection = entries.find(entry => entry.isIntersecting)?.target;
      if (visibleSection) setActiveId(visibleSection.id);
    }, { root: mainContentRef.current, rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );

    Object.values(sectionRefs.current).forEach((el: any) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [isLoading, isFullscreen]);

  const scrollToSection = useCallback((id: string) => {
    const element = sectionRefs.current[id];
    const container = mainContentRef.current;
    if (element && container) {
      container.scrollTo({ top: element.offsetTop - 20, behavior: "smooth" });
      setActiveId(id);
    }
  }, []);

  useEffect(() => {
    const fetchFullLessonData = async () => {
      setErrorMsg(null); setIsLoading(true);
      if (!lessonId) { setIsLoading(false); return; }

      try {
        const rawToken = localStorage.getItem("token");
        if (!rawToken) { setErrorMsg("Bạn chưa đăng nhập (Thiếu Token)"); setIsLoading(false); return; }
        const cleanToken = rawToken.replace(/^["']+|["']+$/g, '').trim();
        const headers: any = { "Authorization": `Bearer ${cleanToken}`, "Content-Type": "application/json" };

        const safeFetch = async (url: string, type: 'array' | 'object' = 'array') => {
          try {
            const res = await fetch(url, { headers });
            if (!res.ok) return type === 'array' ? [] : null;
            const json = await res.json();
            if (type === 'array') {
              if (json.contents && Array.isArray(json.contents)) return json.contents;
              if (json.quizzes && Array.isArray(json.quizzes)) return json.quizzes;
              if (json.challenges && Array.isArray(json.challenges)) return json.challenges;
              if (json.data && Array.isArray(json.data)) return json.data;
              return Array.isArray(json) ? json : [];
            }
            return (json.data && !Array.isArray(json.data)) ? json.data : (json.data || json);
          } catch (e) { return type === 'array' ? [] : null; }
        };

        const [objData, lessonRes, prepData, buildData, quizData, chalData, mediaData, contentData] = await Promise.all([
          safeFetch(`${API_BASE}/lessons/objectives/${lessonId}/objectives`, 'object'),
          fetch(`${API_BASE}/lessons/student/${lessonId}`, { headers }),
          safeFetch(`${API_BASE}/lessons/preparations/${lessonId}`, 'object'),
          safeFetch(`${API_BASE}/lessons/builds/${lessonId}`, 'array'),
          safeFetch(`${API_BASE}/lessons/quizzes/${lessonId}`, 'array'),
          safeFetch(`${API_BASE}/lessons/challenges/${lessonId}`, 'array'),
          safeFetch(`${API_BASE}/lessons/lessonMedia/${lessonId}`, 'array'),
          safeFetch(`${API_BASE}/lessons/lessonContents/${lessonId}`, 'array')
        ]);

        let finalObjectives = (objData as any)?.objectives || objData?.data || objData;
        if (!finalObjectives) {
          const allObjs = await safeFetch(`${API_BASE}/objectives`, 'array');
          finalObjectives = allObjs.find((o: any) => String(o.lesson_id) === String(lessonId) || String(o.lessonId) === String(lessonId));
        }
        setObjectives(finalObjectives);

        if (lessonRes.ok) {
          const lessonJson = await lessonRes.json();
          const lessonData = Array.isArray(lessonJson.data || lessonJson.lesson) ? (lessonJson.data || lessonJson.lesson)[0] : (lessonJson.data || lessonJson.lesson || lessonJson);
          setLessonInfo(lessonData);
          
          if (lessonJson.progress && lessonJson.progress.status && ['submitted', 'đã nộp bài', 'completed'].includes(lessonJson.progress.status.toLowerCase())) {
            setIsSubmitted(true);
          }
        }

        setPreparation((prepData as any)?.preparation || prepData);
        setBuildSteps((Array.isArray(buildData) ? buildData : []).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)));

        const sortedContents = (Array.isArray(contentData) ? contentData : [])
          .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
        setLessonContents(sortedContents);

        const mappedQuizzes = (quizData || []).map((q: any) => ({ ...q, options: q.answers?.map((a: any) => ({ option_text: a.answer_text, is_correct: a.is_correct })) || [] }));
        setQuizzes(mappedQuizzes);
        setChallenges(chalData);
        setMediaList(mediaData || []);
      } catch (err: any) {
        console.error("Error loading lesson:", err);
        setErrorMsg(err.message || "Lỗi tải bài học");
      } finally { setIsLoading(false); }
    };
    fetchFullLessonData();
  }, [lessonId]);

  const pdfItem = useMemo(() => mediaList.find(m => (m.media?.mime_type || m.mime_type || "").includes('pdf') || (m.media?.url || m.url || "").endsWith('.pdf')), [mediaList]);
  const buildUrl = smartFixUrl(pdfItem ? (pdfItem.media?.url || pdfItem.url) : undefined);
  const videoItem = useMemo(() => mediaList.find(m => (m.media?.mime_type || m.mime_type || "").includes('video')), [mediaList]);
  const videoUrl = smartFixUrl(videoItem ? (videoItem.media?.url || videoItem.url) : undefined);
  const preparationMedia = useMemo(() => mediaList.filter(m => m.purpose === MEDIA_PURPOSE.ATTACHMENT), [mediaList]);
  const lessonContentMedia = useMemo(() => mediaList.filter(m => m.purpose === MEDIA_PURPOSE.MAIN), [mediaList]);
  const globalChallengeMedia = useMemo(() => mediaList.filter(m => m.purpose === MEDIA_PURPOSE.OTHER), [mediaList]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0f0518] overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-[#9c00e5] blur-[150px] rounded-full pointer-events-none opacity-30 animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#ffe400] blur-[150px] rounded-full pointer-events-none opacity-10 animate-blob animation-delay-2000"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative flex items-center justify-center mb-8">
            <div className="w-24 h-24 border-4 border-[#ffe400]/20 border-t-[#ffe400] rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center"><LightningBoltIcon className="w-10 h-10 text-[#ffe400] animate-pulse" /></div>
          </div>
          <div className="text-[#ffe400] font-bold text-sm tracking-[0.3em] uppercase animate-pulse">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  if (errorMsg || !lessonInfo) return <div className="min-h-screen bg-[#0f0518] flex items-center justify-center text-red-500 font-bold">{errorMsg || "Không tìm thấy bài học"}</div>;

  const menuItems = [
    { id: 'objectives', label: 'Mục tiêu', icon: <CheckCircleIcon className="w-5 h-5" />, color: BRAND_COLORS.blue },
    { id: 'overview', label: 'Tổng Quan', icon: <MapIcon className="w-5 h-5" />, color: BRAND_COLORS.green },
    { id: 'intro', label: 'Giới thiệu', icon: <PlayIcon className="w-5 h-5" />, color: BRAND_COLORS.pink },
    { id: 'preparation', label: 'Chuẩn bị', icon: <BeakerIcon className="w-5 h-5" />, color: BRAND_COLORS.orange },
    { id: 'build', label: 'Xây dựng', icon: <PhotographIcon className="w-5 h-5" />, color: BRAND_COLORS.green },
    { id: 'lesson', label: 'Bài học', icon: <DesktopComputerIcon className="w-5 h-5" />, color: BRAND_COLORS.yellow },
    { id: 'challenge', label: 'Thử thách', icon: <LightningBoltIcon className="w-5 h-5" />, color: BRAND_COLORS.yellow },
    { id: 'quiz', label: 'Tổng kết', icon: <QuestionMarkCircleIcon className="w-5 h-5" />, color: BRAND_COLORS.purple },
  ];

  return (
    <div className="h-screen bg-[#0f0518] text-slate-200 font-sans selection:bg-[#ffe400] selection:text-black flex flex-col overflow-hidden relative">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }
        .custom-scrollbar-dark::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar-dark::-webkit-scrollbar-track { background: #f3f4f6; border-radius: 10px; }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
        .perspective-1000 { perspective: 1000px; }
        .flip-card-inner { position: relative; width: 100%; height: 100%; transition: transform 0.8s; transform-style: preserve-3d; }
        .group:hover .flip-card-inner { transform: rotateY(180deg); }
        .flip-card-front, .flip-card-back { position: absolute; width: 100%; height: 100%; -webkit-backface-visibility: hidden; backface-visibility: hidden; border-radius: 1rem; }
        .flip-card-back { transform: rotateY(180deg); }
        @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-300 { animation-delay: 0.3s; }
        .will-change-opacity { will-change: opacity; }
        /* GPU Optimization */
        .transform-gpu { transform: translateZ(0); }
      `}</style>

      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30 transform-gpu bg-[image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[length:4rem_4rem] [mask-image:radial-gradient(circle_at_center,black,transparent_80%)]"></div>
      <div className="fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-[#9c00e5] blur-[150px] rounded-full pointer-events-none mix-blend-screen opacity-30 animate-blob"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#ffe400] blur-[150px] rounded-full pointer-events-none mix-blend-screen opacity-20 animate-blob animation-delay-2000"></div>

      {/* HEADER */}
      {!isFullscreen && (
        <div className="z-50 bg-[#0f0518]/70 backdrop-blur-xl border-b border-white/5 shadow-2xl shrink-0">
          <div className="container px-4 py-3 mx-auto lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* 1. Nút Quay Lại */}
                <button aria-label="Back" title="Quay lại" onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all rounded-full bg-white/5 hover:bg-[#ffe400] hover:text-black text-white/70 group border border-white/5">
                  <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Quay lại
                </button>

                {/* 2. Nút Danh sách */}
                <button aria-label="Course List" title="Danh sách khóa học" onClick={() => navigate('/student/my-courses')} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all rounded-full bg-white/5 hover:bg-[#ffe400] hover:text-black text-white/70 group border border-white/5">
                  <CollectionIcon className="w-4 h-4" /> Danh sách
                </button>

                <div className="h-8 w-[1px] bg-white/10 hidden md:block ml-2"></div>
                <div className="hidden md:block"><h1 className="text-xl font-black tracking-wide text-white drop-shadow-md">{lessonInfo?.title}</h1></div>
                
                {/* [NEW] BADGE SUBMISSION STATUS */}
                <div className="hidden md:flex items-center ml-2">
                  {isSubmitted ? (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/50 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                      <CheckCircleIcon className="w-4 h-4" /> Đã nộp bài
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/50 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                      <XCircleIcon className="w-4 h-4" /> Chưa làm
                    </span>
                  )}
                </div>
              </div>
              <button aria-label="Home" title="Trang chủ" onClick={() => navigate('/student/dashboard')} className="p-2.5 transition-all rounded-full bg-gradient-to-r from-[#9c00e5] to-[#443fff] shadow-lg hover:shadow-purple-500/50 text-white hover:scale-110"><HomeIcon className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN LAYOUT */}
      <div className={`flex flex-1 overflow-hidden relative z-10 ${isFullscreen ? 'p-0' : 'container mx-auto lg:px-8'}`}>
        {!isFullscreen && (
          <div className="hidden lg:flex flex-col w-72 h-full pt-8 pb-4 pr-4 shrink-0 overflow-y-auto custom-scrollbar border-r border-white/5 bg-[#0f0518]/20 backdrop-blur-sm">
            <p className="px-2 text-xs font-bold tracking-[0.2em] text-[#ffe400] uppercase mb-4 sticky top-0 bg-[#0f0518]/0 z-10">Mục lục bài học</p>
            <div className="space-y-3">
              {menuItems.map((item) => {
                const isActive = activeId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`relative w-full flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 border overflow-hidden group transform-gpu ${isActive ? 'bg-[#2a1b3d]/60 border-[#ffe400]/50 shadow-[0_0_15px_rgba(255,228,0,0.1)] translate-x-2 backdrop-blur-md' : 'border-transparent hover:bg-white/5 hover:border-white/10 opacity-70 hover:opacity-100'}`}
                    style={{ '--item-color': isActive ? '#ffe400' : item.color.main } as React.CSSProperties}
                  >
                    {isActive && (<div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#ffe400] shadow-[0_0_10px_#ffe400]"></div>)}
                    <div className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 shadow-inner z-10 text-[color:var(--item-color)] ${isActive ? 'scale-110 shadow-lg ring-1 ring-[#ffe400]/20 bg-[#ffe400]/10' : 'grayscale-[0.5] group-hover:grayscale-0'}`}>{item.icon}</div>
                    <div className="z-10 text-left"><span className={`block text-base font-bold uppercase tracking-wide transition-colors ${isActive ? 'text-[#ffe400] drop-shadow-[0_0_5px_rgba(255,228,0,0.5)]' : 'text-gray-400 group-hover:text-white'}`}>{item.label}</span></div>
                    {isActive && (<div className="absolute inset-0 opacity-10 bg-gradient-to-r from-[#ffe400] to-transparent pointer-events-none"></div>)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div ref={mainContentRef} onScroll={handleScroll} className={`flex-1 h-full overflow-y-auto custom-scrollbar scroll-smooth ${isFullscreen ? '' : 'pt-8 pl-0 lg:pl-10 pb-32'}`}>
          <div className="max-w-5xl mx-auto space-y-24">
            {!isFullscreen && <ObjectivesSection objectives={objectives} sectionRef={setSectionRef('objectives')} />}

            {!isFullscreen && <OverviewSection sectionRef={setSectionRef('overview')} />}

            {!isFullscreen && <IntroSection lessonInfo={lessonInfo} videoUrl={videoUrl} sectionRef={setSectionRef('intro')} />}

            {preparation && !isFullscreen && <PreparationSection preparation={preparation} preparationMedia={preparationMedia} sectionRef={setSectionRef('preparation')} />}

            <BuildSection buildUrl={buildUrl} buildSteps={buildSteps} isFullscreen={isFullscreen} setIsFullscreen={handleSetFullscreen} sectionRef={setSectionRef('build')} />

            {!isFullscreen && (
              <section id="lesson" ref={setSectionRef('lesson')}>
                <div className="relative overflow-hidden bg-[#1a0b2e]/60 backdrop-blur-md border border-[#ffe400]/30 rounded-3xl p-8 shadow-[0_0_20px_rgba(255,228,0,0.05)] transform-gpu">
                  <div className="flex items-center gap-4 pb-4 mb-8 border-b border-white/10">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-[#ffe400] to-[#fff282] shadow-lg shadow-yellow-500/20">
                      <DesktopComputerIcon className="w-6 h-6 text-[#1a0b2e]" />
                    </div>
                    <h2 className="text-2xl font-black tracking-wide text-white uppercase">Nội dung bài học</h2>
                  </div>
                  <div className="relative z-10 flex flex-col space-y-8">
                    {/* --- LOGIC TABS NGANG --- */}
                    {lessonContents.length > 0 ? (
                      <div>
                        <div className="flex items-center gap-2 pb-2 mb-6 overflow-x-auto border-b scrollbar-hide border-white/10">
                          {lessonContents.map((item, idx) => {
                            const isActive = activeTab === idx;
                            return (
                              <button
                                key={idx}
                                onClick={() => setActiveTab(idx)}
                                className={`flex-shrink-0 px-6 py-3 rounded-t-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 relative ${isActive
                                    ? 'bg-[#ffe400] text-black shadow-[0_-5px_20px_rgba(255,228,0,0.3)]'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                  }`}
                              >
                                {item.title}
                                {isActive && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#ffe400] translate-y-full"></div>}
                              </button>
                            )
                          })}
                        </div>

                        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl min-h-[400px] animate-fade-in-up">
                          {(() => {
                            const item = lessonContents[activeTab];
                            if (!item) return null;
                            return (
                              <div className="space-y-6">
                                <div className="pb-4 border-b border-gray-100">
                                  <h3 className="text-2xl font-black text-[#9c00e5] uppercase mb-2">{item.title}</h3>
                                  {item.subtitle && <p className="font-medium text-gray-500">{item.subtitle}</p>}
                                </div>

                                {item.description && (
                                  <div className="bg-[#f0f9ff] border-l-4 border-[#0ea5e9] p-4 text-gray-700 italic rounded-r-lg">
                                    {item.description}
                                  </div>
                                )}

                                {item.usage_text && (
                                  <div className="text-gray-800 text-lg leading-8 whitespace-pre-line text-justify max-h-[800px] overflow-y-auto custom-scrollbar-dark pr-2">
                                    {item.usage_text}
                                  </div>
                                )}

                                {item.example_text && (
                                  <div className="relative p-5 overflow-hidden border border-yellow-300 border-dashed bg-yellow-50 rounded-xl">
                                    <div className="absolute top-0 right-0 p-2 opacity-10"><LightBulbIcon className="w-16 h-16 text-yellow-500" /></div>
                                    <h4 className="relative z-10 flex items-center gap-2 mb-3 text-xs font-bold tracking-widest text-yellow-700 uppercase"><LightBulbIcon className="w-5 h-5" /> Ví dụ thực tế</h4>
                                    <div className="relative z-10 pl-2 font-medium text-gray-800 whitespace-pre-line border-l-2 border-yellow-500">{item.example_text}</div>
                                  </div>
                                )}

                                {item.media && item.media.length > 0 && (
                                  <div className="pt-6 border-t border-gray-100">
                                    <h4 className="flex items-center gap-2 mb-4 text-xs font-bold text-gray-400 uppercase"><PhotographIcon className="w-4 h-4" /> Hình ảnh liên quan</h4>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                      {item.media.map((m: any, mIdx: number) => (
                                        <div key={m.id || mIdx} className="relative overflow-hidden transition-all border border-gray-200 shadow-sm group rounded-xl bg-gray-50 cursor-zoom-in hover:shadow-lg">
                                          <img
                                            loading="lazy"
                                            src={smartFixUrl(m.media?.url)}
                                            alt="Minh họa"
                                            className="w-full h-auto object-contain max-h-[300px] transition-transform duration-500 group-hover:scale-105"
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })()}
                        </div>
                      </div>
                    ) : lessonInfo?.content ? (
                      <div className="w-full p-6 text-black bg-white shadow-xl rounded-2xl md:p-8">
                        <h3 className="text-xl font-bold mb-4 text-[#9c00e5] flex items-center gap-2"><InformationCircleIcon className="w-6 h-6" /> Lý thuyết tổng quan</h3>
                        <div className="text-lg leading-relaxed text-gray-700 whitespace-pre-line">{lessonInfo.content}</div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center w-full p-12 text-center text-gray-500 border-2 border-dashed rounded-3xl border-white/10">
                        <InformationCircleIcon className="w-12 h-12 mb-3 opacity-50" />
                        <p>Nội dung đang cập nhật...</p>
                      </div>
                    )}

                    {lessonContentMedia.length > 0 && (
                      <div className="pt-8 mt-8 border-t border-white/10">
                        <h4 className="flex items-center gap-2 mb-6 text-sm font-bold tracking-widest uppercase text-white/80">
                          <PhotographIcon className="w-4 h-4 text-[#ffe400]" /> Thư viện hình ảnh bài học
                        </h4>
                        <div className="grid gap-6 md:grid-cols-2">
                          {lessonContentMedia.map((m, idx) => (
                            <div key={m.id || m.media_id} className="flex flex-col gap-4 p-4 bg-white shadow-xl rounded-2xl hover:scale-[1.02] transition-transform duration-300 transform-gpu group">
                              <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center relative">
                                <img loading="lazy" src={smartFixUrl(m.url || m.media?.url)} className="object-contain w-full h-full transition-transform duration-700 max-h-60 group-hover:scale-110" alt={`Content ${idx}`} />
                              </div>
                              <div className="text-center">
                                <span className="inline-block px-3 py-1 text-xs font-bold tracking-widest text-gray-500 uppercase bg-gray-100 rounded-full group-hover:bg-[#ffe400] group-hover:text-black transition-colors">
                                  Hình minh họa {idx + 1}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {!isFullscreen && (
              <section id="challenge" ref={setSectionRef('challenge')}>
                <div className="relative overflow-hidden bg-[#1a0b2e]/60 backdrop-blur-md border-2 border-[#ffe400] rounded-3xl p-1 shadow-2xl transform-gpu">
                  <div className="bg-black text-white text-center py-4 rounded-t-[1.3rem]"><h2 className="text-2xl font-black tracking-wide uppercase">Thử thách quan sát và lập trình</h2></div>
                  <div className="p-6 m-2 text-black bg-white rounded-xl md:p-8">
                    <div className="space-y-12">
                      {challenges.length > 0 ? challenges.map((chal, cIdx) => (
                        <div key={chal.id} className="pb-8 border-b border-gray-200 last:border-0">
                          <div className="mb-4">
                            <h3 className="text-2xl font-black text-[#9c00e5] mb-2 uppercase">{cIdx + 1}. {chal.title}</h3>
                            {chal.subtitle && <p className="text-sm font-bold tracking-wider text-gray-500 uppercase">{chal.subtitle}</p>}
                          </div>

                          <div className="mb-6 text-lg leading-relaxed text-gray-700 whitespace-pre-line">{chal.description}</div>

                          {/* --- [UPDATED] Nút bật tắt gợi ý --- */}
                          <div className="mb-8">
                            <button
                              onClick={() => toggleHint(chal.id)}
                              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-md ${revealedHints[chal.id]
                                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-300 hover:bg-yellow-200'
                                  : 'bg-[#9c00e5] text-white hover:bg-[#8000c0] hover:scale-105'
                                }`}
                            >
                              {revealedHints[chal.id] ? <EyeOffIcon className="w-5 h-5" /> : <LightBulbIcon className="w-5 h-5" />}
                              {revealedHints[chal.id] ? "Ẩn hướng dẫn chi tiết" : "Xem gợi ý / Hướng dẫn"}
                            </button>

                            {/* Khu vực hiển thị hướng dẫn (Chỉ hiện khi state = true) */}
                            {revealedHints[chal.id] && chal.instructions && (
                              <div className="p-6 mt-4 border-2 border-yellow-200 border-dashed bg-yellow-50 rounded-2xl animate-fade-in-up">
                                <h4 className="text-yellow-800 font-bold uppercase text-xs tracking-[0.1em] mb-4 flex items-center gap-2">
                                  <LightBulbIcon className="w-5 h-5 text-yellow-500" /> Hướng dẫn thực hiện
                                </h4>
                                <div className="font-medium leading-relaxed text-gray-800 whitespace-pre-line">
                                  {chal.instructions}
                                </div>
                              </div>
                            )}
                          </div>

                          {(chal.media && chal.media.length > 0) ? (
                            <div className="grid gap-6 md:grid-cols-2">
                              {chal.media.map((m, mIdx) => (
                                <div key={m.id} className="flex flex-col items-center gap-4 p-4 transition-shadow border rounded-xl bg-gray-50 hover:shadow-md">
                                  <div className="w-full h-48 overflow-hidden border border-gray-200 rounded-lg shadow-sm">
                                    <img loading="lazy" src={smartFixUrl(m.media?.url)} alt={`Challenge Media ${mIdx + 1}`} className="object-contain w-full h-full" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (globalChallengeMedia.length > 0) ? (
                            <div className="grid gap-6 md:grid-cols-2">
                              {globalChallengeMedia.map((m, mIdx) => (
                                <div key={m.id || mIdx} className="flex flex-col items-center gap-4 p-4 transition-shadow border rounded-xl bg-gray-50 hover:shadow-md">
                                  <div className="w-full h-48 overflow-hidden border border-gray-200 rounded-lg shadow-sm">
                                    <img loading="lazy" src={smartFixUrl(m.url || m.media?.url)} alt={`Global Challenge Media ${mIdx + 1}`} className="object-contain w-full h-full" />
                                  </div>
                                  <p className="text-xs italic text-gray-500">(Hình ảnh minh họa chung)</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="mt-4 text-sm italic text-gray-400">Không có hình ảnh minh họa cho thử thách này.</div>
                          )}
                          
                          <ChallengeSandbox challengeId={chal.id} lessonId={Number(lessonId)} role="student" onUploadSuccess={() => setIsSubmitted(true)} />
                        </div>
                      )) : (<div className="py-10 text-center text-gray-400">Đang cập nhật thử thách...</div>)}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {!isFullscreen && <QuizSection quizzes={quizzes} sectionRef={setSectionRef('quiz')} />}
          </div>

          {/* Scroll To Top Button */}
          {!isFullscreen && showScrollTop && (
            <button
              onClick={scrollToTop}
              className="fixed bottom-8 right-8 p-3 rounded-full bg-[#ffe400] text-black shadow-[0_0_20px_rgba(255,228,0,0.4)] hover:scale-110 transition-transform z-50 animate-fade-in-up"
              aria-label="Scroll to top"
              title="Lên đầu trang"
            >
              <ArrowUpIcon className="w-6 h-6 font-bold" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentLessonPlayer;