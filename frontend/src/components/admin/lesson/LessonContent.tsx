import React, { useEffect, useState } from "react";
import { 
  BookOpenIcon, 
  SaveIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  PhotographIcon, 
  PlusIcon, 
  TrashIcon,
  ExternalLinkIcon,
  PencilAltIcon,
  DocumentTextIcon
} from "@heroicons/react/solid";

interface Props { lessonId: number; }
const API_BASE = "http://localhost:3000/api";

// Định nghĩa kiểu dữ liệu khớp với Backend
interface Section {
  id?: number;
  title: string;
  usage_text: string;    // Backend dùng usage_text
  description: string;
  example_text: string;  // Backend dùng example_text
  sort_order?: number;
}

export default function LessonContent({ lessonId }: Props) {
  // --- State Quản lý Danh sách ---
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<number | 'NEW'>('NEW'); 

  // --- State Form (Editor) ---
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [example, setExample] = useState("");
  
  // State cho Images (Dùng chung cho bài học)
  const [images, setImages] = useState<any[]>([]);
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- 1. FETCH DATA ---
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { "Authorization": token ? `Bearer ${token}` : "" };

      // A. Lấy danh sách nội dung Text
      const resContent = await fetch(`${API_BASE}/lessons/lessonContents/${lessonId}`, { headers });
      if (resContent.ok) {
        const json = await resContent.json();
        
        // [FIX]: Backend trả về mảng trực tiếp, kiểm tra nếu là mảng thì lấy luôn
        const contentList = Array.isArray(json) ? json : (json.contents || json.data || []);
        
        setSections(contentList);
      }

      // B. Lấy hình ảnh (Giữ nguyên logic cũ)
      const resMedia = await fetch(`${API_BASE}/lessons/lessonMedia/${lessonId}`, { headers });
      if (resMedia.ok) {
        const json = await resMedia.json();
        const list = Array.isArray(json) ? json : (json.data || []);
        setImages(list.filter((m: any) => m.purpose === 'main'));
      }
    } catch (err) { 
      console.error(err);
      setError("Lỗi tải dữ liệu"); 
    } 
  };

  useEffect(() => { if (lessonId) fetchData(); }, [lessonId]);

  // --- 2. CHUYỂN ĐỔI GIỮA CÁC PHẦN (SELECT SECTION) ---
  const handleSelectSection = (section: Section | null) => {
      setError(null);
      setSuccess(false);
      
      if (section) {
          // Chế độ sửa
          setSelectedSectionId(section.id!);
          setTitle(section.title || "");
          setContent(section.usage_text || ""); // Map usage_text vào state content
          setDescription(section.description || "");
          setExample(section.example_text || "");
      } else {
          // Chế độ thêm mới
          setSelectedSectionId('NEW');
          setTitle("");
          setContent("");
          setDescription("");
          setExample("");
      }
  };

  // --- 3. LƯU TEXT (POST hoặc PATCH) ---
  const handleSaveText = async () => {
    setLoading(true); setSuccess(false); setError(null);
    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };
      
      // Payload map đúng tên trường trong DB/Backend
      const body = { 
          lesson_id: Number(lessonId), 
          title, 
          usage_text: content,      // Frontend 'content' -> Backend 'usage_text'
          description: description,
          example_text: example
      };

      let res;
      // Nếu đang chọn 'NEW' -> Gọi POST
      if (selectedSectionId === 'NEW') {
        res = await fetch(`${API_BASE}/lessons/lessonContents/${lessonId}`, { method: "POST", headers, body: JSON.stringify(body) });
      } else {
        // Nếu đang có ID -> Gọi PATCH
        res = await fetch(`${API_BASE}/lessons/lessonContents/${selectedSectionId}`, { method: "PATCH", headers, body: JSON.stringify(body) });
      }

      if (res.ok) {
        setSuccess(true);
        const data = await res.json();
        
        // Refresh lại danh sách
        await fetchData();
        
        // [FIX]: Lấy ID từ data trả về trực tiếp (vì backend trả về object row, ko bọc trong .content)
        const returnedId = data.id || (data.content && data.content.id);

        // Nếu vừa tạo mới xong thì chuyển sang chế độ edit bài đó
        if (selectedSectionId === 'NEW' && returnedId) {
            setSelectedSectionId(returnedId);
        }
        
        setTimeout(() => setSuccess(false), 2000);
      } else {
          const errData = await res.json();
          throw new Error(errData.message || "Lỗi khi lưu nội dung");
      }
    } catch (err: any) { setError(err.message); } 
    finally { setLoading(false); }
  };

  // --- 4. XÓA SECTION ---
  const handleDeleteSection = async (e: React.MouseEvent, id: number) => {
      e.stopPropagation();
      if (!confirm("Bạn có chắc muốn xóa phần nội dung này không?")) return;
      
      try {
          const token = localStorage.getItem("token");
          const res = await fetch(`${API_BASE}/lessons/lessonContents/${id}`, {
              method: "DELETE",
              headers: { "Authorization": `Bearer ${token}` }
          });

          if (res.ok) {
              if (selectedSectionId === id) {
                  handleSelectSection(null); // Reset về form mới nếu xóa bài đang chọn
              }
              await fetchData();
          } else {
              alert("Không thể xóa nội dung này");
          }
      } catch (err) {
          console.error(err);
          alert("Lỗi kết nối");
      }
  };

  // --- 5. UPLOAD HÌNH ẢNH (Logic giữ nguyên) ---
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;
      setImgLoading(true);
      const token = localStorage.getItem("token");
      try {
         for (let i = 0; i < e.target.files.length; i++) {
            const file = e.target.files[i];
            const formData = new FormData();
            formData.append("file", file);
            const uploadRes = await fetch(`${API_BASE}/media/upload`, {
               method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData
            });
            if (!uploadRes.ok) throw new Error("Upload file thất bại");
            const uploadData = await uploadRes.json();
            const mediaId = uploadData.media?.id || uploadData.id;
            if (!mediaId) throw new Error("Không tìm thấy Media ID");
            const attachRes = await fetch(`${API_BASE}/lessons/lessonMedia/${lessonId}`, {
               method: "POST",
               headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
               body: JSON.stringify({ mediaId, purpose: "main", sortOrder: images.length })
            });
            if (!attachRes.ok) throw new Error("Lỗi khi gắn ảnh");
         }
         await fetchData();
      } catch (err: any) { alert(`Lỗi: ${err.message}`); } 
      finally { setImgLoading(false); e.target.value = ""; }
  };

  const handleDeleteImage = async (item: any) => {
      if (!confirm("Xóa ảnh này vĩnh viễn?")) return;
      setImgLoading(true);
      const token = localStorage.getItem("token");
      try {
         await fetch(`${API_BASE}/lessons/lessonMedia/${item.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
         const mediaId = item.media?.id || item.media_id;
         if (mediaId) { await fetch(`${API_BASE}/media/${mediaId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }); }
         setImages(prev => prev.filter(img => img.id !== item.id));
      } catch (e) { console.error(e); }
      finally { setImgLoading(false); }
  };

  return (
    <div className="space-y-10 animate-slide-in">
      
      {/* Header */}
      <div className="border-b border-white/10 pb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpenIcon className="w-6 h-6 text-[#9c00e5]" />
          Nội dung lý thuyết
        </h3>
        <p className="text-gray-400 text-sm mt-1">
            Quản lý các phần nội dung của bài học (Chia nhỏ để học sinh dễ theo dõi).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* === CỘT TRÁI: DANH SÁCH CÁC PHẦN === */}
          <div className="lg:col-span-4 space-y-4">
              <div className="bg-[#1a0b2e]/50 rounded-xl border border-white/10 p-4 h-[650px] flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-bold text-gray-300 uppercase">Danh sách phần</span>
                      <button 
                        onClick={() => handleSelectSection(null)}
                        className="p-2 bg-[#9c00e5]/20 text-[#9c00e5] hover:bg-[#9c00e5] hover:text-white rounded-lg transition-colors text-xs font-bold flex items-center gap-1"
                      >
                          <PlusIcon className="w-4 h-4" /> Thêm mới
                      </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                      {sections.length === 0 && (
                          <div className="text-center text-gray-500 py-10 text-sm italic">
                              Chưa có nội dung nào.<br/>Hãy thêm phần đầu tiên.
                          </div>
                      )}

                      {sections.map((section, idx) => (
                          <div 
                            key={section.id}
                            onClick={() => handleSelectSection(section)}
                            className={`group p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                                selectedSectionId === section.id 
                                ? "bg-[#9c00e5]/20 border-[#9c00e5] shadow-lg shadow-[#9c00e5]/10" 
                                : "bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10"
                            }`}
                          >
                              <div className="flex items-center gap-3 overflow-hidden">
                                  <span className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                                      selectedSectionId === section.id ? "bg-[#9c00e5] text-white" : "bg-white/10 text-gray-400"
                                  }`}>
                                      {idx + 1}
                                  </span>
                                  <div className="truncate">
                                      <div className={`text-sm font-bold truncate ${selectedSectionId === section.id ? "text-white" : "text-gray-300 group-hover:text-white"}`}>
                                          {section.title || "(Chưa có tiêu đề)"}
                                      </div>
                                  </div>
                              </div>

                              <button 
                                onClick={(e) => handleDeleteSection(e, section.id!)}
                                className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                                title="Xóa phần này"
                              >
                                  <TrashIcon className="w-4 h-4" />
                              </button>
                          </div>
                      ))}
                      
                      {/* Indicator đang tạo mới */}
                      {selectedSectionId === 'NEW' && (
                          <div className="p-3 rounded-lg border border-dashed border-[#9c00e5] bg-[#9c00e5]/5 flex items-center gap-3 animate-pulse">
                              <span className="w-6 h-6 rounded bg-[#9c00e5]/50 text-white flex items-center justify-center text-xs font-bold">
                                  <PlusIcon className="w-4 h-4"/>
                              </span>
                              <span className="text-sm font-bold text-[#9c00e5]">Đang soạn thảo phần mới...</span>
                          </div>
                      )}
                  </div>
              </div>
          </div>

          {/* === CỘT PHẢI: EDITOR === */}
          <div className="lg:col-span-8 space-y-6">
              {/* Toolbar */}
              <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="flex items-center gap-2">
                    {selectedSectionId === 'NEW' ? (
                        <span className="text-[#9c00e5] font-bold flex items-center gap-2"><PlusIcon className="w-5 h-5"/> Tạo nội dung mới</span>
                    ) : (
                        <span className="text-yellow-400 font-bold flex items-center gap-2"><PencilAltIcon className="w-5 h-5"/> Chỉnh sửa phần ID: {selectedSectionId}</span>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {success && (
                      <span className="text-green-400 font-bold animate-pulse flex items-center gap-1 text-sm">
                        <CheckCircleIcon className="w-5 h-5"/> Đã lưu
                      </span>
                    )}
                    <button 
                        onClick={handleSaveText} 
                        disabled={loading} 
                        className="px-6 py-2 bg-[#9c00e5] hover:bg-[#8000bd] text-white rounded-lg font-bold disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg"
                    >
                      {loading ? "Đang lưu..." : <><SaveIcon className="w-5 h-5" /> {selectedSectionId === 'NEW' ? 'Lưu mới' : 'Cập nhật'}</>}
                    </button>
                </div>
              </div>

              {error && (
                <div className="text-red-400 bg-red-900/20 p-3 rounded-xl border border-red-500/50 flex items-center gap-2">
                  <ExclamationCircleIcon className="w-5 h-5"/> {error}
                </div>
              )}

              {/* Form Input Fields */}
              <div className="space-y-6">
                {/* 1. Tiêu đề */}
                <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2 uppercase">Tiêu đề phần (Title)</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white focus:border-[#9c00e5] focus:outline-none font-bold text-lg placeholder-gray-600"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="VD: Phần 1 - Giới thiệu động cơ..."
                    />
                </div>

                {/* 2. Mô tả */}
                <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2 uppercase">Mô tả ngắn (Description)</label>
                    <textarea
                      className="w-full h-[80px] px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white focus:border-[#9c00e5] focus:outline-none resize-none placeholder-gray-600"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Mô tả tóm tắt nội dung phần này..."
                    />
                </div>
                
                {/* 3. Nội dung chính (Mapping to usage_text) */}
                <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2 uppercase flex justify-between">
                        <span>Nội dung chi tiết (Main Content)</span>
                        <span className="text-xs text-[#9c00e5] lowercase">*hỗ trợ markdown cơ bản</span>
                    </label>
                    <textarea
                      className="w-full h-[300px] px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white focus:border-[#9c00e5] focus:outline-none resize-none font-mono text-sm leading-relaxed custom-scrollbar placeholder-gray-600"
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      placeholder="Nhập nội dung lý thuyết tại đây..."
                    />
                </div>
                
                {/* 4. Ví dụ (Mapping to example_text) */}
                <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2 uppercase">Ví dụ minh họa (Example)</label>
                    <textarea
                      className="w-full h-[100px] px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white focus:border-[#9c00e5] focus:outline-none resize-none font-mono text-sm placeholder-gray-600"
                      value={example}
                      onChange={e => setExample(e.target.value)}
                      placeholder="Nhập code mẫu hoặc ví dụ thực tế..."
                    />
                </div>
              </div>
          </div>
      </div>

      {/* === PHẦN 2: THƯ VIỆN ẢNH CHUNG === */}
      <div className="space-y-6 pt-6 border-t border-white/10 mt-10">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
             <PhotographIcon className="w-6 h-6 text-[#9c00e5]" /> Thư viện hình ảnh
          </h3>
          <p className="text-gray-400 text-sm">Upload ảnh minh họa cho bài học tại đây.</p>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
             {/* Nút Upload */}
             <label className={`aspect-square rounded-xl border-2 border-dashed border-white/20 hover:border-[#9c00e5] hover:bg-[#9c00e5]/10 flex flex-col items-center justify-center cursor-pointer transition-all group ${imgLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                <input type="file" accept="image/*" multiple onChange={handleUploadImage} className="hidden" />
                {imgLoading ? (
                    <span className="text-xs text-[#9c00e5] animate-pulse font-bold">Uploading...</span> 
                ) : (
                    <>
                        <PlusIcon className="w-8 h-8 text-gray-400 group-hover:text-[#9c00e5] mb-2"/>
                        <span className="text-xs text-gray-400 font-bold group-hover:text-white">Thêm ảnh</span>
                    </>
                )}
             </label>

             {/* Danh sách ảnh */}
             {images.map(item => (
                <div key={item.id} className="group relative aspect-square bg-black rounded-xl overflow-hidden border border-white/10 shadow-lg">
                   <img src={item.media?.url} alt="minh hoa" className="w-full h-full object-cover" />
                   
                   <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity duration-200">
                      <a href={item.media?.url} target="_blank" rel="noreferrer" className="p-2 bg-white/20 rounded-full hover:bg-white/40 transition-colors" title="Xem ảnh">
                          <ExternalLinkIcon className="w-5 h-5 text-white"/>
                      </a>
                      <button onClick={() => handleDeleteImage(item)} className="p-2 bg-red-500/20 rounded-full hover:bg-red-500 text-red-500 hover:text-white transition-colors" title="Xóa ảnh">
                          <TrashIcon className="w-5 h-5"/>
                      </button>
                   </div>
                </div>
             ))}
          </div>
      </div>

    </div>
  );
}