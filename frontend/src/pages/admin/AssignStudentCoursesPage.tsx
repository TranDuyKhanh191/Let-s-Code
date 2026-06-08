import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  SearchIcon,
  TrashIcon,
  PencilIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  CheckCircleIcon,
  FilterIcon,
  ChevronDownIcon
} from "@heroicons/react/solid";
import "../../styles/admin.css";
import HeaderAdmin from "../../components/layout/HeaderAdmin";
import EnrollmentModal from "../../components/admin/EnrollmentModal";

const API_BASE = "http://localhost:3000";

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

interface Toast {
  id: string | number;
  message: string;
  type: "success" | "error" | "info";
}

export default function AssignStudentCoursesPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch Students
      const usersRes = await fetch(`${API_BASE}/api/users`, { headers });
      const usersData = await usersRes.json();
      const st = usersData.users.filter((u: any) => u.role === "student" && u.is_active !== false);

      // 2. Fetch Courses
      const [course1Res, course2Res] = await Promise.all([
        fetch(`${API_BASE}/api/courses/programs/1`, { headers }),
        fetch(`${API_BASE}/api/courses/programs/2`, { headers })
      ]);
      const list1 = course1Res.ok ? (await course1Res.json()).courses || [] : [];
      const list2 = course2Res.ok ? (await course2Res.json()).courses || [] : [];
      const allCourses = [...list1.map((c: any) => ({ ...c, program_id: 1 })), ...list2.map((c: any) => ({ ...c, program_id: 2 }))];
      const publishedCourses = allCourses.filter(c => c.status === "published");

      // 3. Fetch Enrollments
      const enrRes = await fetch(`${API_BASE}/api/enrollments`, { headers });
      const enrData = await enrRes.json();

      setStudents(st || []);
      setCourses(publishedCourses || []);
      setEnrollments(enrData.enrollments || []);
    } catch (err) {
      console.error("Lỗi fetch dữ liệu:", err);
      showToast("Lỗi fetch dữ liệu", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = enrollments;
    if (filterStatus !== "all") {
      result = result.filter(e => e.status === filterStatus);
    }
    if (searchTerm) {
      result = result.filter(e => {
        const student = students.find(s => s.id === e.student_id);
        if (!student) return false;
        return student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
               student.email.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
    setFilteredEnrollments(result);
    setCurrentPage(1);
  }, [searchTerm, filterStatus, enrollments, students]);

  const handleOpenModal = (enrollment?: any) => {
    setEditingEnrollment(enrollment || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEnrollment(null);
  };

  const handleSubmitEnrollment = async (data: any) => {
    if (submitting) return;
    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      const headers = { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` 
      };

      if (data.isEditing) {
        const payload = { 
            status: data.status,
            start_at: data.start_at || null,
            end_at: data.end_at || null
        };
        const response = await fetch(`${API_BASE}/api/enrollments/${data.id}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify(payload)
        });
        if (response.ok) showToast("Cập nhật quyền thành công!", "success");
        else showToast("Lỗi cập nhật", "error");
      } else {
        if (!data.student_id || data.selectedCourses.length === 0) {
          showToast("Vui lòng chọn học sinh và khóa học", "error");
          setSubmitting(false);
          return;
        }
        let successCount = 0;
        for (const cid of data.selectedCourses) {
          const response = await fetch(`${API_BASE}/api/enrollments/assign`, {
            method: "POST",
            headers,
            body: JSON.stringify({
              student_id: Number(data.student_id),
              course_id: Number(cid),
              start_at: data.start_at || null,
              end_at: data.end_at || null
            })
          });
          if (response.ok) successCount++;
        }
        showToast(`Đã giao thành công ${successCount} khóa học`, "success");
      }
      
      fetchData();
      handleCloseModal();
    } catch (err) {
      console.error(err);
      showToast("Lỗi khi xử lý", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (enrollment: any) => {
    if (!confirm("Bạn có chắc chắn muốn hủy/thu hồi quyền khóa học này?")) return;
    try {
        const token = localStorage.getItem("token");
        await fetch(`${API_BASE}/api/enrollments/revoke`, { 
            method: "PATCH", 
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, 
            body: JSON.stringify({ student_id: enrollment.student_id, course_id: enrollment.course_id }) 
        });
        showToast("Thu hồi thành công!", "success"); 
        fetchData();
    } catch (e) { 
        showToast("Lỗi hệ thống", "error"); 
    }
  };

  const activeCount = enrollments.filter(a => a.status === 'active').length;
  const revokedCount = enrollments.filter(a => a.status === 'revoked').length;
  const totalPages = Math.ceil(filteredEnrollments.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentEnrollments = filteredEnrollments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const formatDate = (dateString?: string) => {
      if (!dateString) return "---";
      return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#0f061a] to-[#1a0b2e] text-white font-sans">
      <style>{customStyles}</style>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#9c00e5]/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDuration: "8s" }}></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#3c90ff]/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDuration: "10s", animationDelay: "2s" }}></div>
      </div>

      <HeaderAdmin />

      <main className="flex-1 p-6 md:p-10 relative z-10 page-enter-right">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="p-2 bg-gradient-to-br from-[#9c00e5] to-[#ff7c7c] rounded-xl shadow-lg shadow-[#9c00e5]/30">
                  <ShieldCheckIcon className="w-6 h-6 text-white" />
                </span>
                <h1 className="text-3xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Phân quyền học sinh</h1>
              </div>
              <p className="text-gray-400 text-sm ml-12">Quản lý và cấp quyền truy cập khóa học cho học sinh.</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => handleOpenModal()} 
                className="px-5 py-2.5 bg-gradient-to-r from-[#9c00e5] to-[#ff7c7c] text-white rounded-xl font-bold shadow-lg hover:shadow-[#9c00e5]/40 hover:scale-105 transition-all flex items-center gap-2"
              >
                 <PlusIcon className="w-5 h-5"/> Giao khóa học
              </button>
            </div>
          </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                    <div className="flex justify-between">
                        <div><p className="text-gray-400 text-sm font-bold uppercase">Tổng giao dịch</p><h3 className="text-4xl font-black text-white mt-2">{enrollments.length}</h3></div>
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
                    <input className="w-full pl-12 p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#9c00e5] focus:outline-none" placeholder="Tìm kiếm học sinh theo tên hoặc email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <div className="relative min-w-[200px]">
                    <FilterIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                    <select className="w-full pl-12 p-3 pr-10 bg-white/5 border border-white/10 rounded-xl text-white appearance-none cursor-pointer focus:border-[#9c00e5] focus:outline-none" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        <option value="all" className="bg-[#1a0b2e]">Tất cả trạng thái</option>
                        <option value="active" className="bg-[#1a0b2e]">Active</option>
                        <option value="revoked" className="bg-[#1a0b2e]">Revoked</option>
                    </select>
                    <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/>
                </div>
           </div>

           <div className="overflow-hidden border border-[#9c00e5]/20 rounded-2xl bg-white/[0.02] shadow-2xl">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gradient-to-r from-[#2a1b3d] to-[#1f1428] text-gray-400 border-b border-[#9c00e5]/20 text-sm uppercase">
                  <th className="p-5 font-bold pl-6">Học sinh</th>
                  <th className="p-5 font-bold">Email</th>
                  <th className="p-5 font-bold">Khóa học được giao</th>
                  <th className="p-5 font-bold">Ngày giao</th>
                  <th className="p-5 font-bold">Thời hạn</th>
                  <th className="p-5 font-bold text-center">Trạng thái</th>
                  <th className="p-5 font-bold text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? <tr><td colSpan={7} className="p-12 text-center text-gray-400">Đang tải...</td></tr> : 
                 currentEnrollments.length === 0 ? <tr><td colSpan={7} className="p-12 text-center text-gray-400">Không tìm thấy dữ liệu.</td></tr> :
                 currentEnrollments.map((enr, idx) => {
                    const student = students.find(s => s.id === enr.student_id);
                    const course = courses.find(c => c.id === enr.course_id);
                    return (
                    <tr key={enr.id} className="hover:bg-white/5 transition-all group animate-slide-in" style={{ animationDelay: `${idx * 50}ms` }}>
                      <td className="p-5 pl-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#9c00e5] to-[#ff7c7c] flex items-center justify-center font-bold text-white shadow-lg">
                                {student?.full_name?.charAt(0).toUpperCase() || "S"}
                            </div>
                            <span className="font-bold text-white group-hover:text-[#9c00e5] transition-colors">{student?.full_name || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="p-5 text-gray-300">{student?.email}</td>
                      <td className="p-5 font-bold text-white">{course?.name || `ID: ${enr.course_id}`}</td>
                      <td className="p-5 text-gray-300 font-mono text-sm">{formatDate(enr.created_at || enr.enrolled_at)}</td>
                      <td className="p-5 text-gray-300 text-sm">
                        <div className="flex flex-col gap-1">
                          {enr.start_at ? <span className="text-green-400">Từ: {formatDate(enr.start_at)}</span> : <span className="text-gray-500">Từ: ---</span>}
                          {enr.end_at ? <span className="text-red-400">Đến: {formatDate(enr.end_at)}</span> : <span className="text-gray-500">Đến: ---</span>}
                        </div>
                      </td>
                      <td className="p-5 text-center">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                          enr.status === 'active' ? 'bg-[#4db933]/10 text-[#4db933] border-[#4db933]/20' :
                          enr.status === 'revoked' ? 'bg-[#eb3434]/10 text-[#eb3434] border-[#eb3434]/20' :
                          'bg-[#ffee00]/10 text-[#ffee00] border-[#ffee00]/20'
                        }`}>
                          {enr.status?.toUpperCase() || "ACTIVE"}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenModal(enr)} className="p-2 bg-yellow-500/10 text-yellow-400 rounded-lg hover:scale-110 transition-all border border-yellow-500/20"><PencilIcon className="w-4 h-4"/></button>
                            <button onClick={() => handleRevoke(enr)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:scale-110 transition-all border border-red-500/20"><TrashIcon className="w-4 h-4"/></button>
                        </div>
                      </td>
                    </tr>
                 )})}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
             <div className="flex justify-between items-center mt-6 px-4 bg-[#1a0b2e]/30 p-4 rounded-xl border border-white/5">
                <span className="text-sm text-gray-400">Hiển thị {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredEnrollments.length)} / {filteredEnrollments.length}</span>
                <div className="flex gap-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-50">Trước</button>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-50">Sau</button>
                </div>
             </div>
           )}

        </div>
      </main>

      <EnrollmentModal 
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitEnrollment}
        students={students}
        courses={courses}
        editingEnrollment={editingEnrollment}
        submitting={submitting}
        existingEnrollments={enrollments}
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