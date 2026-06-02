import React, { useState, useRef, useEffect } from 'react';
import { ChatAlt2Icon, XIcon, PhotographIcon, PaperAirplaneIcon } from '@heroicons/react/solid';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const AITutorChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'ai' | 'user', type: 'text' | 'image', content: string}[]>([
    { role: 'ai', type: 'text', content: 'Xin chào! Mình là AI Trợ giảng đây. Bạn có câu hỏi gì hay cần mình xem giúp đoạn code nào không?' }
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [inputText, setInputText] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAnalyzing]);

  const handleSendMessage = async (file?: File) => {
    const textToSend = inputText.trim();
    if (!textToSend && !file) return;

    // Hiển thị tin nhắn của người dùng lên UI
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setMessages(prev => [...prev, { role: 'user', type: 'image', content: imageUrl }]);
    }
    if (textToSend) {
      setMessages(prev => [...prev, { role: 'user', type: 'text', content: textToSend }]);
    }

    setInputText('');
    setIsAnalyzing(true);

    const formData = new FormData();
    if (file) {
      formData.append('image', file);
    }
    if (textToSend) {
      formData.append('message', textToSend);
    }

    // Gửi lịch sử chat (chỉ lấy text để tối ưu)
    const history = messages
      .filter(m => m.type === 'text')
      .map(m => ({ role: m.role, content: m.content }));
    formData.append('history', JSON.stringify(history));

    try {
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      const data = await res.json();
      
      if (data.success) {
        setMessages(prev => [...prev, { role: 'ai', type: 'text', content: data.answer }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', type: 'text', content: 'Ui cha, mình gặp lỗi rồi: ' + data.message }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', type: 'text', content: 'Mất kết nối với não bộ AI rồi!' }]);
    } finally {
      setIsAnalyzing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSendMessage(file);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl shadow-purple-500/30 hover:scale-110 transition-transform z-40 ${isOpen ? 'hidden' : 'block'}`}
      >
        <ChatAlt2Icon className="w-8 h-8" />
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold border-2 border-[#1a0b2e]">1</span>
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 max-h-[85vh] bg-[#1a0b2e] border border-purple-500/30 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden shadow-purple-900/50">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white shrink-0">
            <div className="flex items-center gap-2 font-bold text-lg drop-shadow-md">
              <ChatAlt2Icon className="w-6 h-6" />
              AI Trợ giảng
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto max-h-[60vh] h-[400px] bg-black/40 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-md ${msg.role === 'ai' ? 'bg-purple-900/60 text-purple-50 rounded-tl-none border border-purple-500/30' : 'bg-blue-600/60 text-blue-50 rounded-tr-none border border-blue-500/30'}`}>
                  {msg.type === 'text' ? (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  ) : (
                    <img src={msg.content} alt="Upload" className="rounded-lg max-w-full border border-white/10" />
                  )}
                </div>
              </div>
            ))}
            {isAnalyzing && (
              <div className="flex justify-start">
                <div className="bg-purple-900/60 text-purple-200 border border-purple-500/30 p-3 rounded-2xl rounded-tl-none text-sm flex gap-3 items-center shadow-md">
                  <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="animate-pulse">Đang suy nghĩ...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 bg-black/60 border-t border-purple-500/30 flex flex-col gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập tin nhắn..." 
                className="flex-1 bg-white/10 border border-white/20 text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-purple-500 transition-colors"
                disabled={isAnalyzing}
              />
              <button 
                onClick={() => handleSendMessage()}
                disabled={isAnalyzing || !inputText.trim()}
                className="p-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 disabled:opacity-50 text-white rounded-xl transition-all shadow-lg"
              >
                <PaperAirplaneIcon className="w-5 h-5 rotate-90" />
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleImageUpload}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-medium rounded-lg transition-all text-xs border border-white/10"
                disabled={isAnalyzing}
              >
                <PhotographIcon className="w-4 h-4" />
                Đính kèm ảnh code
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
