import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import {
  PlusIcon,
  SearchIcon,
  TrashIcon,
  PencilIcon,
  UserGroupIcon
} from "@heroicons/react/solid";
import "../../styles/admin.css";
import HeaderAdmin from "../../components/layout/HeaderAdmin";

const customStyles = `
  @keyframes slideInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #9c00e5; border-radius: 3px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ff7c7c; }
`;

const API_BASE = "http://localhost:3000";

// Type Definitions - Đã bỏ program_id
interface Student {
  id: number | string;
  username: string;
  email: string;
  full_name: string;
  created_at?: string;
  avatar_url?: string;
}

interface FormData {
  username: string;
  email: string;
  full_name: string;
  password: string;
}

export default function ManageStudentsPage() {
  const navigate = useNavigate(); 

  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  // Đã xóa filterProgram
  const [currentPage, setCurrentPage] = useState(1);
  
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    full_name: "",
    password: "",
  });

  const ITEMS_PER_PAGE = 10;

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };

      const response = await fetch(`${API_BASE}/api/users`, { headers });
      const data = response.ok ? await response.json() : { users: [] };

      let userList: any[] = [];
      if (Array.isArray(data.users)) {
        userList = data.users;
      } else if (Array.isArray(data)) {
        userList = data;
      }

      const mappedStudents: Student[] = userList
        .filter((item: any) => item.role === "student")
        .map((item: any) => ({
          id: item.id,
          username: item.username,
          email: item.email,
          full_name: item.full_name,
          // Không map program_id nữa
          created_at: item.created_at,
          avatar_url: item.avatar_url
        }));

      setStudents(mappedStudents);
      setFilteredStudents(mappedStudents);
    } catch (error) {
      console.error("Lỗi khi tải danh sách học sinh:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    let result = students;
    // Đã xóa logic lọc theo program
    if (searchTerm) {
      result = result.filter(student =>
        (student.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.username || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredStudents(result);
    setCurrentPage(1);
  }, [searchTerm, students]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return; 

    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };

      const updateData = {
        username: formData.username,
        email: formData.email,
        full_name: formData.full_name,
        // Không gửi program_id
        ...(formData.password && { password: formData.password }) 
      };

      const response = await fetch(`${API_BASE}/api/users/${editingStudent.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        alert("Cập nhật học sinh thành công!");
        fetchStudents(); 
        setShowModal(false);
        resetForm();
      } else {
        alert("Lỗi khi cập nhật học sinh");
      }
    } catch (error) {
      console.error("Lỗi:", error);
      alert("Có lỗi xảy ra");
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      username: student.username,
      email: student.email,
      full_name: student.full_name,
      password: "", 
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string | number) => {
    if (confirm("Bạn có chắc chắn muốn xóa học sinh này?")) {
      try {
        const token = localStorage.getItem("token");
        const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };
        const response = await fetch(`${API_BASE}/api/users/${id}`, { method: "DELETE", headers });

        if (response.ok) {
          setStudents(students.filter(student => student.id?.toString() !== id.toString()));
          alert("Xóa học sinh thành công!");
        } else {
          alert("Lỗi khi xóa học sinh");
        }
      } catch (error) {
        console.error("Lỗi:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ username: "", email: "", full_name: "", password: "" });
    setEditingStudent(null);
  };

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  return (
    <div className="flex flex-col min-h-screen bg-bg-main text-text-primary transition-colors duration-300 font-sans">
      <style>{customStyles}</style>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#9c00e5]/20 rounded-full filter blur-3xl animate-pulse" style={{ animation: 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#3c90ff]/20 rounded-full filter blur-3xl animate-pulse" style={{ animation: 'pulse 10s cubic-bezier(0.4, 0, 0.6, 1) infinite 2s' }}></div>
      </div>

      <HeaderAdmin />

      <main className="flex-1 p-6 md:p-10 relative z-10 page-enter-right">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 mb-10 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-gradient-to-br from-[#9c00e5] to-[#ff7c7c] p-3 rounded-lg shadow-lg shadow-[#9c00e5]/40">
                  <UserGroupIcon className="w-6 h-6 text-text-primary" />
                </span>
                <div>
                  <h1 className="text-4xl font-black bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text text-transparent transition-colors duration-300">
                    Quản lý học sinh
                  </h1>
                  <span className="inline-block mt-1 text-xs font-bold text-[#9c00e5] bg-[#9c00e5]/20 px-3 py-1 rounded-full">
                    {filteredStudents.length} học sinh
                  </span>
                </div>
              </div>
              <p className="text-text-secondary text-sm ml-12">Quản lý tất cả học sinh trên nền tảng LETSCODE.</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/admin/assign-student-courses")}
                className="px-6 py-2.5 text-sm font-bold text-text-primary transition-all duration-200 border border-[#9c00e5]/50 bg-bg-card rounded-xl hover:bg-white/10 w-fit"
              >
                Phân quyền khóa học
              </button>
              <button
                onClick={() => navigate("/admin/create-student")}
                className="px-6 py-2.5 text-sm font-bold text-text-primary transition-all duration-200 shadow-lg bg-gradient-to-r from-[#9c00e5] to-[#ff7c7c] rounded-xl hover:shadow-[#9c00e5]/40 hover:from-[#ff7c7c] hover:to-[#9c00e5] hover:scale-105 active:scale-95 w-fit"
              >
                + Thêm học sinh
              </button>
            </div>
          </div>

          <div className="mb-8">
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="text"
                placeholder="Tìm kiếm học sinh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-bg-card border border-color-border rounded-xl text-text-primary placeholder-text-secondary focus:outline-none focus:border-[#9c00e5] transition-colors"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#9c00e5]/20">
            <table className="w-full">
              <thead>
                <tr className="bg-black/5 border-b border-color-border">
                  <th className="px-6 py-4 text-left text-sm font-bold text-text-secondary">Tên học sinh</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-text-secondary">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-text-secondary">Username</th>
                  {/* Đã xóa cột Program */}
                  <th className="px-6 py-4 text-left text-sm font-bold text-text-secondary">Ngày tạo</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-text-secondary">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-text-secondary">Đang tải danh sách học sinh...</td></tr>
                ) : filteredStudents.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-text-secondary">Không tìm thấy học sinh nào</td></tr>
                ) : (
                  currentStudents.map((student, idx) => (
                    <tr key={student.id} className={`${idx % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"} border-b border-[#9c00e5]/10 hover:bg-bg-card transition-colors`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#9c00e5] to-[#ff7c7c] flex items-center justify-center text-text-primary font-bold text-sm flex-shrink-0">
                            {student.full_name.charAt(0).toUpperCase()}
                          </div>
                          <p className="text-text-primary font-semibold transition-colors">{student.full_name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className="text-text-secondary text-sm">{student.email}</span></td>
                      <td className="px-6 py-4"><span className="text-text-secondary text-sm">{student.username}</span></td>
                      {/* Đã xóa hiển thị Program */}
                      <td className="px-6 py-4">
                        <span className="text-text-secondary text-sm">{student.created_at ? new Date(student.created_at).toLocaleDateString("vi-VN") : "N/A"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEdit(student)} className="p-2 bg-gradient-to-r from-[#9c00e5] to-[#ff7c7c] hover:from-[#ff7c7c] hover:to-[#9c00e5] rounded-lg font-bold text-text-primary transition-all hover:shadow-lg hover:shadow-[#9c00e5]/30">
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(student.id)} className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg font-bold text-red-400 transition-all">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 px-4">
              <div className="text-sm text-text-secondary">Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredStudents.length)} trong {filteredStudents.length} học sinh</div>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-2 bg-bg-card border border-color-border rounded-lg text-text-primary text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-white/10">← Trước</button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${currentPage === page ? "bg-gradient-to-r from-[#9c00e5] to-[#ff7c7c] text-text-primary shadow-lg shadow-[#9c00e5]/30" : "bg-bg-card border border-color-border text-text-primary hover:bg-white/10"}`}>{page}</button>
                  ))}
                </div>
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-2 bg-bg-card border border-color-border rounded-lg text-text-primary text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-white/10">Tiếp →</button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL SỬA */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-bg-card border border-color-border rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-6 border-b border-color-border bg-black/5">
              <h2 className="text-2xl font-bold text-text-primary">
                {editingStudent ? "Chỉnh sửa học sinh" : "Thêm học sinh"}
              </h2>
              <button 
                onClick={() => { setShowModal(false); resetForm(); }} 
                className="text-xl text-text-secondary transition-colors hover:text-text-primary"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block mb-2 text-sm font-bold text-text-secondary">Tên đầy đủ</label>
                <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} required className="w-full px-4 py-3 text-gray-900 dark:text-white transition-colors border rounded-lg bg-white dark:bg-[#1f1428] border-gray-300 dark:border-[#9c00e5]/50 focus:outline-none focus:border-[#9c00e5]" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-bold text-text-secondary">Username</label>
                  <input type="text" name="username" value={formData.username} onChange={handleInputChange} required className="w-full px-4 py-3 text-gray-900 dark:text-white transition-colors border rounded-lg bg-white dark:bg-[#1f1428] border-gray-300 dark:border-[#9c00e5]/50 focus:outline-none focus:border-[#9c00e5]" />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-bold text-text-secondary">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full px-4 py-3 text-gray-900 dark:text-white transition-colors border rounded-lg bg-white dark:bg-[#1f1428] border-gray-300 dark:border-[#9c00e5]/50 focus:outline-none focus:border-[#9c00e5]" />
                </div>
              </div>

              {/* Đã xóa phần chọn Program trong Modal, chỉ còn Mật khẩu */}
              <div>
                  <label className="block mb-2 text-sm font-bold text-text-secondary">Mật khẩu {editingStudent && "(Để trống nếu không đổi)"}</label>
                  <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full px-4 py-3 text-gray-900 dark:text-white transition-colors border rounded-lg bg-white dark:bg-[#1f1428] border-gray-300 dark:border-[#9c00e5]/50 focus:outline-none focus:border-[#9c00e5]" />
              </div>

              <div className="flex gap-3 pt-6 border-t border-color-border">
                <button type="submit" className="flex-1 px-6 py-3 font-bold text-text-primary transition-all rounded-lg shadow-lg bg-gradient-to-r from-[#9c00e5] to-[#ff7c7c] hover:shadow-[#9c00e5]/30">
                  {editingStudent ? "Cập nhật" : "Thêm mới"}
                </button>
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="flex-1 px-6 py-3 font-bold text-text-secondary transition-colors border rounded-lg bg-bg-card border-color-border hover:text-text-primary">
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}