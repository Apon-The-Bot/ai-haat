const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '..', 'public', 'images', 'icons');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

// 1. ChatGPT Icon
const chatgptSvg = `<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="80" height="80" rx="20" fill="url(#cgGrad)"/>
  <defs>
    <linearGradient id="cgGrad" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
      <stop stop-color="#10A37F"/>
      <stop offset="1" stop-color="#0A7C5F"/>
    </linearGradient>
  </defs>
  <g transform="translate(18, 18) scale(1.1)">
    <path d="M38.5 17.5c-.8-4.5-4.2-7.8-8.7-8.4-4.8-.7-9.5 1.7-11.6 5.9-2.7-.8-5.7-.3-8 1.4-3 2.2-4.5 5.9-3.9 9.6-3.8 2.2-5.7 6.7-4.6 11 1.2 4.7 5.3 8 10.1 8.2.8 4.5 4.2 7.8 8.7 8.4 4.8.7 9.5-1.7 11.6-5.9 2.7.8 5.7.3 8-1.4 3-2.2 4.5-5.9 3.9-9.6 3.8-2.2 5.7-6.7 4.6-11-1.2-4.7-5.3-8-10.1-8.2z" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="20" cy="20" r="4" fill="#FFFFFF"/>
  </g>
</svg>`;
fs.writeFileSync(path.join(iconsDir, 'chatgpt.svg'), chatgptSvg, 'utf8');

// 2. Canva Icon
const canvaSvg = `<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="80" height="80" rx="20" fill="url(#canvaGrad)"/>
  <defs>
    <linearGradient id="canvaGrad" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
      <stop stop-color="#00C4CC"/>
      <stop offset="0.5" stop-color="#4C6EF5"/>
      <stop offset="1" stop-color="#7D2AE8"/>
    </linearGradient>
  </defs>
  <text x="40" y="52" font-family="'Brush Script MT', 'Segoe UI', cursive, sans-serif" font-size="34" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Canva</text>
  <path d="M56 22l4 7-6-2-4 5 1-6-5-3 6-1 2-6 2 6z" fill="#FFD700"/>
</svg>`;
fs.writeFileSync(path.join(iconsDir, 'canva.svg'), canvaSvg, 'utf8');

// 3. CapCut Icon
const capcutSvg = `<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="80" height="80" rx="20" fill="#111827"/>
  <rect x="1.5" y="1.5" width="77" height="77" rx="18.5" stroke="#374151" stroke-width="2"/>
  <g transform="translate(18, 18)">
    <path d="M8 12l14 10-14 10V12zm16 0l14 10-14 10V12z" fill="#FFFFFF"/>
    <circle cx="8" cy="12" r="3" fill="#00F0FF"/>
    <circle cx="8" cy="32" r="3" fill="#FF007A"/>
  </g>
  <rect x="25" y="56" width="30" height="12" rx="4" fill="#FC5C03"/>
  <text x="40" y="65" font-family="system-ui, sans-serif" font-size="8" font-weight="900" fill="#FFFFFF" text-anchor="middle">PRO</text>
</svg>`;
fs.writeFileSync(path.join(iconsDir, 'capcut.svg'), capcutSvg, 'utf8');

// 4. Gemini Icon
const geminiSvg = `<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="80" height="80" rx="20" fill="url(#gmGrad)"/>
  <defs>
    <linearGradient id="gmGrad" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
      <stop stop-color="#1E3A8A"/>
      <stop offset="0.5" stop-color="#4F46E5"/>
      <stop offset="1" stop-color="#9333EA"/>
    </linearGradient>
  </defs>
  <path d="M40 18c0 12.15 9.85 22 22 22-12.15 0-22 9.85-22 22 0-12.15-9.85-22-22-22 12.15 0 22-9.85 22-22z" fill="#FFFFFF"/>
  <path d="M52 24c0 4.4 3.6 8 8 8-4.4 0-8 3.6-8 8 0-4.4-3.6-8-8-8 4.4 0 8-3.6 8-8z" fill="#FBBF24"/>
</svg>`;
fs.writeFileSync(path.join(iconsDir, 'gemini.svg'), geminiSvg, 'utf8');

// 5. Microsoft 365 Icon
const msSvg = `<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="80" height="80" rx="20" fill="#FFFFFF"/>
  <rect x="1.5" y="1.5" width="77" height="77" rx="18.5" stroke="#E5E7EB" stroke-width="2"/>
  <g transform="translate(20, 20)">
    <rect x="0" y="0" width="18" height="18" rx="3" fill="#F25022"/>
    <rect x="22" y="0" width="18" height="18" rx="3" fill="#7FBA00"/>
    <rect x="0" y="22" width="18" height="18" rx="3" fill="#00A4EF"/>
    <rect x="22" y="22" width="18" height="18" rx="3" fill="#FFB900"/>
  </g>
</svg>`;
fs.writeFileSync(path.join(iconsDir, 'microsoft.svg'), msSvg, 'utf8');

// 6. NordVPN Icon
const nordSvg = `<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="80" height="80" rx="20" fill="url(#nordGrad)"/>
  <defs>
    <linearGradient id="nordGrad" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
      <stop stop-color="#4687FF"/>
      <stop offset="1" stop-color="#1B5BFF"/>
    </linearGradient>
  </defs>
  <g transform="translate(18, 18) scale(1.1)">
    <path d="M20 6l16 7v13c0 10-7 18-16 21-9-3-16-11-16-21V13l16-7z" fill="#FFFFFF"/>
    <path d="M20 12l10 5v9c0 6-4 12-10 14-6-2-10-8-10-14v-9l10-5z" fill="#1B5BFF"/>
    <path d="M20 16l6 3v6c0 4-2 7-6 9-4-2-6-5-6-9v-6l6-3z" fill="#FFFFFF"/>
  </g>
</svg>`;
fs.writeFileSync(path.join(iconsDir, 'nordvpn.svg'), nordSvg, 'utf8');

console.log('Created dedicated app icons in /public/images/icons/');
