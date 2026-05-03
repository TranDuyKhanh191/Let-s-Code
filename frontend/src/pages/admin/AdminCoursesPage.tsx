import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  SearchIcon,
  TrashIcon,
  PencilIcon,
  FilterIcon,
  ChevronDownIcon,
  CollectionIcon,
  AcademicCapIcon,
  CubeIcon,
  LightningBoltIcon,
  EyeIcon,
  EyeOffIcon,
  CheckCircleIcon, 
  ArchiveIcon,  
  XCircleIcon
} from "@heroicons/react/solid";
import "../../styles/admin.css";
import HeaderAdmin from "../../components/layout/HeaderAdmin";
import CourseModal from "../../components/admin/CourseModal";
import CreateCourseModal from "../../components/admin/CreateCourseModal";

const customStyles = `
  @keyframes slideInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #9c00e5; border-radius: 3px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ff7c7c; }
  .animate-slide-in { animation: slideInUp 0.4s ease-out forwards; }
`;

const API_BASE = "http://localhost:3000";

interface Course {
  id: number | string;
  title: string;
  course_code: string; 
  program_id: number;
  categoryGroup: string;
  level: string;
  quantity: number;
  status?: string;
  createdAt?: string;
}

interface FormData {
  title: string;
  course_code: string;
  level: string;
  quantity: string;
  generalObjectives: string;
}

export default function AdminCoursesPage() {
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCode, setFilterCode] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    course_code: "REA",
    level: "",
    quantity: "",
    generalObjectives: ""
  });

  // --- FETCH DATA ---
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

      const [res1, res2] = await Promise.all([
        fetch(`${API_BASE}/api/courses/programs/1`, { headers }),
        fetch(`${API_BASE}/api/courses/programs/2`, { headers })
      ]);
      
      const data1 = res1.ok ? await res1.json() : { courses: [] };
      const data2 = res2.ok ? await res2.json() : { courses: [] };

      const allData = [
        ...(Array.isArray(data1.courses) ? data1.courses : []),
        ...(Array.isArray(data2.courses) ? data2.courses : [])
      ];

      const mappedCourses: Course[] = allData.map((item: any) => {
        const code = item.course_code || item.status || "REA";
        return {
          id: item.id,
          title: item.name,
          course_code: code,
          program_id: item.program_id,
          categoryGroup: item.program_id === 1 ? "Robotic Essential" : "Robotic Prime",
          level: item.age_group || "",
          quantity: item.lesson_count || 0,
          status: item.status, // published, archived, draft
          createdAt: item.created_at
        };
      });
      
      mappedCourses.sort((a, b) => {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });

      setCourses(mappedCourses);
      setFilteredCourses(mappedCourses);
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  // --- FILTER ---
  useEffect(() => {
    let result = courses;
    if (filterCode !== "all") {
      result = result.filter(c => c.course_code === filterCode);
    }
    if (searchTerm) {
      result = result.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    setFilteredCourses(result);
    setCurrentPage(1);
  }, [searchTerm, filterCode, courses]);

  // --- HANDLE SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse && !showCreateModal) return;

    const code = formData.course_code;
    const programId = code.startsWith("RE") ? 1 : 2;

    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

      const updateData = {
          name: formData.title,
          course_code: code,
          program_id: programId,
          age_group: formData.level,
          lesson_count: Number(formData.quantity) || 0,
          general_objectives: formData.generalObjectives
      };

      if (editingCourse) {
        const res = await fetch(`${API_BASE}/api/courses/${editingCourse.id}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify(updateData)
        });
        if (res.ok) {
            alert("Cập nhật thành công!");
            fetchCourses();
            setShowModal(false);
        } else {
            alert("Lỗi cập nhật");
        }
      } 
    } catch (err) { alert("Lỗi kết nối"); }
  };

  const handleToggleStatus = async (c: Course) => {
    const isPublished = c.status === "published";
    const action = isPublished ? "hide" : "show";
    const confirmMessage = isPublished 
      ? `Bạn muốn ẩn khóa học "${c.title}"? Học viên sẽ không thấy khóa này nữa.` 
      : `Bạn muốn công khai khóa học "${c.title}"?`;

    if (!confirm(confirmMessage)) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/courses/${c.id}/${action}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        }
      });

      if (res.ok) {
        fetchCourses();
      } else {
        const err = await res.json();
        alert(`Lỗi: ${err.error}`);
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      alert("Không thể kết nối đến server.");
    }
  };

  const handleEdit = (c: Course) => {
    setEditingCourse(c);
    setFormData({
      title: c.title,
      course_code: c.course_code,
      level: c.level, 
      quantity: c.quantity.toString(),
      generalObjectives: ""
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number | string) => {
    if(!confirm("Bạn có chắc chắn muốn xóa khóa học này?")) return;
    const token = localStorage.getItem("token");
    await fetch(`${API_BASE}/api/courses/${id}`, { method: "DELETE", headers: {Authorization: `Bearer ${token}`} });
    fetchCourses();
  };

  const handleInputChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ title: "", course_code: "REA", level: "", quantity: "", generalObjectives: "" });
    setEditingCourse(null);
  };

  // --- STATS CALCULATION ---
  const totalCourses = courses.length;
  const essentialCount = courses.filter(c => c.program_id === 1).length;
  const primeCount = courses.filter(c => c.program_id === 2).length;
  // Tính toán số lượng khả dụng và ẩn
  const publishedCount = courses.filter(c => c.status === "published").length;
  const hiddenCount = courses.filter(c => c.status === "archived").length;

  // --- PAGINATION ---
  const ITEMS_PER_PAGE = 8;
  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentCourses = filteredCourses.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#0f061a] to-[#1a0b2e] text-white font-sans">
      <style>{customStyles}</style>
      
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#9c00e5]/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDuration: "8s" }}></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#3c90ff]/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDuration: "10s", animationDelay: "2s" }}></div>
      </div>

      <HeaderAdmin />
      
      <CreateCourseModal open={showCreateModal} onClose={() => setShowCreateModal(false)} onSuccess={fetchCourses} />
      <CourseModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        formData={formData}
        onInputChange={handleInputChange}
        editingCourse={editingCourse}
        resetForm={resetForm}
      />

      <main className="flex-1 p-6 md:p-10 relative z-10 page-enter-right">
        <div className="container mx-auto max-w-7xl">
           
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="p-2 bg-gradient-to-br from-[#9c00e5] to-[#ff7c7c] rounded-xl shadow-lg shadow-[#9c00e5]/30">
                            <CollectionIcon className="w-6 h-6 text-white" />
                        </span>
                        <h1 className="text-3xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                            Quản lý khóa học
                        </h1>
                    </div>
                    <p className="text-gray-400 text-sm ml-12">Quản lý danh sách, nội dung và cấp độ khóa học.</p>
                </div>
                <button 
                    onClick={() => setShowCreateModal(true)} 
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#9c00e5] to-[#ff7c7c] hover:from-[#ff7c7c] hover:to-[#9c00e5] rounded-xl font-bold shadow-lg shadow-[#9c00e5]/40 transition-all hover:scale-105 active:scale-95"
                >
                    <PlusIcon className="w-5 h-5" /> Thêm khóa học
                </button>
           </div>

           {/* --- STATS CARDS (GRID 5 CỘT) --- */}
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                {/* Card 1: Total */}
                <div className="p-5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-colors">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Tổng khóa học</p>
                            <h3 className="text-3xl font-black text-white mt-1">{totalCourses}</h3>
                        </div>
                        <div className="p-2 bg-[#9c00e5]/20 text-[#9c00e5] rounded-lg">
                            <CollectionIcon className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Card 2: Essential */}
                <div className="p-5 bg-gradient-to-br from-[#ff7c7c]/10 to-[#ff7c7c]/5 border border-[#ff7c7c]/20 rounded-2xl backdrop-blur-sm hover:border-[#ff7c7c]/40 transition-colors">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Robotic Essential</p>
                            <h3 className="text-3xl font-black text-[#ff7c7c] mt-1">{essentialCount}</h3>
                        </div>
                        <div className="p-2 bg-[#ff7c7c]/20 text-[#ff7c7c] rounded-lg">
                            <CubeIcon className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Card 3: Prime */}
                <div className="p-5 bg-gradient-to-br from-[#3c90ff]/10 to-[#3c90ff]/5 border border-[#3c90ff]/20 rounded-2xl backdrop-blur-sm hover:border-[#3c90ff]/40 transition-colors">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Robotic Prime</p>
                            <h3 className="text-3xl font-black text-[#3c90ff] mt-1">{primeCount}</h3>
                        </div>
                        <div className="p-2 bg-[#3c90ff]/20 text-[#3c90ff] rounded-lg">
                            <LightningBoltIcon className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Card 4: Published (KHẢ DỤNG - MỚI) */}
                <div className="p-5 bg-gradient-to-br from-[#4db933]/10 to-[#4db933]/5 border border-[#4db933]/20 rounded-2xl backdrop-blur-sm hover:border-[#4db933]/40 transition-colors">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Khóa học khả dụng</p>
                            <h3 className="text-3xl font-black text-[#4db933] mt-1">{publishedCount}</h3>
                        </div>
                        <div className="p-2 bg-[#4db933]/20 text-[#4db933] rounded-lg">
                            <CheckCircleIcon className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Card 5: Hidden (BỊ ẨN) */}
                <div className="p-5 bg-white/5 border border-gray-600/30 rounded-2xl backdrop-blur-sm hover:border-gray-500/50 transition-colors">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Khóa học bị ẩn</p>
                            <h3 className="text-3xl font-black text-gray-300 mt-1">{hiddenCount}</h3>
                        </div>
                        <div className="p-2 bg-gray-500/20 text-gray-400 rounded-lg">
                            <ArchiveIcon className="w-5 h-5" />
                        </div>
                    </div>
                </div>
           </div>

           {/* --- SEARCH & FILTER --- */}
           <div className="flex flex-col md:flex-row gap-4 mb-6 bg-[#1a0b2e]/50 p-4 rounded-2xl border border-white/5 shadow-inner">
                <div className="relative flex-1">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                    <input 
                        className="w-full pl-12 p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#9c00e5] focus:ring-1 focus:ring-[#9c00e5] focus:outline-none transition-all placeholder-gray-500" 
                        placeholder="Tìm kiếm theo tên khóa học..." 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                    />
                </div>
                <div className="relative min-w-[200px]">
                    <FilterIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                    <select 
                        className="w-full pl-12 p-3 pr-10 bg-white/5 border border-white/10 rounded-xl text-white appearance-none cursor-pointer focus:border-[#9c00e5] focus:ring-1 focus:ring-[#9c00e5] focus:outline-none transition-all font-medium"
                        value={filterCode}
                        onChange={e => setFilterCode(e.target.value)}
                    >
                        <option value="all" className="bg-[#1a0b2e]">Tất cả mã</option>
                        <optgroup label="Essential" className="bg-[#1a0b2e]">
                            {["REA","REAX","REB","REBX","REC","RECX"].map(c => <option key={c} value={c}>{c}</option>)}
                        </optgroup>
                        <optgroup label="Prime" className="bg-[#1a0b2e]">
                            {["RPA","RPAX","RPB","RPBX","RPC","RPCX"].map(c => <option key={c} value={c}>{c}</option>)}
                        </optgroup>
                    </select>
                    <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/>
                </div>
           </div>

           {/* --- TABLE --- */}
           <div className="overflow-hidden border border-[#9c00e5]/20 rounded-2xl bg-white/[0.02] shadow-2xl">
               <table className="w-full text-left">
                   <thead>
                       <tr className="bg-gradient-to-r from-[#2a1b3d] to-[#1f1428] text-gray-400 border-b border-[#9c00e5]/20 text-sm uppercase tracking-wider">
                           <th className="p-5 font-bold">Tên khóa học</th>
                           <th className="p-5 font-bold">Mã</th>
                           <th className="p-5 font-bold">Chương trình</th>
                           <th className="p-5 font-bold">Độ tuổi / Level</th>
                           <th className="p-5 font-bold text-center">Trạng thái</th>
                           <th className="p-5 font-bold text-center">Bài học</th>
                           <th className="p-5 font-bold text-center">Hành động</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                       {loading ? (
                           <tr><td colSpan={7} className="p-12 text-center text-gray-400 italic">Đang tải dữ liệu...</td></tr>
                       ) : currentCourses.length === 0 ? (
                           <tr><td colSpan={7} className="p-12 text-center text-gray-400">
                               <div className="flex flex-col items-center">
                                   <CollectionIcon className="w-12 h-12 text-gray-600 mb-2"/>
                                   <span>Không tìm thấy khóa học nào</span>
                               </div>
                           </td></tr>
                       ) : (
                           currentCourses.map((c, idx) => (
                               <tr 
                                 key={c.id} 
                                 className="hover:bg-white/5 transition-all duration-200 group animate-slide-in"
                                 style={{ animationDelay: `${idx * 50}ms` }}
                               >
                                   <td className="p-5 font-bold text-white group-hover:text-[#9c00e5] transition-colors">{c.title}</td>
                                   <td className="p-5">
                                       <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                                            c.categoryGroup === 'Robotic Essential' 
                                            ? 'bg-[#9c00e5]/10 text-[#ff7c7c] border-[#ff7c7c]/20' 
                                            : 'bg-[#3c90ff]/10 text-[#3c90ff] border-[#3c90ff]/20'
                                       }`}>
                                            {c.course_code}
                                       </span>
                                   </td>
                                   <td className="p-5 text-gray-400 text-sm">{c.categoryGroup}</td>
                                   <td className="p-5 text-gray-300 font-medium">
                                       <span className="flex items-center gap-2">
                                           <AcademicCapIcon className="w-4 h-4 text-gray-500"/>
                                           {c.level || "---"}
                                       </span>
                                   </td>

                                   {/* STATUS CELL */}
                                   <td className="p-5 text-center">
                                       {c.status === "published" ? (
                                           <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-bold">
                                               <CheckCircleIcon className="w-3 h-3" /> Hiện
                                           </span>
                                       ) : (
                                           <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-500/20 text-gray-400 border border-gray-500/30 text-xs font-bold">
                                               <XCircleIcon className="w-3 h-3" /> Ẩn
                                           </span>
                                       )}
                                   </td>

                                   <td className="p-5 text-center">
                                       <span className="inline-block min-w-[30px] py-1 px-2 rounded bg-white/10 text-white font-bold text-xs">
                                           {c.quantity}
                                       </span>
                                   </td>
                                   
                                   {/* ACTION BUTTONS */}
                                   <td className="p-5">
                                       <div className="flex justify-center gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                                           
                                           <button 
                                                onClick={
                                                  () => handleToggleStatus(c)
                                                } 
                                                className={`p-2 rounded-lg border transition-all shadow-lg hover:scale-110 ${
                                                    c.status === 'published' 
                                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20' 
                                                    : 'bg-gray-500/10 text-gray-400 border-gray-500/20 hover:bg-gray-500/20'
                                                }`}
                                                title={c.status === 'published' ? "Ẩn khóa học" : "Hiện khóa học"}
                                           >
                                               {c.status === 'published' ? <EyeIcon className="w-4 h-4"/> : <EyeOffIcon className="w-4 h-4"/>}
                                           </button>

                                           <button 
                                                onClick={
                                                  () => handleEdit(c)
                                                } 
                                                className="p-2 bg-yellow-500/10 text-yellow-400 rounded-lg border border-yellow-500/20 hover:bg-yellow-500/20 hover:scale-110 transition-all shadow-lg" 
                                                title="Chỉnh sửa"
                                           >
                                               <PencilIcon className="w-4 h-4"/>
                                           </button>
                                           
                                           <button 
                                                onClick={
                                                  () => handleDelete(c.id)
                                                } 
                                                className="p-2 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20 hover:bg-red-500/20 hover:scale-110 transition-all shadow-lg" 
                                                title="Xóa"
                                           >
                                               <TrashIcon className="w-4 h-4"/>
                                           </button>
                                       </div>
                                   </td>
                               </tr>
                           ))
                       )}
                   </tbody>
               </table>
           </div>
           
           {/* --- PAGINATION --- */}
           {totalPages > 1 && (
             <div className="flex justify-between items-center
              mt-6 px-4 bg-[#1a0b2e]/30 p-4 
              rounded-xl border border-white/5">
                <span className="text-sm text-gray-400 font-medium">
                    Hiển thị {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredCourses.length)} trong tổng số {filteredCourses.length}
                </span>
                <div className="flex gap-2">
                    <button 
                        onClick={
                          () => setCurrentPage(
                            p => Math.max(1, p - 1)
                          )
                        }
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-white/5 border border-white/10 
                        rounded-lg hover:bg-white/10 disabled:opacity-50 
                        isabled:cursor-not-allowed transition-all font-bold text-sm"
                    >Trước</button>
                    {Array.from({length: totalPages}, (_, i) => i + 1).map(p => (
                        <button 
                            key={p} 
                            onClick={
                              () => setCurrentPage(p)
                            }
                            className={`w-9 h-9 rounded-lg font-bold text-sm transition-all ${
                                currentPage === p 
                                ? 'bg-gradient-to-r from-[#9c00e5] to-[#ff7c7c] text-white shadow-lg shadow-[#9c00e5]/30' 
                                : 'bg-white/5 hover:bg-white/10 border border-white/10'
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                    <button 
                        onClick={
                          () => setCurrentPage(
                            p => Math.min(totalPages, p + 1)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-white/5 border 
                        border-white/10 rounded-lg 
                        hover:bg-white/10 disabled:opacity-50 
                        disabled:cursor-not-allowed 
                        transition-all font-bold text-sm"
                    >Sau</button>
                </div>
             </div>
           )}
        </div>
      </main>
    </div>
  );
}

