import React, { useEffect, useState } from "react";
import { CloudUploadIcon, VideoCameraIcon, TrashIcon } from "@heroicons/react/solid";

interface Props { lessonId: number; }

interface Media {
  id: number;
  url: string;
  mime_type?: string;
}

interface LessonMedia {
  id: number; // Đây là ID của content_media (liên kết)
  purpose: string;
  media: Media; // Đây là object Media gốc
}

const API_BASE = "http://localhost:3000/api";

export default function LessonProductVideo({ lessonId }: Props) {
  const [videoData, setVideoData] = useState<LessonMedia | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchVideo = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/lessons/lessonMedia/${lessonId}`, {
         headers: { "Authorization": token ? `Bearer ${token}` : "" }
      });
      if (res.ok) {
        const data: LessonMedia[] = await res.json();
        const item = data.find((m) => m.purpose === 'main') || data.find((m) => m.purpose === 'intro');
        setVideoData(item || null);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchVideo(); }, [lessonId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // 1. Nếu đã có video cũ => Xóa sạch cũ đi trước
      if (videoData) {
         await handleDelete(); 
      }

      // 2. Upload file mới
      const formData = new FormData();
      formData.append("file", file);
      
      const uploadRes = await fetch(`${API_BASE}/media/upload`, {
         method: "POST", headers: { "Authorization": `Bearer ${token}` }, body: formData
      });
      
      if (!uploadRes.ok) throw new Error("Lỗi upload file");
      const uploadData = await uploadRes.json();
      const mediaId = uploadData.media?.id || uploadData.id;

      // 3. Tạo liên kết (Content Media)
      const attachRes = await fetch(`${API_BASE}/lessons/lessonMedia/${lessonId}`, {
         method: "POST",
         headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
         },
         body: JSON.stringify({
            mediaId: mediaId,
            purpose: "main",
            sortOrder: 0
         })
      });
      
      if (!attachRes.ok) throw new Error("Lỗi gắn video");
      await fetchVideo();

    } catch (err: any) {
      console.error(err);
      alert("Lỗi: " + err.message);
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  // --- LOGIC XÓA MỚI ---
  const handleDelete = async () => {
     // Không cần confirm nếu được gọi tự động từ hàm upload
     // Nếu gọi từ nút Xóa thì cần confirm (xử lý ở onClick)
     if (!videoData) return;

     const token = localStorage.getItem("token");
     try {
        // B1: Xóa Liên kết (content_media)
        await fetch(`${API_BASE}/lessons/lessonMedia/${videoData.id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
         });

        // B2: Xóa Media gốc (media)
        // Lấy mediaId từ object media lồng bên trong
        const mediaId = videoData.media?.id;
        if (mediaId) {
            await fetch(`${API_BASE}/media/${mediaId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
        }

        setVideoData(null);
     } catch (err) { console.error("Lỗi xóa video:", err); }
  }

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
         <h3 className="text-xl font-bold text-white flex items-center gap-2">
           <VideoCameraIcon className="w-6 h-6 text-[#9c00e5]" /> Video thành phẩm
         </h3>
         {videoData && (
            <button 
                onClick={async () => {
                    if(confirm("Bạn có chắc chắn xóa video này?")) await handleDelete();
                }} 
                className="text-red-500 hover:text-red-400 text-sm font-bold flex items-center gap-1 bg-red-500/10 px-3 py-1 rounded-lg transition-colors"
            >
               <TrashIcon className="w-4 h-4" /> Xóa video
            </button>
         )}
       </div>
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col justify-center gap-4 bg-[#1a0b2e] p-6 rounded-2xl border border-white/10">
             <label className={`cursor-pointer group block ${loading ? 'pointer-events-none opacity-50' : ''}`}>
                <div className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-600 rounded-xl group-hover:border-[#9c00e5] group-hover:bg-[#9c00e5]/5 transition-all">
                   {loading ? (
                      <span className="text-[#9c00e5] font-bold animate-pulse">Đang tải lên...</span>
                   ) : (
                      <>
                        <CloudUploadIcon className="w-10 h-10 text-gray-400 group-hover:text-[#9c00e5] mb-2"/>
                        <span className="text-sm text-gray-400 font-bold group-hover:text-white">
                           {videoData ? "Thay thế video khác" : "Tải lên video mới"}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">MP4, WebM (Max 100MB)</span>
                      </>
                   )}
                </div>
                <input type="file" accept="video/*" onChange={handleUpload} disabled={loading} className="hidden" />
             </label>
          </div>
          
          <div className="bg-black/40 border border-white/10 rounded-xl p-2 min-h-[200px] flex items-center justify-center relative overflow-hidden shadow-inner">
             {videoData?.media?.url ? (
                <video src={videoData.media.url} controls className="w-full h-full rounded-lg max-h-60 object-contain" />
             ) : (
                <div className="text-center">
                   <VideoCameraIcon className="w-12 h-12 text-white/10 mx-auto mb-2"/>
                   <span className="text-gray-500 text-sm">Chưa có video</span>
                </div>
             )}
          </div>
       </div>
    </div>
  );
}