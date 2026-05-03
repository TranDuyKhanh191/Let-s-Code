import React, { useState, useEffect, useRef } from "react";
import {
  BookOpenIcon,
  SearchIcon,
  ChevronDownIcon,
  ArrowLeftIcon,
  PencilIcon,
  CollectionIcon,
  PlusIcon,
  XIcon,
  FilterIcon,
  CubeIcon,
  EyeIcon,
  EyeOffIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  SortAscendingIcon // Icon mới cho nút sắp xếp
} from "@heroicons/react/solid";
import "../../styles/admin.css";

// Import Layout Components
import HeaderAdmin from "../../components/layout/HeaderAdmin";

// Import Lesson Components
import LessonObjectives from "../../components/admin/lesson/LessonObjectives";
import LessonProductVideo from "../../components/admin/lesson/LessonProductVideo";
import LessonPresentation from "../../components/admin/lesson/LessonPresentation";
import LessonSlides from "../../components/admin/lesson/LessonSlides";
import LessonContent from "../../components/admin/lesson/LessonContent";
import LessonChallenge from "../../components/admin/lesson/LessonChallenge";
import LessonQuiz from "../../components/admin/lesson/LessonQuiz";

// Custom Styles
const customStyles = `
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #9c00e5; border-radius: 3px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ff7c7c; }
  
  .modal-enter { animation: modalPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
  @keyframes modalPop {
    0% { opacity: 0; transform: scale(0.9) translateY(20px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }
`;

const API_BASE = "http://localhost:3000";

const TABS = [
  "Mục tiêu",
  "Video thành phẩm",
  "Vật liệu",
  "Slide lắp ráp",
  "Lý thuyết",
  "Thử thách",
  "Tổng kết",
];

interface Lesson {
    id: number;
    title: string;
    description?: string;
    status: "draft" | "published" | "archived";
    order?: number;
    sort_order?: number;
    course_id?: number;
    [key: string]: any;
}

export default function AdminLessonPage() {
  // --- State Data ---
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  
  // --- State Filter ---
  const [filterProgram, setFilterProgram] = useState<number | 'all'>('all');
  const [filterCode, setFilterCode] = useState<string>('all');

  // --- State UI ---
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // --- State Modals ---
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false); // [MỚI] Modal sắp xếp
  
  // Data Form
  const [newLessonData, setNewLessonData] = useState({ title: "", description: "" });
  const [editingLessonData, setEditingLessonData] = useState({ 
      id: 0, title: "", description: "" 
  });
  
  // [MỚI] State lưu dữ liệu sắp xếp tạm thời
  const [sortData, setSortData] = useState<{id: number, sort_order: number, title: string}[]>([]); 

  // Loading & Refs
  const [actionLoading, setActionLoading] = useState(false);
  const isSubmittingRef = useRef(false);

  // --- 1. Fetch Danh sách khóa học ---
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: token ? `Bearer ${token}` : "" };
        
        const [res1, res2] = await Promise.all([
            fetch(`${API_BASE}/api/courses/programs/1`, { headers }),
            fetch(`${API_BASE}/api/courses/programs/2`, { headers })
        ]);

        const data1 = res1.ok ? await res1.json() : { courses: [] };
        const data2 = res2.ok ? await res2.json() : { courses: [] };
        
        let allCourses = [
          ...(Array.isArray(data1.courses) ? data1.courses : data1 || []),
          ...(Array.isArray(data2.courses) ? data2.courses : data2 || []),
        ];
        
        allCourses = allCourses.map(c => ({
            ...c,
            derivedCode: c.course_code || c.category || c.status || "Unknown"
        }));

        const uniqueCourses = Array.from(new Map(allCourses.map(c => [c.id, c])).values());
        setCourses(uniqueCourses);
      } catch (e) {
        console.error("Lỗi tải khóa học:", e);
      }
      setLoading(false);
    };
    fetchCourses();
  }, []);

  // --- Logic Lọc Khóa Học ---
  const availableCodes = React.useMemo(() => {
    const codes = new Set<string>();
    courses.forEach(c => {
        if (filterProgram === 'all' || c.program_id === filterProgram) {
            if (c.derivedCode) codes.add(c.derivedCode);
        }
    });
    return Array.from(codes).sort();
  }, [courses, filterProgram]);

  const filteredCourseOptions = courses.filter(c => {
      const matchProgram = filterProgram === 'all' || c.program_id === filterProgram;
      const matchCode = filterCode === 'all' || c.derivedCode === filterCode;
      return matchProgram && matchCode;
  });

  useEffect(() => { setFilterCode('all'); }, [filterProgram]);

  // --- 2. Fetch Danh sách bài học ---
  const fetchLessons = async (courseId: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: token ? `Bearer ${token}` : "" };
      const res = await fetch(`${API_BASE}/api/lessons/courses/${courseId}`, { headers });
      const data = res.ok ? await res.json() : { lessons: [] };
      setLessons(data.lessons || data || []);
    } catch (e) {
      console.error("Lỗi tải bài học:", e);
      setLessons([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedCourse) {
      fetchLessons(selectedCourse.id);
      setSelectedLesson(null);
    } else {
      setLessons([]);
    }
  }, [selectedCourse]);

  // --- 3. Tạo bài học ---
  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || actionLoading || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setActionLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/lessons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          course_id: selectedCourse.id,
          title: newLessonData.title,
          overview: newLessonData.description,
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setNewLessonData({ title: "", description: "" });
        await fetchLessons(selectedCourse.id);
        alert("Thêm bài học thành công!");
      } else {
        const err = await res.json();
        alert(`Lỗi: ${err.message || "Không thể tạo bài học"}`);
      }
    } catch (error) {
      alert("Đã xảy ra lỗi khi kết nối server.");
    } finally {
        setActionLoading(false);
        isSubmittingRef.current = false;
    }
  };

  // --- 4. Ẩn/Hiện bài học ---
  const handleToggleStatus = async (e: React.MouseEvent, lesson: Lesson) => {
    e.stopPropagation();
    if (actionLoading || isSubmittingRef.current) return;

    const isPublished = lesson.status === "published";
    const action = isPublished ? "hide" : "show";
    
    if (!confirm(isPublished ? `Ẩn bài học "${lesson.title}"?` : `Hiện bài học "${lesson.title}"?`)) return;

    isSubmittingRef.current = true;
    setActionLoading(true);

    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/lessons/${lesson.id}/${action}`, {
            method: "PATCH",
            headers: { Authorization: token ? `Bearer ${token}` : "" }
        });

        if (res.ok) {
            await fetchLessons(selectedCourse.id);
        } else {
            alert("Lỗi cập nhật trạng thái");
        }
    } catch (error) {
        alert("Lỗi kết nối server");
    } finally {
        setActionLoading(false);
        isSubmittingRef.current = false;
    }
  };

  // --- 5. Xóa bài học ---
  const handleDeleteLesson = async (e: React.MouseEvent, id: number) => {
      e.stopPropagation();
      if (!confirm("CẢNH BÁO: Bạn có chắc chắn muốn xóa bài học này không?")) return;
      
      if (actionLoading || isSubmittingRef.current) return;
      isSubmittingRef.current = true;
      setActionLoading(true);
      
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/lessons/${id}`, {
            method: "DELETE",
            headers: { Authorization: token ? `Bearer ${token}` : "" }
        });

        if (res.ok) {
            await fetchLessons(selectedCourse.id);
        } else {
            alert("Lỗi khi xóa bài học");
        }
      } catch (error) {
        alert("Lỗi kết nối server");
      } finally {
        setActionLoading(false);
        isSubmittingRef.current = false;
      }
  };

  // --- 6. Sửa bài học ---
  const openEditModal = (e: React.MouseEvent, lesson: Lesson) => {
      e.stopPropagation();
      setEditingLessonData({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description || "",
      });
      setShowEditModal(true);
  };

  const handleUpdateLesson = async (e: React.FormEvent) => {
      e.preventDefault();
      if (actionLoading || isSubmittingRef.current) return;

      isSubmittingRef.current = true;
      setActionLoading(true);

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/lessons/${editingLessonData.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
            body: JSON.stringify({
                title: editingLessonData.title,
                overview: editingLessonData.description
            })
        });

        if (res.ok) {
            setShowEditModal(false);
            await fetchLessons(selectedCourse.id);
            alert("Cập nhật thành công!");
        } else {
            const err = await res.json();
            alert(`Lỗi: ${err.message || "Không thể cập nhật bài học"}`);
        }
      } catch (error) {
          alert("Lỗi kết nối server");
      } finally {
          setActionLoading(false);
          isSubmittingRef.current = false;
      }
  };

  // --- 7. SẮP XẾP NHANH (MỚI) ---
  const openSortModal = () => {
      // Sao chép lessons hiện tại vào state tạm để chỉnh sửa
      const data = lessons.map(l => ({
          id: l.id,
          title: l.title,
          sort_order: l.sort_order || 0
      })).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      
      setSortData(data);
      setShowSortModal(true);
  };

  const handleBulkSort = async () => {
      if (actionLoading || isSubmittingRef.current) return;
      isSubmittingRef.current = true;
      setActionLoading(true);

      try {
          const token = localStorage.getItem("token");
          
          // Gửi song song nhiều request update
          const updatePromises = sortData.map(item => 
              fetch(`${API_BASE}/api/lessons/${item.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
                  body: JSON.stringify({ sort_order: Number(item.sort_order) })
              })
          );

          await Promise.all(updatePromises);
          
          setShowSortModal(false);
          await fetchLessons(selectedCourse.id);
          alert("Đã cập nhật thứ tự thành công!");

      } catch (error) {
          console.error(error);
          alert("Có lỗi xảy ra khi cập nhật thứ tự.");
      } finally {
          setActionLoading(false);
          isSubmittingRef.current = false;
      }
  };

  const handleSortInputChange = (id: number, newValue: string) => {
      setSortData(prev => prev.map(item => 
          item.id === id ? { ...item, sort_order: Number(newValue) } : item
      ));
  };

  // --- Logic Hiển thị ---
  const processedLessons = lessons
    .filter(l => (l.title || l.name || "").toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => (a.sort_order || 9999) - (b.sort_order || 9999) || (a.id - b.id));

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#0f061a] to-[#1a0b2e] text-white font-sans">
      <style>{customStyles}</style>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#9c00e5]/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#3c90ff]/20 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
      </div>

      <HeaderAdmin />

      <main className="flex-1 p-6 md:p-10 relative z-10 page-enter-right">
        <div className="container mx-auto max-w-7xl">
          
          <div className="flex flex-col gap-6 mb-10">
            {/* ... (Header & Filter giữ nguyên) ... */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-gradient-to-br from-[#9c00e5] to-[#ff7c7c] p-3 rounded-lg shadow-lg shadow-[#9c00e5]/40">
                  <BookOpenIcon className="w-6 h-6 text-white" />
                </span>
                <div>
                  <h1 className="text-4xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Quản lý bài học</h1>
                  <p className="text-gray-400 text-sm mt-1">Chọn khóa học bên dưới để quản lý nội dung.</p>
                </div>
              </div>
            </div>

            {/* Filter - Giữ nguyên code filter ở đây */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl">
                {/* 1. Chọn Chương trình */}
                <div className="relative">
                    <label className="block text-xs font-bold text-gray-400 mb-1.5 ml-1 uppercase">1: Chọn Chương trình</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CubeIcon className="h-5 w-5 text-[#9c00e5]" /></div>
                        <select value={filterProgram} onChange={(e) => { const val = e.target.value === 'all' ? 'all' : Number(e.target.value); setFilterProgram(val); setSelectedCourse(null); }} className="w-full pl-10 pr-10 py-3 bg-[#1a0b2e] border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#9c00e5] transition-colors appearance-none cursor-pointer font-semibold">
                            <option value="all">Tất cả chương trình</option>
                            <option value={1}>Robotic Essential</option>
                            <option value={2}>Robotic Prime</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><ChevronDownIcon className="h-5 w-5 text-gray-500" /></div>
                    </div>
                </div>
                {/* 2. Lọc theo Mã */}
                <div className="relative">
                    <label className="block text-xs font-bold text-gray-400 mb-1.5 ml-1 uppercase">2: Lọc theo Mã</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FilterIcon className="h-5 w-5 text-[#3c90ff]" /></div>
                        <select value={filterCode} onChange={(e) => { setFilterCode(e.target.value); setSelectedCourse(null); }} className="w-full pl-10 pr-10 py-3 bg-[#1a0b2e] border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#3c90ff] transition-colors appearance-none cursor-pointer font-semibold">
                            <option value="all">Tất cả mã</option>
                            {availableCodes.map(code => <option key={code} value={code}>{code}</option>)}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><ChevronDownIcon className="h-5 w-5 text-gray-500" /></div>
                    </div>
                </div>
                {/* 3. Chọn Khóa học */}
                <div className="relative">
                    <label className="block text-xs font-bold text-gray-400 mb-1.5 ml-1 uppercase">3: Chọn Khóa học</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CollectionIcon className="h-5 w-5 text-[#ff7c7c]" /></div>
                        <select value={selectedCourse?.id || ""} onChange={(e) => { const course = courses.find((c) => c.id?.toString() === e.target.value); setSelectedCourse(course || null); setSearchTerm(""); }} className="w-full pl-10 pr-10 py-3 bg-[#1a0b2e] border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#ff7c7c] transition-colors appearance-none cursor-pointer font-bold shadow-inner">
                            <option value="" className="text-gray-500">-- Chọn khóa học --</option>
                            {filteredCourseOptions.map((c) => <option key={c.id} value={c.id}>{c.name || c.title}</option>)}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><ChevronDownIcon className="h-5 w-5 text-gray-500" /></div>
                    </div>
                </div>
            </div>
          </div>

          {!selectedCourse ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-white/10 rounded-3xl border-dashed backdrop-blur-sm animate-slide-in">
              <div className="p-6 bg-[#9c00e5]/10 rounded-full mb-6 animate-bounce">
                <BookOpenIcon className="w-16 h-16 text-[#9c00e5]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Chưa chọn khóa học</h3>
              <p className="text-gray-400 text-center max-w-md">Vui lòng sử dụng bộ lọc ở trên để tìm và chọn khóa học bạn muốn quản lý.</p>
            </div>
          ) : !selectedLesson ? (
            /* --- LESSON LIST VIEW --- */
            <div className="space-y-6 animate-slide-in">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3">
                    <span className="text-white font-bold text-lg">Đang quản lý: <span className="text-[#9c00e5]">{selectedCourse.name}</span></span>
                    <span className="bg-white/10 px-2 py-1 rounded text-xs font-mono text-gray-300">{selectedCourse.derivedCode}</span>
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                    {/* NÚT SẮP XẾP NHANH (MỚI) */}
                    <button
                        onClick={openSortModal}
                        className="flex-1 sm:flex-none flex items-center gap-2 px-4 py-3 bg-blue-600/20 text-blue-400 border border-blue-600/30 hover:bg-blue-600/30 font-bold rounded-xl transition-all justify-center"
                    >
                        <SortAscendingIcon className="w-5 h-5" />
                        Sắp xếp nhanh
                    </button>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex-1 sm:flex-none flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#9c00e5] to-[#7c3aed] hover:from-[#b02be0] hover:to-[#8b5cf6] text-white font-bold rounded-xl shadow-lg shadow-[#9c00e5]/30 transform hover:-translate-y-0.5 transition-all justify-center"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Thêm bài học
                    </button>
                </div>
              </div>

              {loading ? (
                 <div className="text-center py-20 text-gray-400">Đang tải dữ liệu...</div>
              ) : lessons.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-gray-400 text-lg">Khóa học này chưa có bài học nào.</p>
                  <button onClick={() => setShowCreateModal(true)} className="mt-4 text-[#9c00e5] hover:text-white font-bold underline decoration-2 underline-offset-4 transition-colors">Tạo bài học đầu tiên ngay</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {processedLessons.map((lesson, idx) => (
                    <div
                      key={lesson.id}
                      onClick={() => { setSelectedLesson(lesson); setActiveTab(0); }}
                      className="group relative p-6 bg-[#1f1129]/80 backdrop-blur-md border border-white/10 rounded-2xl cursor-pointer transition-all duration-300 hover:bg-[#2a1635] hover:border-[#9c00e5]/50 hover:shadow-2xl hover:shadow-[#9c00e5]/20 hover:-translate-y-1 flex flex-col justify-between min-h-[220px]"
                    >
                      {/* ... (Phần hiển thị card bài học giữ nguyên) ... */}
                      <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#9c00e5]/20 text-[#9c00e5] font-bold text-sm group-hover:bg-[#9c00e5] group-hover:text-white transition-colors">
                              {lesson.sort_order || idx + 1}
                            </div>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lesson</span>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-bold border flex items-center gap-1 ${lesson.status === 'published' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                             {lesson.status === 'published' ? <CheckCircleIcon className="w-3 h-3"/> : <XCircleIcon className="w-3 h-3"/>}
                             {lesson.status === 'published' ? 'Hiện' : 'Ẩn'}
                          </div>
                      </div>

                      <div className="flex-1">
                          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-[#e0aaff] transition-colors">
                            <span className="text-[#9c00e5] mr-2">Bài {lesson.sort_order || idx + 1}:</span>
                            {lesson.title || lesson.name}
                          </h3>
                          <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                            {lesson.description || "Chưa có mô tả"}
                          </p>
                      </div>
                      
                      <div className="h-px w-full bg-white/5 mb-4 group-hover:bg-white/10 transition-colors"></div>

                      <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                         <button 
                            onClick={(e) => handleToggleStatus(e, lesson)} 
                            className={`p-2 rounded-lg border transition-all hover:scale-110 ${lesson.status === 'published' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20 hover:bg-gray-500/20'}`} 
                            title={lesson.status === 'published' ? "Ẩn bài học" : "Hiện bài học"}
                         >
                            {lesson.status === 'published' ? <EyeIcon className="w-4 h-4"/> : <EyeOffIcon className="w-4 h-4"/>}
                         </button>
                         <button 
                            onClick={(e) => openEditModal(e, lesson)} 
                            className="p-2 bg-yellow-500/10 text-yellow-400 rounded-lg border border-yellow-500/20 hover:bg-yellow-500/20 hover:scale-110 transition-all" 
                            title="Sửa"
                         >
                            <PencilIcon className="w-4 h-4"/>
                         </button>
                         <button 
                            onClick={(e) => handleDeleteLesson(e, lesson.id)} 
                            className="p-2 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20 hover:bg-red-500/20 hover:scale-110 transition-all" 
                            title="Xóa"
                         >
                            <TrashIcon className="w-4 h-4"/>
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* --- LESSON DETAIL VIEW --- */
            <div className="animate-slide-in">
              <button onClick={() => setSelectedLesson(null)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group px-4 py-2 rounded-lg hover:bg-white/5 w-fit">
                <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold">Quay lại danh sách</span>
              </button>

              <div className="bg-[#1f1129]/90 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-white/10 bg-gradient-to-r from-[#2a1635] to-[#1f1129]">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#9c00e5] to-[#ff7c7c] flex items-center justify-center shadow-lg shadow-[#9c00e5]/30">
                      <PencilIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-black text-white mb-1">
                          <span className="text-[#9c00e5] mr-3">Bài {processedLessons.findIndex(l => l.id === selectedLesson.id) + 1}:</span>
                          {selectedLesson.title || selectedLesson.name}
                      </h2>
                      <div className="flex items-center gap-3">
                         <span className={`px-2 py-0.5 rounded text-xs font-bold border ${selectedLesson.status === 'published' ? 'text-green-400 border-green-500/30' : 'text-gray-400 border-gray-500/30'}`}>
                            {selectedLesson.status === 'published' ? 'Đang hiện' : 'Đang ẩn'}
                         </span>
                         <p className="text-gray-400 text-sm">Chỉnh sửa nội dung chi tiết</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex overflow-x-auto border-b border-white/10 custom-scrollbar bg-black/20">
                  {TABS.map((tab, idx) => (
                    <button key={tab} onClick={() => setActiveTab(idx)} className={`flex-shrink-0 px-8 py-5 font-bold text-sm relative transition-all ${activeTab === idx ? "text-white" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"}`}>
                      {tab}
                      {activeTab === idx && <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#9c00e5] to-[#ff7c7c] rounded-t-full"></span>}
                    </button>
                  ))}
                </div>

                <div className="p-6 md:p-10 min-h-[500px] bg-[#150a24]/50">
                  <div className="max-w-5xl mx-auto">
                    {activeTab === 0 && <LessonObjectives lessonId={selectedLesson.id} />}
                    {activeTab === 1 && <LessonProductVideo lessonId={selectedLesson.id} />}
                    {activeTab === 2 && <LessonPresentation lessonId={selectedLesson.id} />}
                    {activeTab === 3 && <LessonSlides lessonId={selectedLesson.id} />}
                    {activeTab === 4 && <LessonContent lessonId={selectedLesson.id} />}
                    {activeTab === 5 && <LessonChallenge lessonId={selectedLesson.id} />}
                    {activeTab === 6 && <LessonQuiz lessonId={selectedLesson.id} />}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* --- CREATE MODAL --- */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => !actionLoading && !isSubmittingRef.current && setShowCreateModal(false)}></div>
          <div className="relative bg-[#1f1129] border border-[#9c00e5]/30 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden modal-enter ring-1 ring-white/10">
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><PlusIcon className="w-5 h-5 text-[#9c00e5]" /> Thêm bài học mới</h3>
              <button onClick={() => !actionLoading && setShowCreateModal(false)} className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"><XIcon className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleCreateLesson} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Tên bài học <span className="text-red-500">*</span></label>
                <input type="text" required value={newLessonData.title} onChange={(e) => setNewLessonData({ ...newLessonData, title: e.target.value })} placeholder="Ví dụ: Giới thiệu Robot" className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-[#9c00e5] focus:ring-1 focus:ring-[#9c00e5] focus:outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Mô tả ngắn</label>
                <textarea rows={4} value={newLessonData.description} onChange={(e) => setNewLessonData({ ...newLessonData, description: e.target.value })} placeholder="Mô tả nội dung chính..." className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-[#9c00e5] focus:ring-1 focus:ring-[#9c00e5] focus:outline-none transition-all resize-none" />
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setShowCreateModal(false)} disabled={actionLoading} className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-gray-300 font-bold hover:bg-white/5 transition-colors">Hủy bỏ</button>
                <button type="submit" disabled={actionLoading} className="flex-1 px-4 py-3 rounded-xl bg-[#9c00e5] hover:bg-[#8500c4] text-white font-bold shadow-lg shadow-[#9c00e5]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2">
                  {actionLoading ? "Đang tạo..." : "Tạo bài học"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL (SIMPLE) --- */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => !actionLoading && !isSubmittingRef.current && setShowEditModal(false)}></div>
          <div className="relative bg-[#1f1129] border border-yellow-500/30 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden modal-enter ring-1 ring-white/10">
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><PencilIcon className="w-5 h-5 text-yellow-500" /> Chỉnh sửa bài học</h3>
              <button onClick={() => !actionLoading && setShowEditModal(false)} className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"><XIcon className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleUpdateLesson} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Tên bài học <span className="text-red-500">*</span></label>
                <input type="text" required value={editingLessonData.title} onChange={(e) => setEditingLessonData({ ...editingLessonData, title: e.target.value })} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Mô tả ngắn</label>
                <textarea rows={4} value={editingLessonData.description} onChange={(e) => setEditingLessonData({ ...editingLessonData, description: e.target.value })} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none transition-all resize-none" />
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setShowEditModal(false)} disabled={actionLoading} className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-gray-300 font-bold hover:bg-white/5 transition-colors">Hủy bỏ</button>
                <button type="submit" disabled={actionLoading} className="flex-1 px-4 py-3 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-white font-bold shadow-lg shadow-yellow-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2">
                  {actionLoading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- SORT MODAL (MỚI - BẢNG SẮP XẾP NHANH) --- */}
      {showSortModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => !actionLoading && !isSubmittingRef.current && setShowSortModal(false)}></div>
          <div className="relative bg-[#1f1129] border border-blue-500/30 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden modal-enter ring-1 ring-white/10 flex flex-col max-h-[80vh]">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <SortAscendingIcon className="w-5 h-5 text-blue-500" /> Sắp xếp thứ tự bài học
              </h3>
              <button onClick={() => !actionLoading && setShowSortModal(false)} className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"><XIcon className="w-6 h-6" /></button>
            </div>
            
            {/* Table Area */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 text-gray-400 text-sm uppercase">
                            <th className="py-3 px-4">Tên bài học</th>
                            <th className="py-3 px-4 w-40 text-center">Thứ tự</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {sortData.map((item) => (
                            <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                <td className="py-3 px-4 text-white font-medium">{item.title}</td>
                                <td className="py-3 px-4 text-center">
                                    <input 
                                        type="number" 
                                        value={item.sort_order}
                                        onChange={(e) => handleSortInputChange(item.id, e.target.value)}
                                        className="w-20 text-center px-2 py-1 bg-black/30 border border-white/20 rounded-lg text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-white/10 bg-white/5 flex justify-end gap-3">
                <button 
                    onClick={() => setShowSortModal(false)} 
                    disabled={actionLoading}
                    className="px-6 py-2 rounded-xl border border-white/10 text-gray-300 font-bold hover:bg-white/5 transition-colors"
                >
                    Hủy bỏ
                </button>
                <button 
                    onClick={handleBulkSort} 
                    disabled={actionLoading}
                    className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {actionLoading ? "Đang lưu..." : "Lưu thứ tự"}
                </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}