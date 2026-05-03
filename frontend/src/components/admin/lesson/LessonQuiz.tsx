import React, { useEffect, useState } from "react";
import { AcademicCapIcon, TrashIcon, CheckCircleIcon } from "@heroicons/react/solid";

interface Props { lessonId: number; }
const API_BASE = "http://localhost:3000/api";

type Choice = { text: string; correct: boolean };

export default function LessonQuiz({ lessonId }: Props) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [qText, setQText] = useState("");
  const [choices, setChoices] = useState<Choice[]>([{ text: "", correct: false }, { text: "", correct: false }]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/lessons/quizzes/${lessonId}`, {
         headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
         const data = await res.json();
         // Sắp xếp câu hỏi theo sort_order tăng dần để hiển thị đúng
         const sortedQuizzes = (data.quizzes || []).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
         setQuestions(sortedQuizzes);
      }
    };
    fetchQuiz();
  }, [lessonId]);

  const handleAddChoice = () => setChoices(prev => [...prev, { text: "", correct: false }]);
  const handleChoiceChange = (i: number, val: string) => setChoices(prev => prev.map((c, idx) => idx===i ? {...c, text: val} : c));
  const handleMarkCorrect = (i: number) => setChoices(prev => prev.map((c, idx) => ({...c, correct: idx===i})));

  const handleAddQuestion = async () => {
    if (!qText) return alert("Nhập câu hỏi");
    setLoading(true);
    const token = localStorage.getItem("token");
    const currentMaxSort = questions.length > 0 
        ? Math.max(...questions.map(q => q.sort_order || 0)) 
        : 0;
    const nextSortOrder = currentMaxSort + 1;
    // ------------------------

    try {
      const payload = {
         question_text: qText,
         quiz_type: "single", 
         sort_order: nextSortOrder,
         answers: choices.map(c => ({
            answer_text: c.text,
            is_correct: c.correct
         }))
      };
      
      const res = await fetch(`${API_BASE}/lessons/quizzes/${lessonId}`, {
         method: "POST",
         headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
         },
         body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error("Lỗi");
      const data = await res.json();
      setQuestions(prev => [...prev, data.quiz]);
      
      // Reset form
      setQText("");
      setChoices([{ text: "", correct: false }, { text: "", correct: false }]);

    } catch(e) { alert("Thêm thất bại"); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if(!confirm("Xóa câu hỏi này?")) return;
    const token = localStorage.getItem("token");
    await fetch(`${API_BASE}/lessons/quizzes/${id}`, {
       method: "DELETE", headers: { Authorization: `Bearer ${token}` }
    });
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  return (
    <div className="space-y-8">
       <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <AcademicCapIcon className="w-6 h-6 text-[#9c00e5]" /> Tổng kết - Trắc nghiệm
       </h3>

       <div className="bg-[#1a0b2e] p-6 rounded-2xl border border-white/10 shadow-lg space-y-4">
          <textarea 
             value={qText} onChange={e => setQText(e.target.value)}
             className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:border-[#9c00e5] focus:outline-none"
             placeholder="Nhập nội dung câu hỏi..."
          />
          <div className="space-y-2">
             {choices.map((c, i) => (
                <div key={i} className="flex gap-3 items-center">
                   <div onClick={() => handleMarkCorrect(i)} className={`w-6 h-6 rounded-full border-2 cursor-pointer flex items-center justify-center ${c.correct ? 'border-green-500 bg-green-500/20' : 'border-gray-600'}`}>
                      {c.correct && <div className="w-3 h-3 bg-green-500 rounded-full"/>}
                   </div>
                   <input 
                      value={c.text} onChange={e => handleChoiceChange(i, e.target.value)}
                      className="flex-1 px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none"
                      placeholder={`Đáp án ${i+1}`}
                   />
                </div>
             ))}
             <button onClick={handleAddChoice} className="text-xs text-[#9c00e5] font-bold hover:text-[#b44bf0] transition-colors">+ Thêm đáp án</button>
          </div>
          <div className="flex justify-end pt-2">
             <button onClick={handleAddQuestion} disabled={loading} className="px-6 py-2 bg-[#9c00e5] rounded-xl text-white font-bold hover:bg-[#8500c4] transition-all disabled:opacity-50">
                {loading ? "Đang tạo..." : "Tạo câu hỏi"}
             </button>
          </div>
       </div>

       <div className="space-y-4">
          {/* Hiển thị danh sách câu hỏi */}
          {questions.map((q, idx) => (
             <div key={q.id} className="p-6 bg-[#1a0b2e]/60 border border-white/10 rounded-2xl relative group hover:border-[#9c00e5]/50 transition-colors">
                <div className="flex justify-between mb-3">
                   {/* Hiển thị số thứ tự câu hỏi dựa trên idx + 1 */}
                   <h4 className="font-bold text-white text-lg flex gap-2">
                      <span className="text-[#9c00e5]">Câu {idx + 1}:</span> 
                      <span>{q.question_text}</span>
                   </h4>
                   <button onClick={() => handleDelete(q.id)} className="p-2 bg-white/5 rounded-full hover:bg-red-500/20 text-gray-500 hover:text-red-500 transition-all">
                      <TrashIcon className="w-5 h-5"/>
                   </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   {q.answers && q.answers.map((a: any, ai: number) => (
                      <div key={ai} className={`px-4 py-3 rounded-xl border flex items-center gap-3 ${a.is_correct ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-white/5 bg-black/20 text-gray-400'}`}>
                         {a.is_correct ? <CheckCircleIcon className="w-5 h-5 shrink-0"/> : <div className="w-5 h-5"/>} 
                         <span className="font-medium">{a.answer_text}</span>
                      </div>
                   ))}
                </div>
                {/* Debug: hiển thị sort_order nhỏ ở góc để kiểm tra (có thể xóa sau này) */}
                <span className="absolute bottom-2 right-4 text-[10px] text-gray-700 font-mono">Order: {q.sort_order}</span>
             </div>
          ))}
          
          {questions.length === 0 && (
            <div className="text-center py-10 text-gray-500 border border-dashed border-white/10 rounded-2xl">
                Chưa có câu hỏi nào.
            </div>
          )}
       </div>
    </div>
  );
}  