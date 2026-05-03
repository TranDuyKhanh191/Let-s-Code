import React from "react";

interface CourseModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: {
    title: string;
    course_code: string;
    level: string; // Đây là age_group (nhập tay)
    quantity: string;
    generalObjectives: string;
  };
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  editingCourse: any;
  resetForm: () => void;
  onStatusChange?: (status: string) => void;
}

const CourseModal: React.FC<CourseModalProps> = ({
  open,
  onClose,
  onSubmit,
  formData,
  onInputChange,
  editingCourse,
  resetForm,
  onStatusChange
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-[#2a1b3d] to-[#1f1428] border border-[#9c00e5]/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">

        {/* HEADER */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-6 border-b border-[#9c00e5]/20 bg-gradient-to-r from-[#2a1b3d] to-[#1f1428]">
          <h2 className="text-2xl font-bold text-white">
            {editingCourse ? "Chỉnh sửa khóa học" : "Thêm khóa học"}
          </h2>
          <button onClick={() => { onClose(); resetForm(); }} className="text-xl text-gray-400 hover:text-white">✕</button>
        </div>

        {/* FORM */}
        <form onSubmit={onSubmit} className="p-8 space-y-6">

          {/* Tên khóa học */}
          <div>
            <label className="block mb-2 text-sm font-bold text-gray-400">Tên khóa học</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={onInputChange}
              required
              className="w-full px-4 py-3 text-white bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#9c00e5]"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Mã khóa học */}
            <div>
              <label className="block mb-2 text-sm font-bold text-gray-400">Mã khóa học</label>
              <select
                name="course_code"
                value={formData.course_code}
                onChange={onInputChange}
                className="w-full px-4 py-3 text-white bg-[#1f1428] border border-white/10 rounded-lg focus:outline-none focus:border-[#9c00e5] cursor-pointer"
              >
                <optgroup label="Robotic Essential (Program 1)">
                    {["REA", "REAX", "REB", "REBX", "REC", "RECX"].map(c => <option key={c} value={c}>{c}</option>)}
                </optgroup>
                <optgroup label="Robotic Prime (Program 2)">
                    {["RPA", "RPAX", "RPB", "RPBX", "RPC", "RPCX"].map(c => <option key={c} value={c}>{c}</option>)}
                </optgroup>
              </select>
            </div>

            {/* Level / Độ tuổi - ĐÃ SỬA: Cho phép nhập tay */}
            <div>
              <label className="block mb-2 text-sm font-bold text-gray-400">Level / Độ tuổi</label>
              <input
                type="text"
                name="level"
                value={formData.level}
                onChange={onInputChange}
                placeholder="VD: 6-11 tuổi"
                className="w-full px-4 py-3 text-white bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#9c00e5]"
              />
            </div>
          </div>

          {/* Số lượng & Mục tiêu */}
          <div className="grid grid-cols-2 gap-6">
             <div className="col-span-2">
                <label className="block mb-2 text-sm font-bold text-gray-400">Số buổi học</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={onInputChange}
                  className="w-full px-4 py-3 text-white bg-white/5 border border-white/10 rounded-lg"
                />
             </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-bold text-gray-400">Mục tiêu chung</label>
            <textarea
              name="generalObjectives"
              value={formData.generalObjectives}
              onChange={onInputChange}
              rows={4}
              className="w-full px-4 py-3 text-white bg-white/5 border border-white/10 rounded-lg resize-none"
            />
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3 pt-6 border-t border-white/10">
            <button
              type="submit"
              className="flex-1 px-6 py-3 font-bold text-white rounded-lg bg-gradient-to-r from-[#9c00e5] to-[#ff7c7c] hover:shadow-lg"
            >
              {editingCourse ? "Cập nhật" : "Thêm"} khóa học
            </button>
            <button
              type="button"
              onClick={() => { onClose(); resetForm(); }}
              className="flex-1 px-6 py-3 font-bold text-gray-300 border border-white/10 rounded-lg bg-white/5 hover:text-white"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseModal;