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
interface Teacher {
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

export default function ManageTeachersPage() {
  const navigate = useNavigate(); 

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  // Đã xóa filterProgram
  const [currentPage, setCurrentPage] = useState(1);
  
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    full_name: "",
    password: "",
  });

  const ITEMS_PER_PAGE = 10;

  const fetchTeachers = async () => {
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

      const mappedTeachers: Teacher[] = userList
        .filter((item: any) => item.role !== "admin")
        .map((item: any) => ({
          id: item.id,
          username: item.username,
          email: item.email,
          full_name: item.full_name,
          // Không map program_id nữa
          created_at: item.created_at,
          avatar_url: item.avatar_url
        }));

      setTeachers(mappedTeachers);
      setFilteredTeachers(mappedTeachers);
    } catch (error) {
      console.error("Lỗi khi tải danh sách giáo viên:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    let result = teachers;
    // Đã xóa logic lọc theo program
    if (searchTerm) {
      result = result.filter(teacher =>
        (teacher.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (teacher.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (teacher.username || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredTeachers(result);
    setCurrentPage(1);
  }, [searchTerm, teachers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return; 

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

      const response = await fetch(`${API_BASE}/api/users/${editingTeacher.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        alert("Cập nhật giáo viên thành công!");
        fetchTeachers(); 
        setShowModal(false);
        resetForm();
      } else {
        alert("Lỗi khi cập nhật giáo viên");
      }
    } catch (error) {
      console.error("Lỗi:", error);
      alert("Có lỗi xảy ra");
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      username: teacher.username,
      email: teacher.email,
      full_name: teacher.full_name,
      password: "", 
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string | number) => {
    if (confirm("Bạn có chắc chắn muốn xóa giáo viên này?")) {
      try {
        const token = localStorage.getItem("token");
        const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };
        const response = await fetch(`${API_BASE}/api/users/${id}`, { method: "DELETE", headers });

        if (response.ok) {
          setTeachers(teachers.filter(teacher => teacher.id?.toString() !== id.toString()));
          alert("Xóa giáo viên thành công!");
        } else {
          alert("Lỗi khi xóa giáo viên");
        }
      } catch (error) {
        console.error("Lỗi:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ username: "", email: "", full_name: "", password: "" });
    setEditingTeacher(null);
  };

  const totalPages = Math.ceil(filteredTeachers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTeachers = filteredTeachers.slice(startIndex, endIndex);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#0f061a] to-[#1a0b2e] text-white font-sans">
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
                  <UserGroupIcon className="w-6 h-6 text-white" />
                </span>
                <div>
                  <h1 className="text-4xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Quản lý giáo viên
                  </h1>
                  <span className="inline-block mt-1 text-xs font-bold text-[#9c00e5] bg-[#9c00e5]/20 px-3 py-1 rounded-full">
                    {filteredTeachers.length} giáo viên
                  </span>
                </div>
              </div>
              <p className="text-gray-400 text-sm ml-12">Quản lý tất cả giáo viên trên nền tảng LETSCODE.</p>
            </div>

            <button
              onClick={() => navigate("/admin/create-teacher")}
              className="px-6 py-2.5 text-sm font-bold text-white transition-all duration-200 shadow-lg bg-gradient-to-r from-[#9c00e5] to-[#ff7c7c] rounded-xl hover:shadow-[#9c00e5]/40 hover:from-[#ff7c7c] hover:to-[#9c00e5] hover:scale-105 active:scale-95 w-fit"
            >
              + Thêm giáo viên
            </button>
          </div>

          <div className="mb-8">
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Tìm kiếm giáo viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#9c00e5] transition-colors"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#9c00e5]/20">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-[#2a1b3d] to-[#1f1428] border-b border-[#9c00e5]/20">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-400">Tên giáo viên</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-400">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-400">Username</th>
                  {/* Đã xóa cột Program */}
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-400">Ngày tạo</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-400">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">Đang tải danh sách giáo viên...</td></tr>
                ) : filteredTeachers.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">Không tìm thấy giáo viên nào</td></tr>
                ) : (
                  currentTeachers.map((teacher, idx) => (
                    <tr key={teacher.id} className={`${idx % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"} border-b border-[#9c00e5]/10 hover:bg-white/5 transition-colors`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#9c00e5] to-[#ff7c7c] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {teacher.full_name.charAt(0).toUpperCase()}
                          </div>
                          <p className="text-white font-semibold">{teacher.full_name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className="text-gray-300 text-sm">{teacher.email}</span></td>
                      <td className="px-6 py-4"><span className="text-gray-300 text-sm">{teacher.username}</span></td>
                      {/* Đã xóa hiển thị Program */}
                      <td className="px-6 py-4">
                        <span className="text-gray-400 text-sm">{teacher.created_at ? new Date(teacher.created_at).toLocaleDateString("vi-VN") : "N/A"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEdit(teacher)} className="p-2 bg-gradient-to-r from-[#9c00e5] to-[#ff7c7c] hover:from-[#ff7c7c] hover:to-[#9c00e5] rounded-lg font-bold text-white transition-all hover:shadow-lg hover:shadow-[#9c00e5]/30">
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(teacher.id)} className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg font-bold text-red-400 transition-all">
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
              <div className="text-sm text-gray-400">Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredTeachers.length)} trong {filteredTeachers.length} giáo viên</div>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-white/10">← Trước</button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${currentPage === page ? "bg-gradient-to-r from-[#9c00e5] to-[#ff7c7c] text-white shadow-lg shadow-[#9c00e5]/30" : "bg-white/5 border border-white/10 text-white hover:bg-white/10"}`}>{page}</button>
                  ))}
                </div>
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-white/10">Tiếp →</button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL SỬA */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-[#2a1b3d] to-[#1f1428] border border-[#9c00e5]/20 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-6 border-b border-[#9c00e5]/20 bg-gradient-to-r from-[#2a1b3d] to-[#1f1428]">
              <h2 className="text-2xl font-bold text-white">
                {editingTeacher ? "Chỉnh sửa giáo viên" : "Thêm giáo viên"}
              </h2>
              <button 
                onClick={() => { setShowModal(false); resetForm(); }} 
                className="text-xl text-gray-400 transition-colors hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-400">Tên đầy đủ</label>
                <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} required className="w-full px-4 py-3 text-white transition-colors border rounded-lg bg-white/5 border-white/10 focus:outline-none focus:border-[#9c00e5]" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-bold text-gray-400">Username</label>
                  <input type="text" name="username" value={formData.username} onChange={handleInputChange} required className="w-full px-4 py-3 text-white transition-colors border rounded-lg bg-white/5 border-white/10 focus:outline-none focus:border-[#9c00e5]" />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-bold text-gray-400">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full px-4 py-3 text-white transition-colors border rounded-lg bg-white/5 border-white/10 focus:outline-none focus:border-[#9c00e5]" />
                </div>
              </div>

              {/* Đã xóa phần chọn Program trong Modal, chỉ còn Mật khẩu */}
              <div>
                  <label className="block mb-2 text-sm font-bold text-gray-400">Mật khẩu {editingTeacher && "(Để trống nếu không đổi)"}</label>
                  <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full px-4 py-3 text-white transition-colors border rounded-lg bg-white/5 border-white/10 focus:outline-none focus:border-[#9c00e5]" />
              </div>

              <div className="flex gap-3 pt-6 border-t border-white/10">
                <button type="submit" className="flex-1 px-6 py-3 font-bold text-white transition-all rounded-lg shadow-lg bg-gradient-to-r from-[#9c00e5] to-[#ff7c7c] hover:shadow-[#9c00e5]/30">
                  {editingTeacher ? "Cập nhật" : "Thêm mới"}
                </button>
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="flex-1 px-6 py-3 font-bold text-gray-300 transition-colors border rounded-lg bg-white/5 border-white/10 hover:text-white">
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