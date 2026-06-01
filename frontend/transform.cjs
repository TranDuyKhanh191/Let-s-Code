const fs = require('fs');
let content = fs.readFileSync('src/pages/student/StudentLessonPlayer.tsx', 'utf8');

// 1. Rename component
content = content.replace(/LessonDetailPlayer/g, 'StudentLessonPlayer');

// 2. Add isSubmitted state
content = content.replace(/const \[activeSection, setActiveSection\] = useState<string>\('objectives'\);/, `const [activeSection, setActiveSection] = useState<string>('objectives');\n  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);`);

// 3. Change fetch URL
content = content.replace(/fetch\(\`\$\{API_BASE\}\/lessons\/\$\{lessonId\}\`/g, 'fetch(`${API_BASE}/lessons/student/${lessonId}`');

// 4. Update fetch logic
content = content.replace(/const lessonData = Array\.isArray\(lessonJson\.data \|\| lessonJson\.lesson\) \? \(lessonJson\.data \|\| lessonJson\.lesson\)\[0\] : \(lessonJson\.data \|\| lessonJson\.lesson \|\| lessonJson\);\n          setLessonInfo\(lessonData\);/, `const lessonData = Array.isArray(lessonJson.data || lessonJson.lesson) ? (lessonJson.data || lessonJson.lesson)[0] : (lessonJson.data || lessonJson.lesson || lessonJson);
          setLessonInfo(lessonData);
          if (lessonJson.progress && typeof lessonJson.progress.status === 'string' && lessonJson.progress.status.toLowerCase().includes('nộp')) {
            setIsSubmitted(true);
          }`);

// 5. Add role="student" to ChallengeSandbox and onUploadSuccess
content = content.replace(/<ChallengeSandbox challengeId=\{chal\.id\} lessonId=\{Number\(lessonId\)\} \/>/, `<ChallengeSandbox challengeId={chal.id} lessonId={Number(lessonId)} role="student" onUploadSuccess={() => setIsSubmitted(true)} />`);

// 6. Add the badge
content = content.replace(/<div className="mb-4 relative">/, `<div className="mb-4 relative">\n                            <div className="absolute top-0 right-0">{isSubmitted ? (<span className="px-3 py-1 bg-green-100 text-green-700 border border-green-300 rounded-full text-xs font-bold shadow-sm">Đã nộp bài</span>) : (<span className="px-3 py-1 bg-red-100 text-red-700 border border-red-300 rounded-full text-xs font-bold shadow-sm">Chưa làm</span>)}</div>`);

// 7. Remove teacher's fetch submissions effect (since students can't access it)
content = content.replace(/useEffect\(\(\) => \{\n    if \(isModalOpen && lessonId\) \{\n      fetch\(\`\$\{API_BASE\}\/lessons\/\$\{lessonId\}\/submissions\`[\s\S]*?\}\n  \}, \[isModalOpen, lessonId\]\);/, '');

fs.writeFileSync('src/pages/student/StudentLessonPlayer.tsx', content, 'utf8');
console.log("Transformed StudentLessonPlayer");
