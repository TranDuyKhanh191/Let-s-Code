const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/components/admin/AssignmentModal.tsx',
  'src/pages/admin/AssignCoursesPage.tsx',
  'src/pages/admin/AssignStudentCoursesPage.tsx'
];

for (const file of filesToFix) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Fix modal containers (from-[#2a1b3d] to-[#1f1428], or [#1f1129])
    content = content.replace(/bg-gradient-to-br from-\[#2a1b3d\] to-\[#1f1428\] border border-\[#9c00e5\]\/20/g, 'bg-bg-card border border-color-border');
    content = content.replace(/bg-gradient-to-r from-\[#2a1b3d\] to-\[#1f1428\]/g, 'bg-black/5');
    content = content.replace(/bg-\[#1f1129\] border border-\[#9c00e5\]\/20/g, 'bg-bg-card border border-color-border');
    content = content.replace(/border-b border-\[#9c00e5\]\/20/g, 'border-b border-color-border');

    // 2. Fix Text & Labels
    content = content.replace(/text-gray-400/g, 'text-text-secondary');
    content = content.replace(/text-white/g, 'text-text-primary');

    // 3. Fix Inputs/Selects
    content = content.replace(/bg-white\/5 border border-white\/10/g, 'bg-white dark:bg-[#1f1428] border border-gray-300 dark:border-[#9c00e5]/50');
    content = content.replace(/bg-black\/20 border border-white\/10/g, 'bg-white dark:bg-[#1f1428] border border-gray-300 dark:border-[#9c00e5]/50');
    content = content.replace(/bg-\[#1a0b2e\]/g, 'bg-white dark:bg-[#1f1428]');
    content = content.replace(/bg-white\/10 border border-white\/10/g, 'bg-black/5 dark:bg-[#1f1428] border border-gray-300 dark:border-[#9c00e5]/50');
    
    // Fix Input Text Color Explicitly
    content = content.replace(/text-text-primary bg-white/g, 'text-gray-900 dark:text-white bg-white');

    // 4. Fix buttons
    content = content.replace(/text-gray-300 transition-colors border rounded-lg bg-white\/5 border-white\/10 hover:text-text-primary/g, 'text-text-secondary border border-color-border rounded-lg bg-bg-card hover:text-text-primary transition-colors');
    content = content.replace(/text-gray-300 border rounded-lg bg-white\/5 border-white\/10 hover:text-text-primary/g, 'text-text-secondary border border-color-border rounded-lg bg-bg-card hover:text-text-primary transition-colors');
    content = content.replace(/border-t border-white\/10/g, 'border-t border-color-border');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated contrast for ${file}`);
  }
}
