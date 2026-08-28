const fs = require('fs');
const [,, targetPath, sourceTmp] = process.argv;
const content = fs.readFileSync(sourceTmp, 'utf8');
fs.writeFileSync(targetPath, content, 'utf8');
fs.unlinkSync(sourceTmp);
console.log('Successfully wrote', targetPath);