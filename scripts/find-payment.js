const fs = require('fs');
const content = fs.readFileSync('C:/Users/mdama/OneDrive/Desktop/Pipra Pay/PipraPay-main/index.php', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('case $path_payment') || line.includes('pp_gateways')) {
    console.log(idx + 1, line);
  }
});
