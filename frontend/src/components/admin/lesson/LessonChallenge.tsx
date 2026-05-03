import React, { useEffect, useState } from "react";
import { 
  LightningBoltIcon, 
  TrashIcon, 
  VideoCameraIcon, 
  PencilIcon, 
  PlusIcon, 
  SaveIcon, 
  XIcon, 
  PhotographIcon,
  DocumentTextIcon
} from "@heroicons/react/solid";

interface Props { lessonId: number; }
const API_BASE = "http://localhost:3000/api";

interface Challenge {
  id: number;
  title: string;
  description: string;
  instructions: string;
  media: any[]; // Mảng chứa thông tin content_media + media gốc
}

export default function LessonChallenge({ lessonId }: Props) {
  const [list, setList] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(false);
  
  // State Form
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
  });
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // --- FETCH DATA ---
  const fetchChallenges = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/lessons/challenges/${lessonId}`, {
         headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
         const json = await res.json();
         setList(json.challenges || []);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchChallenges(); }, [lessonId]);

  // --- HANDLERS FORM ---
  const resetForm = () => {
    setFormData({ title: "", description: "", instructions: "" });
    setMediaFile(null);
    setPreviewUrl(null);
    setIsEditing(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMediaFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleEditClick = (item: Challenge) => {
    setIsEditing(item.id);
    setFormData({
      title: item.title || "",
      description: item.description || "",
      instructions: item.instructions || ""
    });
    
    // Lấy media cũ hiển thị
    const existingLink = item.media && item.media.length > 0 ? item.media[0] : null;
    const existingMedia = existingLink?.media || existingLink; 
    
    if (existingMedia?.url) {
      setPreviewUrl(existingMedia.url);
    } else {
      setPreviewUrl(null);
    }
    setMediaFile(null);
  };

  // --- CHỨC NĂNG MỚI: CHỈ XÓA FILE MEDIA TRONG FORM SỬA ---
  const handleRemoveMediaOnly = async () => {
    if (!isEditing) {
        setMediaFile(null);
        setPreviewUrl(null);
        return;
    }

    if (!confirm("Bạn muốn gỡ video/ảnh này khỏi thử thách? (Hành động này sẽ xóa file vĩnh viễn)")) return;

    // Tìm object challenge đang sửa
    const currentChallenge = list.find(c => c.id === isEditing);
    if (!currentChallenge) return;

    const mediaLink = currentChallenge.media?.[0]; // Lấy link đầu tiên
    
    // Nếu không có media trên server (chỉ là preview local)
    if (!mediaLink) {
        setMediaFile(null);
        setPreviewUrl(null);
        return;
    }

    // IDs cần xóa
    const linkId = mediaLink.id; // ID bảng content_media
    const mediaId = mediaLink.media?.id || mediaLink.media_id; // ID bảng media

    setLoading(true);
    try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Xóa liên kết (content_media)
        if (linkId) {
            await fetch(`${API_BASE}/lessons/lessonMedia/${linkId}`, {
                method: "DELETE", headers
            });
        }

        // 2. Xóa file gốc (media)
        if (mediaId) {
            await fetch(`${API_BASE}/media/${mediaId}`, {
                method: "DELETE", headers
            });
        }

        // 3. Cập nhật UI
        setPreviewUrl(null);
        setMediaFile(null);
        
        // Cập nhật lại list ở dưới để mất icon media
        setList(prev => prev.map(c => {
            if (c.id === isEditing) {
                return { ...c, media: [] }; // Xóa media khỏi object trong list
            }
            return c;
        }));

        alert("Đã gỡ file thành công!");

    } catch (e) {
        console.error("Lỗi xóa media lẻ:", e);
        alert("Có lỗi xảy ra khi xóa file");
    } finally {
        setLoading(false);
    }
  };

  // --- SUBMIT (CREATE / UPDATE) ---
  const handleSubmit = async () => {
    if (!formData.title) return alert("Vui lòng nhập tiêu đề");
    setLoading(true);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

    try {
      let challengeId = isEditing;

      const payload = { 
        title: formData.title, 
        description: formData.description,
        instructions: formData.instructions,
        sort_order: list.length 
      };

      if (!isEditing) {
        // CREATE
        const res = await fetch(`${API_BASE}/lessons/challenges/${lessonId}`, {
          method: "POST", headers, body: JSON.stringify(payload)
        });
        if(!res.ok) throw new Error("Lỗi tạo thử thách");
        const data = await res.json();
        challengeId = data.challenge?.id;
      } else {
        // UPDATE
        await fetch(`${API_BASE}/lessons/challenges/${isEditing}`, {
          method: "PATCH", headers, body: JSON.stringify(payload)
        });
      }

      if (mediaFile && challengeId) {
         
         const fd = new FormData(); 
         fd.append("file", mediaFile);
         
         const upRes = await fetch(`${API_BASE}/media/upload`, {
            method: "POST", 
            headers: { Authorization: `Bearer ${token}` },
            body: fd
         });
         
         if (!upRes.ok) {
             const err = await upRes.json();
             throw new Error("Lỗi upload file: " + (err.error || upRes.statusText));
         }
         
         const upData = await upRes.json();
         const mediaId = upData.media?.id || upData.id;

         if(mediaId) {
             const attachRes = await fetch(`${API_BASE}/media/content_media`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                   media_id: mediaId,
                   content_type: "lesson_challenge",
                   content_id: challengeId,
                   purpose: "other",
                   sort_order: 0
                })
             });
             
             if (!attachRes.ok) {
                 const err = await attachRes.json();
                 alert("Cảnh báo: Lỗi gắn media (" + err.error + ")");
             }
         }
      }
      
      alert(isEditing ? "Cập nhật thành công!" : "Thêm mới thành công!");
      resetForm();
      fetchChallenges();

    } catch (err: any) { 
        console.error(err);
        alert("Lỗi: " + err.message); 
    } finally { 
        setLoading(false); 
    }
  };

  // --- DELETE (XÓA CẢ THỬ THÁCH) ---
  const handleDelete = async (item: Challenge) => {
    if (!confirm("Xóa toàn bộ thử thách này?")) return;
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    
    try {
        // 1. Xóa Media trước (Dọn rác thủ công từ FE)
        if (item.media && item.media.length > 0) {
            for (const m of item.media) {
                const linkId = m.id;
                const mediaId = m.media?.id || m.media_id;
                
                // Xóa link
                if(linkId) await fetch(`${API_BASE}/lessons/lessonMedia/${linkId}`, { method: "DELETE", headers }).catch(()=>{});
                // Xóa file
                if(mediaId) await fetch(`${API_BASE}/media/${mediaId}`, { method: "DELETE", headers }).catch(()=>{});
            }
        }

        // 2. Xóa Challenge
        await fetch(`${API_BASE}/lessons/challenges/${item.id}`, {
           method: "DELETE", headers
        });

        setList(prev => prev.filter(c => c.id !== item.id));
    } catch (err) {
        console.error(err);
        alert("Có lỗi khi xóa");
    }
  };

  return (
    <div className="space-y-8 animate-slide-in">
      
      {/* FORM INPUT */}
      <div className="bg-[#1f1129] border border-[#9c00e5]/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <LightningBoltIcon className="w-32 h-32 text-[#9c00e5]" />
         </div>

         <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
            {isEditing ? <PencilIcon className="w-6 h-6 text-[#ffee00]" /> : <PlusIcon className="w-6 h-6 text-[#9c00e5]" />}
            {isEditing ? "Chỉnh sửa thử thách" : "Tạo thử thách mới"}
         </h3>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
            {/* CỘT TRÁI: TEXT */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-400 mb-1">Tiêu đề</label>
                    <input 
                        value={formData.title} 
                        onChange={e => setFormData({...formData, title: e.target.value})} 
                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#9c00e5]" 
                        placeholder="VD: Thử thách Robot vượt mê cung" 
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-400 mb-1">Mô tả ngắn</label>
                    <textarea 
                        value={formData.description} 
                        onChange={e => setFormData({...formData, description: e.target.value})} 
                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#9c00e5] resize-none h-20" 
                        placeholder="Mô tả mục tiêu..." 
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-400 mb-1 flex items-center gap-2">
                        <DocumentTextIcon className="w-4 h-4"/> Hướng dẫn chi tiết (Chữ)
                    </label>
                    <textarea 
                        value={formData.instructions} 
                        onChange={e => setFormData({...formData, instructions: e.target.value})} 
                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#9c00e5] h-32 custom-scrollbar" 
                        placeholder="Bước 1... Bước 2..." 
                    />
                </div>
            </div>

            {/* CỘT PHẢI: MEDIA (ĐÃ CẢI TIẾN UI) */}
            <div className="flex flex-col">
                <label className="block text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
                    <VideoCameraIcon className="w-4 h-4"/> Video/Ảnh minh họa
                </label>
                <div className="flex-1 bg-black/20 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center relative group min-h-[250px]">
                    {previewUrl ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                            {/* Hiển thị Video hoặc Ảnh */}
                            {(mediaFile?.type.startsWith("video") || previewUrl.match(/\.(mp4|webm|ogg)$/i)) ? (
                                <video src={previewUrl} controls className="max-w-full max-h-[250px] rounded-lg shadow-lg" />
                            ) : (
                                <img src={previewUrl} alt="Preview" className="max-w-full max-h-[250px] object-contain rounded-lg" />
                            )}
                            
                            {/* NÚT GỠ FILE (XÓA LẺ) */}
                            <button 
                                type="button"
                                onClick={handleRemoveMediaOnly}
                                className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full shadow-lg hover:scale-110 hover:bg-red-600 transition-all z-20"
                                title="Gỡ file này"
                            >
                                <XIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full hover:bg-white/5 transition-all rounded-lg">
                            <div className="p-4 bg-[#9c00e5]/10 rounded-full mb-3 text-[#9c00e5]">
                                <LightningBoltIcon className="w-8 h-8" />
                            </div>
                            <span className="text-sm font-bold text-gray-300">Tải lên Video/Ảnh</span>
                            <span className="text-xs text-gray-500 mt-1">Hỗ trợ MP4, JPG, PNG</span>
                            <input type="file" accept="video/*,image/*" onChange={handleFileChange} className="hidden" />
                        </label>
                    )}
                </div>
            </div>
         </div>

         <div className="flex justify-end gap-3 pt-6 mt-2 border-t border-white/10">
            {isEditing && (
                <button onClick={resetForm} className="px-6 py-2 bg-white/5 border border-white/10 text-gray-300 font-bold rounded-xl hover:bg-white/10 transition-all">
                    Hủy bỏ
                </button>
            )}
            <button 
                onClick={handleSubmit} 
                disabled={loading} 
                className="px-8 py-2 font-bold rounded-xl shadow-lg bg-gradient-to-r from-[#9c00e5] to-[#ff7c7c] text-white hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
                {loading ? "Đang xử lý..." : (isEditing ? <><SaveIcon className="w-5 h-5"/> Lưu thay đổi</> : <><PlusIcon className="w-5 h-5"/> Thêm thử thách</>)}
            </button>
         </div>
      </div>

      {/* LIST VIEW */}
      <div className="space-y-4">
         <h4 className="text-lg font-bold text-white pl-2 border-l-4 border-[#9c00e5]">Danh sách thử thách ({list.length})</h4>
         
         <div className="grid grid-cols-1 gap-6">
            {list.map((ch, idx) => {
                const mediaItem = ch.media && ch.media.length > 0 ? ch.media[0] : null;
                const mediaUrl = mediaItem ? (mediaItem.media?.url || mediaItem.url) : null;
                const isVideo = mediaItem?.media?.mime_type?.startsWith("video") || mediaUrl?.endsWith(".mp4");

                return (
                <div key={ch.id} className="bg-[#1f1129]/60 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row gap-6 transition-all hover:border-[#9c00e5]/40 hover:bg-[#1f1129]">
                    
                    <div className="flex-1 space-y-3">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-[#9c00e5]/20 text-[#9c00e5] flex items-center justify-center font-bold text-sm border border-[#9c00e5]/30">
                                    {idx + 1}
                                </span>
                                <h5 className="font-bold text-white text-xl">{ch.title}</h5>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEditClick(ch)} className="p-2 bg-yellow-500/10 text-yellow-400 rounded-lg hover:bg-yellow-500/20 transition-colors" title="Sửa">
                                    <PencilIcon className="w-5 h-5"/>
                                </button>
                                <button onClick={() => handleDelete(ch)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors" title="Xóa toàn bộ">
                                    <TrashIcon className="w-5 h-5"/>
                                </button>
                            </div>
                        </div>
                        
                        <p className="text-gray-300 text-sm italic border-l-2 border-[#9c00e5] pl-3 py-1 bg-white/5 rounded-r-lg">
                            {ch.description || "Không có mô tả ngắn"}
                        </p>

                        {ch.instructions && (
                            <div className="bg-[#1a0b2e] p-4 rounded-xl border border-white/5 mt-2">
                                <h6 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
                                    <DocumentTextIcon className="w-3 h-3"/> Hướng dẫn chi tiết
                                </h6>
                                <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed font-mono">
                                    {ch.instructions}
                                </p>
                            </div>
                        )}
                    </div>

                    {mediaUrl && (
                        <div className="w-full md:w-80 shrink-0">
                            <div className="rounded-xl overflow-hidden border border-white/10 bg-black shadow-lg">
                                {isVideo ? (
                                    <video src={mediaUrl} controls className="w-full h-48 object-cover" />
                                ) : (
                                    <div className="h-48 relative group">
                                        <img src={mediaUrl} alt="Tutorial" className="w-full h-full object-contain bg-black/50" />
                                    </div>
                                )}
                                <div className="px-3 py-2 bg-[#1a0b2e] text-xs text-gray-400 flex items-center justify-center gap-1 border-t border-white/5">
                                    {isVideo ? <VideoCameraIcon className="w-3 h-3"/> : <PhotographIcon className="w-3 h-3"/>}
                                    Media đính kèm
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                )
            })}
         </div>
      </div>
    </div>
  );
}