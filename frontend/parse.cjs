const fs = require('fs');
let c = fs.readFileSync('extracted_sandbox.txt', 'utf8');
if (c.startsWith('"') && c.endsWith('"\n')) {
  c = c.slice(1, -2);
} else if (c.startsWith('"') && c.endsWith('"')) {
  c = c.slice(1, -1);
}
c = c.replace(/\\n/g, '\n').replace(/\\"/g, '"');
fs.writeFileSync('extracted_sandbox.tsx', c);
console.log('Parsed successfully');
