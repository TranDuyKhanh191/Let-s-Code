const fs = require('fs');

let content = fs.readFileSync('src/pages/student/StudentLessonPlayer.tsx', 'utf8');

// The problematic string is ["Nï¿½"i dung ï¿½ ang cáº­p nháº­t..."]
// We will replace this entire line or just fix the quotes
content = content.replace(/return \["Nï¿½"i dung ï¿½ ang cáº\xadp nháº\xadt\.\.\."\];/, 'return ["Nội dung đang cập nhật..."];');

// Let's also check for any other double quotes inside strings that might break syntax
// For now, this is the main compilation error.
fs.writeFileSync('src/pages/student/StudentLessonPlayer.tsx', content, 'utf8');
console.log('Fixed quotes');
