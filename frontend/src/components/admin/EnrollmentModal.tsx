import React, { useEffect, useState } from "react";
import { CoursePermissionSelector } from "./CoursePermissionSelector";
import { CalendarIcon } from "@heroicons/react/solid";

interface EnrollmentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  students: any[];
  courses: any[];
  editingEnrollment?: any | null;
  submitting?: boolean;
  existingEnrollments?: any[];
}

const EnrollmentModal: React.FC<EnrollmentModalProps> = ({
  open,
  onClose,
  onSubmit,
  students,
  courses,
  editingEnrollment,
  submitting = false,
  existingEnrollments = []
}) => {
  const [studentId, setStudentId] = useState<string | number>("");
  const [selectedCourses, setSelectedCourses] = useState<(string | number)[]>([]);
  const [status, setStatus] = useState<string>("active");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [disabledCourseIds, setDisabledCourseIds] = useState<(string | number)[]>([]);

  // Tính toán các khóa học đã được giao (active) để làm mờ
  useEffect(() => {
    if (studentId && !editingEnrollment) {
        const studentAssigns = existingEnrollments.filter(a => 
            a.student_id == studentId && 
            ['active'].includes(a.status)
        );
        const ids = studentAssigns.map(a => a.course_id);
        setDisabledCourseIds(ids);
    } else {
        setDisabledCourseIds([]);
    }
  }, [studentId, existingEnrollments]);

  useEffect(() => {
    if (open) {
      if (editingEnrollment) {
        setStudentId(editingEnrollment.student_id);
        setSelectedCourses([editingEnrollment.course_id]);
        setStatus(editingEnrollment.status || "active");
        setStartDate(editingEnrollment.start_at ? new Date(editingEnrollment.start_at).toISOString().split('T')[0] : "");
        setEndDate(editingEnrollment.end_at ? new Date(editingEnrollment.end_at).toISOString().split('T')[0] : "");
      } else {
        setStudentId("");
        setSelectedCourses([]);
        setStatus("active");
        setStartDate("");
        setEndDate("");
      }
    }
  }, [open, editingEnrollment]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      student_id: studentId,
      selectedCourses,
      status,
      start_at: startDate,
      end_at: endDate,
      isEditing: !!editingEnrollment,
      id: editingEnrollment?.id
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#2a1b3d] to-[#1f1428] border border-[#9c00e5]/20 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
        
        <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-6 border-b border-[#9c00e5]/20 bg-gradient-to-r from-[#2a1b3d] to-[#1f1428]">
          <h2 className="text-2xl font-bold text-white">
            {editingEnrollment ? "Cập nhật phân quyền" : "Giao khóa học mới"}
          </h2>
          <button onClick={onClose} className="text-xl text-gray-400 transition-colors hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={editingEnrollment ? "md:col-span-1" : "md:col-span-2"}>
                <label className="block mb-2 text-sm font-bold text-gray-400">
                Học sinh {editingEnrollment && "(Không thể thay đổi)"}
                </label>
                <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                disabled={!!editingEnrollment}
                className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#9c00e5] appearance-none ${!!editingEnrollment ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                required
                >
                <option value="" className="bg-[#1a0b2e]">-- Chọn học sinh --</option>
                {students.map((t) => (
                    <option key={t.id} value={t.id} className="bg-[#1a0b2e]">
                    {t.full_name} ({t.email})
                    </option>
                ))}
                </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 p-4 rounded-xl border border-white/5">
              <div>
                  <label className="block mb-2 text-sm font-bold text-gray-400 flex items-center gap-2">
                     <CalendarIcon className="w-4 h-4" /> Ngày bắt đầu
                  </label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#9c00e5]"
                  />
              </div>
              <div>
                  <label className="block mb-2 text-sm font-bold text-gray-400 flex items-center gap-2">
                     <CalendarIcon className="w-4 h-4" /> Ngày kết thúc
                  </label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#9c00e5]"
                  />
              </div>
          </div>

          {editingEnrollment ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
               <div>
                  <label className="block mb-2 text-sm font-bold text-gray-400">Khóa học đang chọn</label>
                  <div className="px-4 py-3 text-white rounded-lg bg-white/10 border border-white/10">
                     {courses.find(c => c.id == editingEnrollment.course_id)?.name || "N/A"}
                  </div>
               </div>

               <div>
                  <label className="block mb-2 text-sm font-bold text-gray-400">Trạng thái (Permission)</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#9c00e5] cursor-pointer"
                  >
                    <option value="active" className="text-green-400 bg-[#1a0b2e]">Active (Hoạt động)</option>
                    <option value="revoked" className="text-red-400 bg-[#1a0b2e]">Revoked (Thu hồi)</option>
                  </select>
               </div>
            </div>
          ) : (
            <div>
              <label className="block mb-2 text-sm font-bold text-gray-400">
                Chọn các khóa học cần giao {studentId && "(Khóa đã có quyền active/pending sẽ bị mờ)"}
              </label>
              {studentId ? (
                  <CoursePermissionSelector 
                    selectedCourses={selectedCourses}
                    onChange={setSelectedCourses}
                    courses={courses}
                    disabledCourseIds={disabledCourseIds}
                  />
              ) : (
                  <div className="p-8 text-center border rounded-lg border-white/10 bg-white/5 text-gray-400 italic">
                      Vui lòng chọn học sinh trước để xem danh sách khóa học khả dụng.
                  </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-6 border-t border-white/10">
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 px-6 py-3 font-bold text-white transition-all rounded-lg shadow-lg flex justify-center items-center gap-2 ${submitting ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-[#9c00e5] to-[#ff7c7c] hover:shadow-[#9c00e5]/30'}`}
            >
              {submitting ? (
                 <>
                   <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   Đang xử lý...
                 </>
              ) : (
                 editingEnrollment ? "Cập nhật" : `Giao ${selectedCourses.length} khóa học`
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-6 py-3 font-bold text-gray-300 transition-colors border rounded-lg bg-white/5 border-white/10 hover:text-white disabled:opacity-50"
            >
              Hủy bỏ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnrollmentModal;