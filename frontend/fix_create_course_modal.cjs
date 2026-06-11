const fs = require('fs');
const path = require('path');

const file = 'src/components/admin/CreateCourseModal.tsx';
const filePath = path.join(__dirname, file);

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix modal container
  content = content.replace(/bg-gradient-to-br from-\[#2a1b3d\] to-\[#1f1428\] border border-\[#9c00e5\]\/20/g, 'bg-bg-card border border-color-border');
  content = content.replace(/bg-gradient-to-r from-\[#2a1b3d\] to-\[#1f1428\]/g, 'bg-black/5');
  content = content.replace(/border-b border-\[#9c00e5\]\/20/g, 'border-b border-color-border');
  
  // Fix labels
  content = content.replace(/text-gray-400/g, 'text-text-secondary');
  
  // Fix text-white
  content = content.replace(/text-white/g, 'text-text-primary');

  // Fix inputs/selects/textareas
  content = content.replace(/bg-white\/5 border border-white\/10/g, 'bg-white dark:bg-[#1f1428] border border-gray-300 dark:border-[#9c00e5]/50');
  content = content.replace(/bg-\[#1f1428\] border border-white\/10/g, 'bg-white dark:bg-[#1f1428] border border-gray-300 dark:border-[#9c00e5]/50');
  
  // Fix input text color explicitly
  content = content.replace(/text-text-primary bg-white/g, 'text-gray-900 dark:text-white bg-white');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated contrast for ${file}`);
}
