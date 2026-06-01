import fs from 'fs';

function fixEncoding(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Reinterpret the utf8 string as latin1 (binary), then parse as utf8
  const fixed = Buffer.from(content, 'binary').toString('utf8');
  
  if (fixed.includes('Lý') || fixed.includes('tổng quan') || fixed.includes('Mục lục') || fixed.includes('Đã nộp bài') || fixed.includes('Chưa làm')) {
      console.log(`Successfully fixed encoding for ${filePath}`);
      fs.writeFileSync(filePath, fixed, 'utf8');
  } else {
      console.log(`Could not automatically fix ${filePath} or it doesn't need fixing.`);
      // Try an alternative fix: it might be interpreted as win1252
      // Node 'binary' is actually latin1. Sometimes it's enough.
  }
}

fixEncoding('src/pages/student/StudentLessonPlayer.tsx');
fixEncoding('src/pages/teacher/LessonDetailPlayer.tsx');
