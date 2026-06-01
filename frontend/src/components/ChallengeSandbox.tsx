import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudUploadIcon, DocumentIcon, CheckCircleIcon, XIcon, UserCircleIcon, PlayIcon, DownloadIcon, ExternalLinkIcon, DesktopComputerIcon } from '@heroicons/react/solid';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const ChallengeSandbox = ({ lessonId, challengeId, role = 'teacher', onUploadSuccess }: { lessonId?: number | string, challengeId: number, role?: 'teacher' | 'student', onUploadSuccess?: () => void }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (isModalOpen && role === 'teacher' && lessonId) {
      fetch(`${API_BASE}/lessons/${lessonId}/submissions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSubmissions(data.data);
        }
      }).catch(console.error);
    }
  }, [isModalOpen, lessonId, role]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    setIsUploading(true);
    setUploadProgress(0);
    setUploadSuccess(false);

    // Simulate progress
    const interval = setInterval(() => {
      setUploadProgress(p => p < 90 ? p + 10 : p);
    }, 100);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('challenge_id', challengeId.toString());
    if (lessonId) formData.append('lesson_id', lessonId.toString());

    try {
      // 1. Upload file
      const uploadRes = await fetch(`${API_BASE}/media/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      const uploadData = await uploadRes.json();
      
      if (!uploadRes.ok || !uploadData.media) {
        throw new Error(uploadData.error || uploadData.message || 'Lỗi khi upload file');
      }

      // 2. Submit lesson
      const submitRes = await fetch(`${API_BASE}/lessons/student/${lessonId}/submit`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ fileUrl: uploadData.media.url })
      });
      
      clearInterval(interval);
      setUploadProgress(100);
      const data = await submitRes.json();
      
      if (data.success) {
        setUploadSuccess(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        if (onUploadSuccess) onUploadSuccess();
      } else {
        alert(data.message || 'Lỗi khi nộp bài');
      }
    } catch (error: any) {
      clearInterval(interval);
      console.error(error);
      alert(error.message || 'Lỗi kết nối khi nộp bài');
    } finally {
      setIsUploading(false);
    }
  }, [challengeId, lessonId, onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/octet-stream': ['.llsp3'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  return (
    <div className="mt-8 p-6 lg:p-8 bg-gradient-to-br from-[#1a0b2e] to-[#2a1b3d] rounded-3xl border border-[#ffe400]/30 shadow-2xl relative overflow-hidden group">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#9c00e5]/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-[#9c00e5]/30 transition-colors duration-700"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ffe400]/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none group-hover:bg-[#ffe400]/20 transition-colors duration-700"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4 mb-3">
            <div className="p-3 bg-gradient-to-br from-[#ffe400] to-[#ffbd3f] rounded-2xl shadow-lg shadow-yellow-500/20 rotate-3 group-hover:rotate-6 transition-transform">
              <DesktopComputerIcon className="w-8 h-8 text-black" />
            </div>
            <h3 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-wider drop-shadow-md">Trạm lập trình <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe400] to-[#ff862d]">LEGO</span></h3>
          </div>
          <p className="text-gray-300 font-medium leading-relaxed text-sm md:text-base max-w-2xl">
            Kết nối với ứng dụng SPIKE Web App để viết code điều khiển robot. Sau khi hoàn thành thử thách, hãy xuất file dự án (.llsp3) hoặc hình ảnh để nộp bài nhé!
          </p>
        </div>
        
        <div className="w-full md:w-auto flex flex-col gap-3 shrink-0">
          <a 
            href="https://spike.legoeducation.com/" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#ffe400] to-[#ffbd3f] text-black font-black uppercase tracking-widest rounded-2xl shadow-[0_0_20px_rgba(255,228,0,0.3)] hover:shadow-[0_0_30px_rgba(255,228,0,0.5)] hover:scale-105 active:scale-95 transition-all group/btn"
          >
            Mở SPIKE App <ExternalLinkIcon className="w-5 h-5 group-hover/btn:-translate-y-1 group-hover/btn:translate-x-1 transition-transform" />
          </a>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-white/5 text-white font-bold border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/30 hover:shadow-lg transition-all"
          >
            {role === 'teacher' ? (
              <>Xem bài nộp <UserCircleIcon className="w-5 h-5 text-blue-400" /></>
            ) : (
              <>Nộp bài làm <CloudUploadIcon className="w-5 h-5 text-green-400" /></>
            )}
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1a0b2e] w-full max-w-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/20">
              <h3 className="text-xl font-black text-white">
                {role === 'teacher' ? 'Danh sách học sinh nộp bài' : 'Nộp bài thực hành'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 transition-colors rounded-full hover:text-white hover:bg-white/10">
                <XIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8">
              {role === 'teacher' ? (
                <div className="space-y-4">
                  {submissions.length === 0 ? (
                    <div className="py-8 text-center text-gray-400">Chưa có học sinh nào nộp bài.</div>
                  ) : (
                    submissions.map((sub, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-xl bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-full bg-blue-500/20 text-blue-400">
                            <UserCircleIcon className="w-8 h-8" />
                          </div>
                          <div>
                            <div className="font-bold text-white text-lg">{sub.student?.full_name || sub.student?.display_name || 'Học sinh'}</div>
                            <div className="text-xs text-green-400 mt-1 flex items-center gap-1">
                               <CheckCircleIcon className="w-4 h-4" /> Đã nộp lúc: {new Date(sub.updated_at).toLocaleString('vi-VN')}
                            </div>
                          </div>
                        </div>
                        <a href={sub.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white transition-all bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95">
                          <DownloadIcon className="w-4 h-4" /> Tải về
                        </a>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div 
                  {...getRootProps()} 
                  className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer ${
                    isDragActive ? 'border-blue-500 bg-blue-500/10' : 
                    uploadSuccess ? 'border-green-500 bg-green-500/10' : 
                    'border-gray-600 hover:border-blue-400 hover:bg-white/5'
                  }`}
                >
                  <input {...getInputProps()} />
                  
                  {isUploading ? (
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                      <div className="text-lg font-bold text-blue-400">Đang tải lên... {uploadProgress}%</div>
                    </div>
                  ) : uploadSuccess ? (
                    <div className="flex flex-col items-center justify-center space-y-4 animate-bounce">
                      <div className="relative">
                        <div className="absolute inset-0 bg-green-500 blur-xl opacity-30 rounded-full"></div>
                        <CheckCircleIcon className="w-24 h-24 text-green-500 relative z-10" />
                      </div>
                      <div className="text-2xl font-black text-green-400">Nộp bài thành công!</div>
                      <p className="text-gray-300">Giáo viên đã có thể xem bài của bạn.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-4 text-gray-400">
                      <div className="p-6 bg-white/5 rounded-full mb-2">
                        <CloudUploadIcon className={`w-16 h-16 transition-colors ${isDragActive ? 'text-blue-500' : 'text-gray-500'}`} />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-white mb-2">Kéo thả file vào đây</p>
                        <p className="text-sm">Hoặc click để chọn file từ máy tính</p>
                      </div>
                      <div className="px-5 py-2.5 mt-4 text-xs font-bold tracking-widest text-blue-400 uppercase border border-blue-500/30 rounded-full bg-blue-500/10 flex flex-wrap justify-center gap-2">
                        Hỗ trợ: LEGO SPIKE (.llsp3), Ảnh (.png, .jpg)
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {role === 'student' && !uploadSuccess && !isUploading && (
              <div className="p-4 border-t border-white/10 bg-black/40 text-center text-sm font-medium text-yellow-500 flex items-center justify-center gap-2">
                <CheckCircleIcon className="w-5 h-5" /> Hãy lưu file dự án từ ứng dụng LEGO SPIKE trước khi nộp.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

