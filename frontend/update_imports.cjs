const fs = require('fs');

function updateFile(path) {
  let content = fs.readFileSync(path, 'utf8');
  if (!content.includes('import { ChallengeSandbox }')) {
    content = content.replace(/import React, \{ useState, useEffect, useMemo, useRef \} from 'react';/, "import React, { useState, useEffect, useMemo, useRef } from 'react';\nimport { ChallengeSandbox } from '../../components/ChallengeSandbox';");
    fs.writeFileSync(path, content);
  }
}

updateFile('src/pages/teacher/LessonDetailPlayer.tsx');
updateFile('src/pages/student/StudentLessonPlayer.tsx');
console.log('Added imports');
