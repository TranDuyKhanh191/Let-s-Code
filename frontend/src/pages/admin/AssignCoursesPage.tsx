import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  SearchIcon,
  TrashIcon,
  PencilIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  FilterIcon,
  ChevronDownIcon,
  XIcon,
  CheckIcon,
  LightningBoltIcon // Import thêm icon
} from "@heroicons/react/solid";
import "../../styles/admin.css";
import HeaderAdmin from "../../components/layout/HeaderAdmin";
import AssignmentModal from "../../components/admin/AssignmentModal";

// --- API Helper ---
const API_BASE = "http://localhost:3000";

// --- 1. CẬP NHẬT MODAL PENDING (THÊM NÚT DUYỆT NHANH) ---
interface PendingModalProps {
    open: boolean;
    onClose: () => void;
    assignments: any[];
    loading: boolean;
    onProcess: (id: number | string, action: 'active' | 'revoked') => void;
    // Thêm props xử lý tất cả
    onProcessAll: (action: 'active' | 'revoked') => void; 
    courses: any[];
}

const PendingModal: React.FC<PendingModalProps> = ({ open, onClose, assignments, loading, onProcess, onProcessAll, courses }) => {
    if (!open) return null;

    const getResourceName = (type: string, id: number | string) => {
        if (type === 'program') return `Chương trình ID: ${id}`;
        const found = courses.find(c => c.id == id);
        return found ? found.name : `Khóa học ID: ${id}`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-[#1f1129] border border-[#9c00e5]/20 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-slide-in">
                
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 rounded-t-2xl">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <ClockIcon className="w-6 h-6 text-yellow-400"/> Danh sách chờ duyệt ({assignments.length})
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <XIcon className="w-6 h-6"/>
                    </button>
                </div>

                {/* --- KHU VỰC NÚT XỬ LÝ NHANH --- */}
                {assignments.length > 0 && !loading && (
                    <div className="px-6 py-4 bg-white/[0.02] border-b border-white/5 flex gap-3">
                        <button 
                            onClick={() => onProcessAll('active')}
                            className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold shadow-lg shadow-green-900/20 transition-all flex justify-center items-center gap-2"
                        >
                            <LightningBoltIcon className="w-5 h-5 text-yellow-300" />
                            Duyệt nhanh tất cả ({assignments.length})
                        </button>
                        <button 
                            onClick={() => onProcessAll('revoked')}
                            className="flex-1 py-3 bg-red-600/80 hover:bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-900/20 transition-all flex justify-center items-center gap-2"
                        >
                            <TrashIcon className="w-5 h-5" />
                            Từ chối tất cả
                        </button>
                    </div>
                )}

                {/* List Items */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                             <svg className="animate-spin h-8 w-8 mb-4 text-[#9c00e5]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                             </svg>
                             Đang xử lý dữ liệu...
                        </div>
                    ) : assignments.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">Không có yêu cầu nào đang chờ.</p>
                    ) : (
                        assignments.map(item => (
                            <div key={item.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-white/10 transition-colors">
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <p className="font-bold text-white text-lg">{item.users?.full_name || "Unknown User"}</p>
                                        <span className="text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                    <p className="text-gray-400 text-sm">{item.users?.email}</p>
                                    <div className="mt-2 text-sm text-[#3c90ff] font-bold bg-[#3c90ff]/10 px-3 py-1 rounded-lg w-fit border border-[#3c90ff]/20">
                                        {getResourceName(item.resource_type, item.resource_id)}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => onProcess(item.id, 'revoked')}
                                        className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500 hover:text-white transition-all font-bold flex items-center gap-1">
                                        <XIcon className="w-4 h-4"/> Từ chối
                                    </button>
                                    <button 
                                        onClick={() => onProcess(item.id, 'active')}
                                        className="px-4 py-2 bg-green-500/10 text-green-500 border border-green-500/20 rounded-lg hover:bg-green-500 hover:text-white transition-all font-bold flex items-center gap-1">
                                        <CheckIcon className="w-4 h-4"/> Duyệt
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

// ... (Giữ nguyên phần customStyles và Interfaces Teacher, Course, Assignment, Toast) ...

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

interface Teacher {
  id: number | string;
  username: string;
  email: string;
  full_name: string;
  role: "admin" | "teacher";
}

interface Course {
  id: number | string;
  name: string;
  status: "draft" | "published" | "archived"; 
  category: string;
  age_group?: string;
  lesson_count?: number;
  program_id?: number;
}

interface Assignment {
  id: number | string;
  teacher_id: number | string;
  resource_type: "course" | "program";
  resource_id: number | string;
  status: "pending" | "active" | "revoked"; 
  start_at?: string;
  end_at?: string;
  created_at?: string;
  updated_at?: string;
  users?: {
    full_name: string;
    email: string;
  };
}

interface Toast {
  id: string | number;
  message: string;
  type: "success" | "error" | "info";
}

export default function AssignCoursesPage() {
  // ... (Giữ nguyên các state cũ) ...
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Assignment | null>(null);
  
  // Pending Modal States
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [pendingAssignments, setPendingAssignments] = useState<Assignment[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);

  const ITEMS_PER_PAGE = 8;

  // ... (Giữ nguyên các hàm helper: showToast, getCourseName, formatDate, fetchData, useEffect filter) ...
  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const getCourseName = (courseId: string | number) => {
    const course = courses.find(c => c.id?.toString() === courseId.toString());
    return course?.name || `ID: ${courseId}`;
  };

  const formatDate = (dateString?: string) => {
      if (!dateString) return "---";
      return new Date(dateString).toLocaleDateString('vi-VN');
  };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

      const assignRes = await fetch(`${API_BASE}/api/permissions`, { headers });
      const assignData = assignRes.ok ? await assignRes.json() : { assignments: [] };
      const rawAssignList = Array.isArray(assignData.assignments) ? assignData.assignments : [];
      const assignList = rawAssignList.filter((a: any) => ["active", "revoked", "pending"].includes(a.status));
      setAssignments(assignList);

      const teacherRes = await fetch(`${API_BASE}/api/users`, { headers });
      const teacherData = teacherRes.ok ? await teacherRes.json() : { users: [] };
      const teacherList = Array.isArray(teacherData.users) ? teacherData.users : [];
      setTeachers(teacherList.filter((t: any) => t.role === "teacher"));

      const [course1Res, course2Res] = await Promise.all([
        fetch(`${API_BASE}/api/courses/programs/1`, { headers }),
        fetch(`${API_BASE}/api/courses/programs/2`, { headers })
      ]);
      const list1 = course1Res.ok ? (await course1Res.json()).courses || [] : [];
      const list2 = course2Res.ok ? (await course2Res.json()).courses || [] : [];
      const allCourses = [...list1.map((c: any) => ({ ...c, program_id: 1 })), ...list2.map((c: any) => ({ ...c, program_id: 2 }))];
      
      const publishedCourses = allCourses.filter((c: any) => c.status === "published");
      setCourses(publishedCourses);

    } catch (error) { console.error(error); showToast("Lỗi khi tải dữ liệu", "error"); } 
    finally { setLoading(false); }
  };

  useEffect(() => {
    let result = assignments;
    if (filterStatus !== "all") result = result.filter(a => a.status === filterStatus);
    if (searchTerm) {
      result = result.filter(a => 
        (a.users?.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.users?.email || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredAssignments(result);
    setCurrentPage(1);
  }, [searchTerm, filterStatus, assignments]);

  const handleOpenCreate = () => { setEditingItem(null); setShowModal(true); };
  const handleOpenEdit = (assign: Assignment) => { setEditingItem(assign); setShowModal(true); };

  // ... (Giữ nguyên handleSaveAssignment, handleRevoke) ...
  const handleSaveAssignment = async (data: any) => {
    if (submitting) return;
    setSubmitting(true);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

    try {
      if (data.isEditing) {
        const response = await fetch(`${API_BASE}/api/permissions/status/${data.id}`, { method: "PATCH", headers, body: JSON.stringify({ status: data.status }) });
        if (response.ok) showToast("Cập nhật trạng thái thành công!", "success");
        else showToast("Lỗi cập nhật", "error");
      } else {
        if (!data.teacher_id || data.selectedCourses.length === 0) {
          showToast("Vui lòng chọn giáo viên và khóa học", "error");
          setSubmitting(false);
          return;
        }
        let successCount = 0;
        for (const courseId of data.selectedCourses) {
          const response = await fetch(`${API_BASE}/api/permissions/assign`, {
            method: "POST", headers, body: JSON.stringify({
              teacher_id: Number(data.teacher_id), resource_type: "course", resource_id: Number(courseId),
              start_at: data.start_at ? new Date(data.start_at).toISOString() : null,
              end_at: data.end_at ? new Date(data.end_at).toISOString() : null
            })
          });
          if (response.ok) successCount++;
        }
        showToast(`Đã giao thành công ${successCount} khóa học`, "success");
      }
      setShowModal(false);
      fetchData();
    } catch (error) { showToast("Có lỗi xảy ra", "error"); } 
    finally { setSubmitting(false); }
  };

  const handleRevoke = async (id: string | number) => {
    if (!confirm("Bạn có chắc chắn muốn hủy/thu hồi quyền khóa học này?")) return;
    try {
        const token = localStorage.getItem("token");
        await fetch(`${API_BASE}/api/permissions/status/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: "revoked" }) });
        showToast("Thu hồi thành công!", "success"); fetchData();
    } catch (e) { showToast("Lỗi hệ thống", "error"); }
  };

  // --- LOGIC PENDING & BULK ACTION ---
  const fetchPending = async () => {
      setLoadingPending(true);
      try {
          const token = localStorage.getItem("token");
          const res = await fetch(`${API_BASE}/api/permissions?status=pending`, { headers: { Authorization: `Bearer ${token}` } });
          const data = res.ok ? await res.json() : { assignments: [] };
          setPendingAssignments(Array.isArray(data.assignments) ? data.assignments : []);
      } catch (e) { showToast("Lỗi tải danh sách chờ", "error"); }
      finally { setLoadingPending(false); }
  };

  const handleQuickStatus = async (id: number | string, action: 'active' | 'revoked', silent = false) => {
      // Hàm này xử lý 1 item
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/permissions/status/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status: action })
      });
      return res.ok;
  };

  const handleProcessPending = async (id: number | string, action: 'active' | 'revoked') => {
      if(!confirm(action === 'active' ? "Duyệt yêu cầu này?" : "Từ chối yêu cầu này?")) return;
      const success = await handleQuickStatus(id, action);
      if(success) {
          showToast(action === 'active' ? "Đã duyệt!" : "Đã từ chối!", "success");
          setPendingAssignments(prev => prev.filter(p => p.id !== id));
          fetchData(); // Refresh background table
      } else {
          showToast("Lỗi xử lý", "error");
      }
  };

  // 2. LOGIC XỬ LÝ HÀNG LOẠT (BULK ACTION)
  const handleBulkProcess = async (action: 'active' | 'revoked') => {
      const label = action === 'active' ? "DUYỆT TẤT CẢ" : "TỪ CHỐI TẤT CẢ";
      if (!confirm(`Bạn có chắc chắn muốn ${label} ${pendingAssignments.length} yêu cầu này không?`)) return;

      setLoadingPending(true); // Hiển thị loading xoay vòng
      const token = localStorage.getItem("token");
      let successCount = 0;

      try {
          // Dùng Promise.all để chạy song song cho nhanh (hoặc có thể chạy tuần tự nếu sợ overload server)
          const promises = pendingAssignments.map(async (item) => {
             const res = await fetch(`${API_BASE}/api/permissions/status/${item.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ status: action })
              });
              if(res.ok) successCount++;
          });

          await Promise.all(promises);

          showToast(`Đã xử lý xong ${successCount}/${pendingAssignments.length} yêu cầu.`, "success");
          
          // Refresh lại hết dữ liệu
          await fetchData();
          await fetchPending();

      } catch (error) {
          console.error(error);
          showToast("Có lỗi xảy ra trong quá trình xử lý hàng loạt", "error");
      } finally {
          setLoadingPending(false);
      }
  };

  // ... (Giữ nguyên Stats và Pagination) ...
  const activeCount = assignments.filter(a => a.status === 'active').length;
  const revokedCount = assignments.filter(a => a.status === 'revoked').length;
  const totalPages = Math.ceil(filteredAssignments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentAssignments = filteredAssignments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#0f061a] to-[#1a0b2e] text-white font-sans">
      <style>{customStyles}</style>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#9c00e5]/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDuration: "8s" }}></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#3c90ff]/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDuration: "10s", animationDelay: "2s" }}></div>
      </div>

      <HeaderAdmin />

      <main className="flex-1 p-6 md:p-10 relative z-10 page-enter-right">
        {/* ... (Giữ nguyên phần Header, Stats, Filter, Table, Pagination) ... */}
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="p-2 bg-gradient-to-br from-[#9c00e5] to-[#ff7c7c] rounded-xl shadow-lg shadow-[#9c00e5]/30">
                  <ShieldCheckIcon className="w-6 h-6 text-white" />
                </span>
                <h1 className="text-3xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Phân quyền khóa học</h1>
              </div>
              <p className="text-gray-400 text-sm ml-12">Quản lý việc giao khóa học cho giáo viên.</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => { setShowPendingModal(true); fetchPending(); }} 
                className="px-5 py-2.5 bg-[#3c90ff]/20 text-[#3c90ff] border border-[#3c90ff]/30 rounded-xl font-bold hover:bg-[#3c90ff]/30 transition-all flex items-center gap-2"
              >
                 <ClockIcon className="w-5 h-5"/> Xử lý chờ
                 {pendingAssignments.length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingAssignments.length}</span>}
              </button>
              <button 
                onClick={handleOpenCreate} 
                className="px-5 py-2.5 bg-gradient-to-r from-[#9c00e5] to-[#ff7c7c] text-white rounded-xl font-bold shadow-lg hover:shadow-[#9c00e5]/40 hover:scale-105 transition-all flex items-center gap-2"
              >
                 <PlusIcon className="w-5 h-5"/> Giao khóa học
              </button>
            </div>
          </div>

           {/* ... Stats, Search, Table, Pagination (Giữ nguyên như cũ) ... */}
           {/* Tôi rút gọn đoạn này để tập trung vào logic mới, bạn giữ nguyên code hiển thị bảng cũ nhé */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                    <div className="flex justify-between">
                        <div><p className="text-gray-400 text-sm font-bold uppercase">Tổng giao dịch</p><h3 className="text-4xl font-black text-white mt-2">{assignments.length}</h3></div>
                        <div className="p-3 bg-[#9c00e5]/20 text-[#9c00e5] rounded-xl"><UserGroupIcon className="w-6 h-6"/></div>
                    </div>
                </div>
                <div className="p-6 bg-gradient-to-br from-[#4db933]/10 to-[#4c6343]/10 border border-[#4db933]/20 rounded-2xl">
                    <div className="flex justify-between">
                        <div><p className="text-gray-400 text-sm font-bold uppercase">Đang hoạt động</p><h3 className="text-4xl font-black text-[#4db933] mt-2">{activeCount}</h3></div>
                        <div className="p-3 bg-[#4db933]/20 text-[#4db933] rounded-xl"><CheckCircleIcon className="w-6 h-6"/></div>
                    </div>
                </div>
                <div className="p-6 bg-gradient-to-br from-[#eb3434]/10 to-[#ff7c7c]/10 border border-[#eb3434]/20 rounded-2xl">
                    <div className="flex justify-between">
                        <div><p className="text-gray-400 text-sm font-bold uppercase">Đã thu hồi</p><h3 className="text-4xl font-black text-[#eb3434] mt-2">{revokedCount}</h3></div>
                        <div className="p-3 bg-[#eb3434]/20 text-[#eb3434] rounded-xl"><TrashIcon className="w-6 h-6"/></div>
                    </div>
                </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4 mb-6 bg-[#1a0b2e]/50 p-4 rounded-2xl border border-white/5">
                <div className="relative flex-1">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                    <input className="w-full pl-12 p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#9c00e5] focus:outline-none" placeholder="Tìm kiếm giáo viên..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <div className="relative min-w-[200px]">
                    <FilterIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                    <select className="w-full pl-12 p-3 pr-10 bg-white/5 border border-white/10 rounded-xl text-white appearance-none cursor-pointer focus:border-[#9c00e5] focus:outline-none" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        <option value="all" className="bg-[#1a0b2e]">Tất cả trạng thái</option>
                        <option value="active" className="bg-[#1a0b2e]">Active</option>
                        <option value="pending" className="bg-[#1a0b2e]">Pending</option>
                        <option value="revoked" className="bg-[#1a0b2e]">Revoked</option>
                    </select>
                    <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/>
                </div>
           </div>
           <div className="overflow-hidden border border-[#9c00e5]/20 rounded-2xl bg-white/[0.02] shadow-2xl">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gradient-to-r from-[#2a1b3d] to-[#1f1428] text-gray-400 border-b border-[#9c00e5]/20 text-sm uppercase">
                  <th className="p-5 font-bold pl-6">Giáo viên</th>
                  <th className="p-5 font-bold">Email</th>
                  <th className="p-5 font-bold">Khóa học được giao</th>
                  <th className="p-5 font-bold">Ngày bắt đầu</th>
                  <th className="p-5 font-bold">Ngày kết thúc</th>
                  <th className="p-5 font-bold text-center">Trạng thái</th>
                  <th className="p-5 font-bold text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? <tr><td colSpan={7} className="p-12 text-center text-gray-400">Đang tải...</td></tr> : 
                 currentAssignments.map((assign, idx) => (
                    <tr key={assign.id} className="hover:bg-white/5 transition-all group animate-slide-in" style={{ animationDelay: `${idx * 50}ms` }}>
                      <td className="p-5 pl-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#9c00e5] to-[#ff7c7c] flex items-center justify-center font-bold text-white shadow-lg">
                                {assign.users?.full_name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <span className="font-bold text-white group-hover:text-[#9c00e5] transition-colors">{assign.users?.full_name || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="p-5 text-gray-300">{assign.users?.email}</td>
                      <td className="p-5 font-bold text-white">{getCourseName(assign.resource_id)}</td>
                      <td className="p-5 text-gray-300 font-mono text-sm">{formatDate(assign.start_at)}</td>
                      <td className="p-5 text-gray-300 font-mono text-sm">{formatDate(assign.end_at)}</td>
                      <td className="p-5 text-center">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                          assign.status === 'active' ? 'bg-[#4db933]/10 text-[#4db933] border-[#4db933]/20' :
                          assign.status === 'revoked' ? 'bg-[#eb3434]/10 text-[#eb3434] border-[#eb3434]/20' :
                          'bg-[#ffee00]/10 text-[#ffee00] border-[#ffee00]/20'
                        }`}>
                          {assign.status?.toUpperCase() || "ACTIVE"}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                            {assign.status === 'pending' ? (
                                <>
                                    <button onClick={() => handleProcessPending(assign.id, 'active')} className="p-2 bg-green-500/10 text-green-400 rounded-lg hover:scale-110 transition-all border border-green-500/20" title="Duyệt"><CheckIcon className="w-4 h-4"/></button>
                                    <button onClick={() => handleProcessPending(assign.id, 'revoked')} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:scale-110 transition-all border border-red-500/20" title="Từ chối"><XIcon className="w-4 h-4"/></button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => handleOpenEdit(assign)} className="p-2 bg-yellow-500/10 text-yellow-400 rounded-lg hover:scale-110 transition-all border border-yellow-500/20"><PencilIcon className="w-4 h-4"/></button>
                                    <button onClick={() => handleRevoke(assign.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:scale-110 transition-all border border-red-500/20"><TrashIcon className="w-4 h-4"/></button>
                                </>
                            )}
                        </div>
                      </td>
                    </tr>
                 ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
             <div className="flex justify-between items-center mt-6 px-4 bg-[#1a0b2e]/30 p-4 rounded-xl border border-white/5">
                <span className="text-sm text-gray-400">Hiển thị {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredAssignments.length)} / {filteredAssignments.length}</span>
                <div className="flex gap-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-50">Trước</button>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-50">Sau</button>
                </div>
             </div>
           )}

        </div>
      </main>

      <AssignmentModal 
        open={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSaveAssignment} 
        teachers={teachers}
        courses={courses}
        editingAssignment={editingItem}
        submitting={submitting}
        existingAssignments={assignments}
      />

      <PendingModal 
         open={showPendingModal}
         onClose={() => setShowPendingModal(false)}
         assignments={pendingAssignments}
         loading={loadingPending}
         onProcess={handleProcessPending}
         // TRUYỀN HÀM XỬ LÝ HÀNG LOẠT VÀO ĐÂY
         onProcessAll={handleBulkProcess}
         courses={courses}
      />

      <div className="fixed bottom-6 right-6 z-50 space-y-2">
        {toasts.map(t => (
            <div key={t.id} className={`px-6 py-3 rounded-xl font-bold shadow-lg animate-slide-in ${t.type === 'success' ? 'bg-[#4db933]' : t.type === 'error' ? 'bg-[#eb3434]' : 'bg-[#3c90ff]'}`}>
                {t.message}
            </div>
        ))}
      </div>
    </div>
  );
}