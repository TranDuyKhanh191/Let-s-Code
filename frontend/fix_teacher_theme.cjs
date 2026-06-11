const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/components/layout/Footer.tsx',
  'src/pages/teacher/CoursesPage.tsx',
  'src/pages/teacher/LessonDetailPlayer.tsx',
  'src/pages/teacher/LessonPage.tsx',
  'src/pages/teacher/ProfilePage.tsx',
  'src/pages/teacher/ProgramSelectionPage.tsx'
];

for (const file of filesToFix) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Thay đổi container nền
  content = content.replace(/bg-\[#0f0518\]/g, 'bg-bg-main');
  content = content.replace(/bg-\[#1a0b2e\]/g, 'bg-bg-card');
  content = content.replace(/bg-\[#130725\]/g, 'bg-bg-main');
  content = content.replace(/bg-\[#120822\]/g, 'bg-bg-card');
  content = content.replace(/bg-lc-bg-dark/g, 'bg-bg-card');
  
  // 2. Thay đổi viền chung
  content = content.replace(/border-white\/10/g, 'border-color-border');
  content = content.replace(/border-white\/5/g, 'border-color-border');
  
  // 3. Thay đổi màu chữ chung của trang (text-slate-200 -> text-text-primary)
  content = content.replace(/text-slate-200/g, 'text-text-primary');

  // 4. FIX INPUTS
  // Tìm tất cả các <input ... className="..."> và <textarea ...> và thay thế text-white thành text-gray-900 dark:text-white
  // Đổi bg-transparent thành bg-transparent text-gray-900 dark:text-white
  content = content.replace(/<input([^>]*?)text-white([^>]*?)>/g, '<input$1text-gray-900 dark:text-white$2>');
  content = content.replace(/<textarea([^>]*?)text-white([^>]*?)>/g, '<textarea$1text-gray-900 dark:text-white$2>');
  
  // Cụ thể cho thẻ input ở CoursesPage và LessonPage
  content = content.replace(/className="w-full py-2\.5 pr-6 text-sm font-bold text-white/g, 'className="w-full py-2.5 pr-6 text-sm font-bold text-gray-900 dark:text-white');
  
  // Đối với select
  content = content.replace(/<select([^>]*?)text-white([^>]*?)>/g, '<select$1text-gray-900 dark:text-white$2>');

  // 5. Cập nhật các ô tìm kiếm nền trắng trong sáng/tối
  content = content.replace(/bg-white\/5 border border-color-border rounded-xl pl-10 pr-4 py-3 text-sm text-white/g, 'bg-black/5 dark:bg-white/5 border border-color-border rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-white');

  // 6. Màu văn bản tĩnh text-gray-400, text-gray-300 ở những nơi an toàn:
  content = content.replace(/text-gray-400 hover:text-white/g, 'text-text-secondary hover:text-text-primary');
  content = content.replace(/text-gray-300 hover:text-white/g, 'text-text-secondary hover:text-text-primary');
  content = content.replace(/text-gray-500 uppercase/g, 'text-text-secondary uppercase');

  // 7. Sửa màu cho các hộp (cards) trong ProfilePage (nếu có)
  // ProfilePage có các khối nhập liệu
  if (file.includes('ProfilePage')) {
    content = content.replace(/bg-white\/5 border border-white\/10 text-white/g, 'bg-black/5 dark:bg-white/5 border border-color-border text-gray-900 dark:text-white');
  }

  // 8. Đảm bảo dropdown filter có màu đúng
  content = content.replace(/bg-\[#0f0518\]\/95/g, 'bg-bg-card');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated theme classes for ${file}`);
}
