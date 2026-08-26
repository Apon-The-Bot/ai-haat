const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public', 'images');
const dirs = ['brand', 'placeholders', 'products', 'categories', 'partners', 'payments'];

dirs.forEach(d => {
  const fullPath = path.join(publicDir, d);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

// 1. Placeholder SVG
const placeholderSvg = `<svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="400" rx="16" fill="#FFF9F5"/>
  <rect x="1" y="1" width="398" height="398" rx="15" stroke="#E8E8EE" stroke-width="2"/>
  <g transform="translate(150, 130)">
    <path d="M38 12L12 76H26L45 28L54 50H42L36 64H60L65 76H78L52 12H38Z" fill="#1A1D26"/>
    <path d="M48 36H78V48H64V64H78V76H48V64H52V48H48V36Z" fill="#FC5C03"/>
    <polygon points="36,64 48,36 60,64" fill="#FC5C03"/>
  </g>
  <text x="200" y="250" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="800" fill="#1A1D26" text-anchor="middle">AI Haat</text>
  <text x="200" y="275" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600" fill="#7A8190" text-anchor="middle">PREMIUM DIGITAL PRODUCT</text>
</svg>`;
fs.writeFileSync(path.join(publicDir, 'placeholders', 'aihaat-placeholder.svg'), placeholderSvg, 'utf8');

// Helper to create branded product SVG
function createProductSvg(title, subtitle, bgGradFrom, bgGradTo, iconType, badgeText) {
  let iconSvg = '';
  if (iconType === 'chatgpt') {
    iconSvg = `
      <circle cx="200" cy="180" r="54" fill="#10A37F" fill-opacity="0.15"/>
      <circle cx="200" cy="180" r="42" fill="#10A37F"/>
      <path d="M200 156c-13.2 0-24 10.8-24 24 0 4.2 1.1 8.2 3.1 11.6l-8.7 5c-7.3-10.9-4.5-25.7 6.4-33 10.9-7.3 25.7-4.5 33 6.4h-9.8zm18 12.4c3.7 3.5 6 8.5 6 14 0 10.8-7.2 19.9-17.1 22.8v10c15.4-3.2 27.1-16.8 27.1-33.2 0-8.2-2.9-15.8-7.8-21.7l-8.2 8.1zm-36 23.6c-3.7-3.5-6-8.5-6-14 0-10.8 7.2-19.9 17.1-22.8v-10c-15.4 3.2-27.1 16.8-27.1 33.2 0 8.2 2.9 15.8 7.8 21.7l8.2-8.1z" fill="#FFFFFF"/>
    `;
  } else if (iconType === 'canva') {
    iconSvg = `
      <circle cx="200" cy="180" r="54" fill="#00C4CC" fill-opacity="0.15"/>
      <circle cx="200" cy="180" r="42" fill="#00C4CC"/>
      <path d="M185 195c-8-8-8-22 0-30s22-8 30 0l-15 15 15 15c-8 8-22 8-30 0z" fill="#FFFFFF"/>
      <path d="M196 168l12-12 12 12-6 12-12-12z" fill="#FFD700"/>
    `;
  } else if (iconType === 'capcut') {
    iconSvg = `
      <circle cx="200" cy="180" r="54" fill="#111827" fill-opacity="0.15"/>
      <rect x="155" y="135" width="90" height="90" rx="22" fill="#111827"/>
      <path d="M175 160l25 20-25 20v-40zm30 0l20 20-20 20v-40z" fill="#FFFFFF"/>
    `;
  } else if (iconType === 'gemini') {
    iconSvg = `
      <circle cx="200" cy="180" r="54" fill="#4285F4" fill-opacity="0.15"/>
      <circle cx="200" cy="180" r="42" fill="url(#geminiGrad)"/>
      <path d="M200 152c0 15.5 12.5 28 28 28-15.5 0-28 12.5-28 28 0-15.5-12.5-28-28-28 15.5 0 28-12.5 28-28z" fill="#FFFFFF"/>
    `;
  } else if (iconType === 'microsoft') {
    iconSvg = `
      <rect x="155" y="135" width="90" height="90" rx="18" fill="#F3F4F6"/>
      <rect x="165" y="145" width="32" height="32" rx="4" fill="#F25022"/>
      <rect x="203" y="145" width="32" height="32" rx="4" fill="#7FBA00"/>
      <rect x="165" y="183" width="32" height="32" rx="4" fill="#00A4EF"/>
      <rect x="203" y="183" width="32" height="32" rx="4" fill="#FFB900"/>
    `;
  } else if (iconType === 'google') {
    iconSvg = `
      <circle cx="200" cy="180" r="50" fill="#FFFFFF"/>
      <path d="M175 160h50v40h-50z" fill="#4285F4" fill-opacity="0.1"/>
      <path d="M175 165c0-11 9-20 20-20h10c11 0 20 9 20 20v30c0 11-9 20-20 20h-10c-11 0-20-9-20-20v-30z" fill="#4285F4"/>
      <circle cx="200" cy="180" r="16" fill="#FFFFFF"/>
      <circle cx="200" cy="180" r="9" fill="#EA4335"/>
    `;
  } else if (iconType === 'vpn') {
    iconSvg = `
      <circle cx="200" cy="180" r="54" fill="#3B82F6" fill-opacity="0.15"/>
      <rect x="155" y="135" width="90" height="90" rx="22" fill="#2563EB"/>
      <path d="M200 152l22 10v18c0 14-9 27-22 32-13-5-22-18-22-32v-18l22-10z" fill="#FFFFFF"/>
      <path d="M200 162v26c6-2 10-8 10-14v-9l-10-3z" fill="#93C5FD"/>
    `;
  } else if (iconType === 'giftcard') {
    iconSvg = `
      <rect x="150" y="145" width="100" height="70" rx="12" fill="#1A1D26"/>
      <rect x="150" y="160" width="100" height="12" fill="#FC5C03"/>
      <circle cx="175" cy="190" r="8" fill="#FFD700"/>
      <circle cx="188" cy="190" r="8" fill="#FE7113" fill-opacity="0.8"/>
    `;
  } else if (iconType === 'windows') {
    iconSvg = `
      <rect x="155" y="135" width="90" height="90" rx="18" fill="#0078D4"/>
      <path d="M165 145h32v32h-32zm36 0h32v32h-32zm-36 36h32v32h-32zm36 0h32v32h-32z" fill="#FFFFFF"/>
    `;
  } else if (iconType === 'idm') {
    iconSvg = `
      <circle cx="200" cy="180" r="50" fill="#0284C7"/>
      <path d="M185 165h30v15h12l-27 27-27-27h12v-15z" fill="#FFFFFF"/>
    `;
  } else if (iconType === 'anime') {
    iconSvg = `
      <circle cx="200" cy="180" r="54" fill="#F47521"/>
      <circle cx="188" cy="180" r="24" fill="#FFFFFF"/>
      <circle cx="184" cy="180" r="14" fill="#F47521"/>
    `;
  } else if (iconType === 'netflix') {
    iconSvg = `
      <rect x="155" y="135" width="90" height="90" rx="20" fill="#000000"/>
      <path d="M175 150h14v60h-14zm26 0h14v60h-14z" fill="#E50914"/>
      <path d="M175 150l40 60h-14l-40-60z" fill="#B81D24"/>
    `;
  } else if (iconType === 'gaming') {
    iconSvg = `
      <circle cx="200" cy="180" r="54" fill="#E11D48" fill-opacity="0.15"/>
      <rect x="155" y="145" width="90" height="70" rx="16" fill="#E11D48"/>
      <path d="M175 170h14v-14h6v14h14v6h-14v14h-6v-14h-14v-6zm50 2a4 4 0 110-8 4 4 0 010 8zm-8 10a4 4 0 110-8 4 4 0 010 8z" fill="#FFFFFF"/>
    `;
  } else if (iconType === 'telegram') {
    iconSvg = `
      <circle cx="200" cy="180" r="54" fill="#2AABEE"/>
      <path d="M170 180l15 6 6 19 8-10 15 11 16-36-60 10zm21 5l19-14-15 17-2 7-2-10z" fill="#FFFFFF"/>
    `;
  } else if (iconType === 'discord') {
    iconSvg = `
      <circle cx="200" cy="180" r="54" fill="#5865F2"/>
      <path d="M216 165c-6-3-12-5-18-6l-1 2c7 2 13 5 18 9-9-5-19-8-30-8s-21 3-30 8c5-4 11-7 18-9l-1-2c-6 1-12 3-18 6-11 17-14 34-13 50 8 6 16 9 24 10l3-4c-6-2-11-5-16-9 2 1 3 2 5 3 13 6 27 6 40 0 2-1 3-2 5-3-5 4-10 7-16 9l3 4c8-1 16-4 24-10 1-16-2-33-13-50zm-27 34c-4 0-7-4-7-8s3-8 7-8 7 4 7 8-3 8-7 8zm22 0c-4 0-7-4-7-8s3-8 7-8 7 4 7 8-3 8-7 8z" fill="#FFFFFF"/>
    `;
  } else {
    iconSvg = `
      <circle cx="200" cy="180" r="50" fill="#FC5C03"/>
      <path d="M185 165l30 15-30 15v-30z" fill="#FFFFFF"/>
    `;
  }

  return `<svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="400" y2="400" gradientUnits="userSpaceOnUse">
      <stop stop-color="${bgGradFrom}"/>
      <stop offset="1" stop-color="${bgGradTo}"/>
    </linearGradient>
    <linearGradient id="geminiGrad" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#4285F4"/>
      <stop offset="0.5" stop-color="#9B72CF"/>
      <stop offset="1" stop-color="#D96570"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" rx="16" fill="url(#bgGrad)"/>
  <rect x="1" y="1" width="398" height="398" rx="15" stroke="#E8E8EE" stroke-width="1.5"/>
  ${badgeText ? `
  <g transform="translate(24, 24)">
    <rect width="${badgeText.length * 9 + 16}" height="22" rx="6" fill="#1A1D26"/>
    <text x="${(badgeText.length * 9 + 16) / 2}" y="15" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="700" fill="#FFFFFF" text-anchor="middle">${badgeText}</text>
  </g>` : ''}
  ${iconSvg}
  <text x="200" y="295" font-family="system-ui, -apple-system, sans-serif" font-size="19" font-weight="800" fill="#1A1D26" text-anchor="middle">${title}</text>
  <text x="200" y="322" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600" fill="#7A8190" text-anchor="middle">${subtitle}</text>
  <g transform="translate(160, 345)">
    <rect width="80" height="20" rx="10" fill="#FFF2E8"/>
    <text x="40" y="14" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="700" fill="#FC5C03" text-anchor="middle">OFFICIAL</text>
  </g>
</svg>`;
}

// Write Product SVGs
const products = [
  { file: 'chatgpt-plus.svg', title: 'ChatGPT Plus', subtitle: 'GPT-4o & Canvas Access', from: '#F0FDF4', to: '#DCFCE7', type: 'chatgpt', badge: 'BEST PRODUCT' },
  { file: 'canva-pro.svg', title: 'Canva Pro', subtitle: 'Brand Kit & 100M+ Assets', from: '#ECFEFF', to: '#CFFAFE', type: 'canva', badge: 'BEST SELLING' },
  { file: 'capcut-pro.svg', title: 'CapCut Pro', subtitle: 'VIP 4K & Auto Captions', from: '#F9FAFB', to: '#F3F4F6', type: 'capcut', badge: 'OFFER' },
  { file: 'gemini-advanced.svg', title: 'Gemini Advanced', subtitle: '1.5 Pro & 2TB AI Storage', from: '#EEF2FF', to: '#E0E7FF', type: 'gemini', badge: 'NEW' },
  { file: 'microsoft-365.svg', title: 'Microsoft 365', subtitle: 'Office Apps + 1TB OneDrive', from: '#FFF7ED', to: '#FFEDD5', type: 'microsoft', badge: 'BEST SELLING' },
  { file: 'google-one.svg', title: 'Google One 2TB', subtitle: 'Photos & Drive Storage', from: '#EFF6FF', to: '#DBEAFE', type: 'google', badge: 'VERIFIED' },
  { file: 'youtube-premium.svg', title: 'YouTube Premium', subtitle: 'Ad-Free + Background Play', from: '#FEF2F2', to: '#FEE2E2', type: 'google', badge: 'POPULAR' },
  { file: 'google-play.svg', title: 'Google Play Gift Card', subtitle: 'US Region Instant Codes', from: '#F0FDF4', to: '#DCFCE7', type: 'giftcard', badge: 'INSTANT' },
  { file: 'google-workspace.svg', title: 'Google Workspace', subtitle: 'Custom Business Gmail', from: '#F8FAFC', to: '#F1F5F9', type: 'google', badge: 'BUSINESS' },
  { file: 'nordvpn.svg', title: 'NordVPN Ultimate', subtitle: 'Threat Protection & 10Gbps', from: '#EFF6FF', to: '#DBEAFE', type: 'vpn', badge: 'BEST VPN' },
  { file: 'expressvpn.svg', title: 'ExpressVPN Fast', subtitle: 'Lightway Protocol 105 Countries', from: '#FEF2F2', to: '#FEE2E2', type: 'vpn', badge: 'HIGH SPEED' },
  { file: 'surfshark.svg', title: 'Surfshark One', subtitle: 'CleanWeb Adblock & Unlimited', from: '#F0FDFA', to: '#CCFBF1', type: 'vpn', badge: 'OFFER' },
  { file: 'apple-gift-card.svg', title: 'Apple Gift Card US', subtitle: 'iCloud+ & App Store Redeem', from: '#FAF5FF', to: '#F3E8FF', type: 'giftcard', badge: 'INSTANT CODE' },
  { file: 'steam-wallet.svg', title: 'Steam Wallet Card', subtitle: 'Global & US Steam Codes', from: '#F8FAFC', to: '#E2E8F0', type: 'giftcard', badge: 'PC GAMING' },
  { file: 'windows-11.svg', title: 'Windows 11 Pro', subtitle: 'Genuine Retail License Key', from: '#EFF6FF', to: '#DBEAFE', type: 'windows', badge: 'LIFETIME' },
  { file: 'idm.svg', title: 'IDM Download Manager', subtitle: '1 PC Lifetime Serial Key', from: '#F0F9FF', to: '#E0F2FE', type: 'idm', badge: 'OFFICIAL' },
  { file: 'crunchyroll.svg', title: 'Crunchyroll Mega Fan', subtitle: 'Ad-Free Anime 1080p Simulcast', from: '#FFF7ED', to: '#FFEDD5', type: 'anime', badge: 'ANIME HD' },
  { file: 'netflix.svg', title: 'Netflix 4K Ultra HD', subtitle: 'Private Profile with PIN Code', from: '#18181B', to: '#09090B', type: 'netflix', badge: '4K UHD' },
  { file: 'free-fire.svg', title: 'Free Fire Diamonds', subtitle: 'Player ID UID Top-Up (1-3 min)', from: '#FFF1F2', to: '#FFE4E6', type: 'gaming', badge: 'AUTO TOPUP' },
  { file: 'pubg-mobile.svg', title: 'PUBG Mobile UC', subtitle: 'Royale Pass & UC Direct', from: '#FEFCE8', to: '#FEF9C3', type: 'gaming', badge: 'GLOBAL' },
  { file: 'telegram-premium.svg', title: 'Telegram Premium', subtitle: '4GB Uploads & Star Badge', from: '#F0F9FF', to: '#E0F2FE', type: 'telegram', badge: 'GIFT LINK' },
  { file: 'discord-nitro.svg', title: 'Discord Nitro', subtitle: '2 Server Boosts & 500MB', from: '#EEF2FF', to: '#E0E7FF', type: 'discord', badge: 'OFFER' },
];

products.forEach(p => {
  const content = createProductSvg(p.title, p.subtitle, p.from, p.to, p.type, p.badge);
  fs.writeFileSync(path.join(publicDir, 'products', p.file), content, 'utf8');
});

console.log(`Generated ${products.length} product SVG assets.`);
