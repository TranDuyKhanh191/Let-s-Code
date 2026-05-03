import React, { useEffect, useState } from "react";
import { DocumentTextIcon, TrashIcon, UploadIcon, PresentationChartBarIcon } from "@heroicons/react/solid";

interface Props { lessonId: number; }
const API_BASE = "http://localhost:3000/api";

export default function LessonSlides({ lessonId }: Props) {
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSlides = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/lessons/lessonMedia/${lessonId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        const data = Array.isArray(json) ? json : (json.data || []);
        // Lọc purpose='gallery' HOẶC mime_type pdf
        setSlides(data.filter((m: any) => m.purpose === 'gallery' || (m.media?.mime_type && m.media.mime_type.includes('pdf'))));
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchSlides(); }, [lessonId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setLoading(true);
    const token = localStorage.getItem("token");
    
    try {
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        
        // 1. Upload Media
        const fd = new FormData(); fd.append("file", file);
        const upRes = await fetch(`${API_BASE}/media/upload`, {
           method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd
        });
        
        if (!upRes.ok) throw new Error("Lỗi upload file");
        const upData = await upRes.json();
        const mediaId = upData.media?.id || upData.id;

        // 2. Attach (Link)
        const attachRes = await fetch(`${API_BASE}/lessons/lessonMedia/${lessonId}`, {
           method: "POST",
           headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
           body: JSON.stringify({
              mediaId: mediaId,
              purpose: "gallery",
              sortOrder: slides.length + i
           })
        });
        
        if(!attachRes.ok) throw new Error("Lỗi gắn file vào bài học");
      }
      await fetchSlides();
    } catch(e: any) { 
        alert("Lỗi: " + e.message); 
    } finally { 
        setLoading(false); 
        e.target.value = ""; 
    }
  };

  const handleDelete = async (item: any) => {
    if(!confirm("Xóa tài liệu này vĩnh viễn?")) return;
    const token = localStorage.getItem("token");
    
    try {
        // 1. Xóa Liên kết
        await fetch(`${API_BASE}/lessons/lessonMedia/${item.id}`, {
            method: "DELETE", headers: { Authorization: `Bearer ${token}` }
        });

        // 2. Xóa File gốc
        const mediaId = item.media?.id || item.media_id;
        if (mediaId) {
            await fetch(`${API_BASE}/media/${mediaId}`, {
                method: "DELETE", headers: { Authorization: `Bearer ${token}` }
            });
        }

        setSlides(prev => prev.filter(s => s.id !== item.id));
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white flex items-center gap-2">
         <PresentationChartBarIcon className="w-6 h-6 text-[#9c00e5]" /> Hướng dẫn lắp ráp (PDF/Slide)
      </h3>
      
      <div className="flex gap-4 items-center bg-white/5 p-4 rounded-xl border border-white/10 hover:border-[#9c00e5]/50 transition-colors">
        <div className="flex-1">
           <p className="text-sm font-bold text-white mb-1">Tải lên tài liệu</p>
           <p className="text-xs text-gray-500">Hỗ trợ .pdf, .ppt, .pptx</p>
        </div>
        <label className={`flex items-center gap-2 px-4 py-2 bg-[#9c00e5]/20 text-[#9c00e5] font-bold rounded-lg cursor-pointer hover:bg-[#9c00e5] hover:text-white transition-all ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
            <UploadIcon className="w-5 h-5" />
            <span>{loading ? "Đang xử lý..." : "Chọn File"}</span>
            <input type="file" accept=".pdf,.ppt,.pptx" multiple onChange={handleUpload} disabled={loading} className="hidden" />
        </label>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
         {slides.map(item => (
            <div key={item.id} className="min-w-[200px] w-[200px] bg-[#1a0b2e] border border-white/10 rounded-xl p-4 flex flex-col relative group shadow-lg">
               <div className="h-24 bg-white/5 rounded-lg mb-3 flex items-center justify-center">
                  <DocumentTextIcon className="w-10 h-10 text-[#9c00e5]" />
               </div>
               <p className="text-sm font-bold text-white truncate mb-1" title={item.media?.url}>{item.media?.url ? item.media.url.split('/').pop() : 'No Name'}</p>
               <span className="text-[10px] uppercase font-bold text-gray-500 mb-4 bg-white/5 w-fit px-2 py-0.5 rounded">{item.media?.mime_type || "FILE"}</span>
               <div className="flex gap-2 mt-auto">
                  <a href={item.media?.url} target="_blank" rel="noreferrer" className="flex-1 py-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white text-xs font-bold rounded text-center transition-colors">Mở</a>
                  <button onClick={() => handleDelete(item)} className="px-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors"><TrashIcon className="w-4 h-4"/></button>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
}