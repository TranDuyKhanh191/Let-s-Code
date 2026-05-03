import React, { useState } from "react";

const API_BASE = "http://localhost:3000";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateCourseModal: React.FC<Props> = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    course_code: "REA",
    level: "", // Nhập tay (age_group)
    quantity: "0",
    generalObjectives: ""
  });
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Logic ID: Essential (1) vs Prime (2)
    const programId = formData.course_code.startsWith("RE") ? 1 : 2;

    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

    try {
        const payload = {
            program_id: programId,
            name: formData.title,
            course_code: formData.course_code,
            status: "published",
            age_group: formData.level, // Lấy giá trị nhập tay
            lesson_count: Number(formData.quantity) || 0,
            general_objectives: formData.generalObjectives,
            sort_order: 0
        };

        const res = await fetch(`${API_BASE}/api/courses`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Lỗi khi tạo khóa học");
        }

        alert("✅ Thêm khóa học thành công");
        setFormData({ title: "", course_code: "REA", level: "", quantity: "0", generalObjectives: "" });
        onSuccess?.();
        onClose();

    } catch (err: any) {
        console.error(err);
        alert(`❌ Lỗi: ${err.message}`);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#2a1b3d] to-[#1f1428] border border-[#9c00e5]/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-6 border-b border-[#9c00e5]/20 bg-gradient-to-r from-[#2a1b3d] to-[#1f1428]">
          <h2 className="text-2xl font-bold text-white">Thêm khóa học mới</h2>
          <button onClick={onClose} className="text-xl text-gray-400 transition-colors hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block mb-2 text-sm font-bold text-gray-400">Tên khóa học</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-3 text-white bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#9c00e5]" required />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-sm font-bold text-gray-400">Mã khóa học</label>
              <select name="course_code" value={formData.course_code} onChange={handleChange} className="w-full px-4 py-3 text-white bg-[#1f1428] border border-white/10 rounded-lg focus:outline-none focus:border-[#9c00e5] cursor-pointer">
                <optgroup label="Robotic Essential (Program 1)">
                  {["REA", "REAX", "REB", "REBX", "REC", "RECX"].map(c => <option key={c} value={c}>{c}</option>)}
                </optgroup>
                <optgroup label="Robotic Prime (Program 2)">
                  {["RPA", "RPAX", "RPB", "RPBX", "RPC", "RPCX"].map(c => <option key={c} value={c}>{c}</option>)}
                </optgroup>
              </select>
            </div>
            
            {/* Level nhập tay */}
            <div>
               <label className="block mb-2 text-sm font-bold text-gray-400">Level / Độ tuổi</label>
               <input 
                 type="text" 
                 name="level" 
                 value={formData.level} 
                 onChange={handleChange}
                 className="w-full px-4 py-3 text-white bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#9c00e5]"
                 placeholder="VD: 6-11 tuổi" 
                 required
               />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block mb-2 text-sm font-bold text-gray-400">Số lượng bài học</label>
              <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full px-4 py-3 text-white bg-white/5 border border-white/10 rounded-lg" min={0} required readOnly/>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-bold text-gray-400">Mục tiêu chung</label>
            <textarea name="generalObjectives" value={formData.generalObjectives} onChange={handleChange} rows={4} className="w-full px-4 py-3 text-white bg-white/5 border border-white/10 rounded-lg resize-none" />
          </div>

          <div className="flex gap-3 pt-6 border-t border-white/10">
            <button type="submit" aria-readonly disabled={loading} className="flex-1 px-6 py-3 font-bold text-white rounded-lg bg-gradient-to-r from-[#9c00e5] to-[#ff7c7c] hover:scale-105">{loading ? "Đang xử lý..." : "Thêm khóa học"}</button>
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 font-bold text-gray-300 border rounded-lg bg-white/5 border-white/10 hover:text-white">Hủy</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourseModal;