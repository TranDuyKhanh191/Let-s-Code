import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { ArrowLeftIcon } from "@heroicons/react/solid";
import HeaderAdmin from "../../components/layout/HeaderAdmin";

interface FormData {
  username: string;
  email: string;
  full_name: string;
  password: string;
}

const customStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #9c00e5;
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #ff7c7c;
  }
`;

export default function CreateTeacherPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    full_name: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };
      
      const newTeacherData = {
        username: formData.username,
        email: formData.email,
        full_name: formData.full_name,
        password: formData.password,
        // Không gửi program_id nữa
      };

      const response = await fetch("http://localhost:3000/api/users", {
        method: "POST",
        headers,
        body: JSON.stringify(newTeacherData)
      });

      if (response.ok) {
        alert("Thêm giáo viên thành công!");
        setFormData({
          username: "",
          email: "",
          full_name: "",
          password: "",
        });
      } else {
        alert("Lỗi khi thêm giáo viên");
      }
    } catch (error) {
      console.error("Lỗi khi lưu giáo viên:", error);
      alert("Có lỗi xảy ra khi lưu giáo viên");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#0f061a] to-[#1a0b2e] text-white font-sans">
      <style>{customStyles}</style>
      <HeaderAdmin />
      <main className="flex-1 flex items-center justify-center p-6 md:p-10">
        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-[#2a1b3d] to-[#1f1428] border border-[#9c00e5]/20 rounded-2xl max-w-xl w-full p-8 shadow-xl custom-scrollbar relative">
          
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[#9c00e5] transition-colors mb-6 group"
          >
            <ArrowLeftIcon className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
            Quay lại danh sách
          </button>

          <h2 className="text-2xl font-bold text-white mb-8 text-center">Thêm giáo viên mới</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-400 mb-2">Tên đầy đủ</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#9c00e5] transition-colors"
              placeholder="Nhập tên đầy đủ"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#9c00e5] transition-colors"
                placeholder="Nhập username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#9c00e5] transition-colors"
                placeholder="Nhập email"
                required
              />
            </div>
          </div>
          
          {/* Đã xóa phần chọn Program, chỉ còn mật khẩu */}
          <div className="mb-4">
              <label className="block text-sm font-bold text-gray-400 mb-2">Mật khẩu</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#9c00e5] transition-colors"
                placeholder="Nhập mật khẩu"
                required
              />
          </div>

          <div className="flex gap-3 pt-6 border-t border-white/10">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#9c00e5] to-[#ff7c7c] hover:from-[#ff7c7c] hover:to-[#9c00e5] rounded-lg font-bold text-white transition-all hover:shadow-lg hover:shadow-[#9c00e5]/30"
              disabled={loading}
            >
              {loading ? "Đang thêm..." : "Thêm giáo viên"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 font-bold text-gray-300 transition-colors border rounded-lg bg-white/5 border-white/10 hover:text-white"
            >
              Hủy
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}