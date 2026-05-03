import React, { useEffect, useState } from "react";
import { PhotographIcon, TrashIcon, ExternalLinkIcon, PlusIcon } from "@heroicons/react/solid";

interface Props { lessonId: number; }
const API_BASE = "http://localhost:3000/api";

export default function LessonPresentation({ lessonId }: Props) {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

   const fetchImages = async () => {
      setLoading(true);
      try {
         const token = localStorage.getItem("token");
         const res = await fetch(`${API_BASE}/lessons/lessonMedia/${lessonId}`, {
            headers: { Authorization: `Bearer ${token}` }
         });
         if (!res.ok) throw new Error("Không thể tải danh sách ảnh");
         const json = await res.json();
         const data = Array.isArray(json) ? json : (json.data || json || []);
         setImages(data.filter((m: any) => m.purpose === 'attachment'));
      } catch (e: any) {
         setImages([]);
         console.error("Lỗi fetch images:", e);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => { fetchImages(); }, [lessonId]);

   const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;
      setLoading(true);
      const token = localStorage.getItem("token");
      try {
         for (let i = 0; i < e.target.files.length; i++) {
            const file = e.target.files[i];
            
            // 1. Upload
            const formData = new FormData();
            formData.append("file", file);
            const uploadRes = await fetch(`${API_BASE}/media/upload`, {
               method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData
            });
            if (!uploadRes.ok) throw new Error("Upload file thất bại");
            const uploadData = await uploadRes.json();
            const mediaId = uploadData.media?.id || uploadData.id;
            
            if (!mediaId) throw new Error("Không tìm thấy Media ID");

            // 2. Attach
            const attachRes = await fetch(`${API_BASE}/lessons/lessonMedia/${lessonId}`, {
               method: "POST",
               headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
               body: JSON.stringify({ mediaId, purpose: "attachment", sortOrder: images.length })
            });
            
            if (!attachRes.ok) throw new Error("Lỗi khi gắn ảnh");
         }
         await fetchImages();
      } catch (err: any) {
         alert(`Lỗi: ${err.message}`);
      } finally {
         setLoading(false);
         e.target.value = "";
      }
   };

   const handleDelete = async (item: any) => {
      if (!confirm("Xóa ảnh này vĩnh viễn?")) return;
      setLoading(true);
      const token = localStorage.getItem("token");
      try {
         // 1. Xóa Link
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

         await fetchImages();
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
   };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white flex items-center gap-2">
         <PhotographIcon className="w-6 h-6 text-[#9c00e5]" /> Vật liệu chuẩn bị
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
         <label className={`aspect-square rounded-xl border-2 border-dashed border-white/20 hover:border-[#9c00e5] hover:bg-[#9c00e5]/10 flex flex-col items-center justify-center cursor-pointer transition-all group ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
            <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" />
            {loading ? <span className="text-xs text-[#9c00e5] animate-pulse font-bold">Uploading...</span> : <><PlusIcon className="w-8 h-8 text-gray-400 group-hover:text-[#9c00e5] mb-2"/><span className="text-xs text-gray-400 font-bold group-hover:text-white">Thêm ảnh</span></>}
         </label>

         {images.map(item => (
            <div key={item.id} className="group relative aspect-square bg-black rounded-xl overflow-hidden border border-white/10">
               <img src={item.media?.url} alt="" className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                  <a href={item.media?.url} target="_blank" rel="noreferrer" className="p-2 bg-white/20 rounded-full hover:bg-white/40"><ExternalLinkIcon className="w-5 h-5 text-white"/></a>
                  <button onClick={() => handleDelete(item)} className="p-2 bg-red-500/20 rounded-full hover:bg-red-500 text-red-500 hover:text-white"><TrashIcon className="w-5 h-5"/></button>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
}
