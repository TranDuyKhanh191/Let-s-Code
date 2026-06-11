const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/pages/auth/LoginPage.tsx',
  'src/pages/auth/ForgotPasswordPage.tsx',
  'src/pages/auth/ResetPasswordPage.tsx',
  'src/pages/auth/VerifyOtpPage.tsx'
];

for (const file of filesToFix) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove text-gray-900 from the inactive state
    content = content.replace(/border-gray-100 hover:border-gray-200 text-gray-900/g, 'border-gray-100 hover:border-gray-200');
    
    // Add text-gray-900 to the base classes
    content = content.replace(/bg-gray-50\/50 outline-none/g, 'bg-gray-50/50 outline-none text-gray-900');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed contrast on focus for ${file}`);
  }
}
