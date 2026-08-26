const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public', 'images');

// 1. Partner SVGs
const partners = [
  { name: 'OpenAI', file: 'openai.svg', color: '#10A37F' },
  { name: 'Canva', file: 'canva.svg', color: '#00C4CC' },
  { name: 'Google Cloud', file: 'google.svg', color: '#4285F4' },
  { name: 'Microsoft', file: 'microsoft.svg', color: '#00A4EF' },
  { name: 'Nord Security', file: 'nord.svg', color: '#4687FF' },
  { name: 'CapCut', file: 'capcut.svg', color: '#111827' },
  { name: 'Netflix', file: 'netflix.svg', color: '#E50914' },
  { name: 'Apple', file: 'apple.svg', color: '#555555' },
  { name: 'Steam', file: 'steam.svg', color: '#171A21' },
  { name: 'Garena', file: 'garena.svg', color: '#ED1C24' },
];

partners.forEach(p => {
  const svg = `<svg width="140" height="40" viewBox="0 0 140 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="140" height="40" rx="8" fill="#FFFFFF"/>
    <circle cx="24" cy="20" r="10" fill="${p.color}" fill-opacity="0.15"/>
    <circle cx="24" cy="20" r="5" fill="${p.color}"/>
    <text x="44" y="24" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#1A1D26">${p.name}</text>
  </svg>`;
  fs.writeFileSync(path.join(publicDir, 'partners', p.file), svg, 'utf8');
});

// 2. Payment SVGs
const payments = [
  { name: 'bKash', file: 'bkash.svg', bg: '#D12053', text: '#FFFFFF' },
  { name: 'Nagad', file: 'nagad.svg', bg: '#F7941D', text: '#FFFFFF' },
  { name: 'Rocket', file: 'rocket.svg', bg: '#8C3494', text: '#FFFFFF' },
  { name: 'Visa', file: 'visa.svg', bg: '#1A1F71', text: '#FFFFFF' },
  { name: 'Mastercard', file: 'mastercard.svg', bg: '#EB001B', text: '#FFFFFF' },
  { name: 'SSLCommerz', file: 'sslcommerz.svg', bg: '#1B365D', text: '#FFFFFF' },
];

payments.forEach(pm => {
  const svg = `<svg width="76" height="32" viewBox="0 0 76 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="76" height="32" rx="6" fill="${pm.bg}"/>
    <text x="38" y="20" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="800" fill="${pm.text}" text-anchor="middle">${pm.name}</text>
  </svg>`;
  fs.writeFileSync(path.join(publicDir, 'payments', pm.file), svg, 'utf8');
});

// 3. Brand Logo SVGs
const logoDark = `<svg width="180" height="50" viewBox="0 0 180 50" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="lhGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FE7113" />
      <stop offset="100%" stop-color="#FC5C03" />
    </linearGradient>
  </defs>
  <g transform="translate(4, 5) scale(0.44)">
    <path d="M38 12L12 76H26L45 28L54 50H42L36 64H60L65 76H78L52 12H38Z" fill="#1A1D26"/>
    <path d="M48 36H78V48H64V64H78V76H48V64H52V48H48V36Z" fill="url(#lhGrad)"/>
    <polygon points="36,64 48,36 60,64" fill="url(#lhGrad)"/>
  </g>
  <text x="48" y="32" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="900" fill="#1A1D26">AI <tspan fill="#FC5C03">Haat</tspan></text>
</svg>`;
fs.writeFileSync(path.join(publicDir, 'brand', 'logo.svg'), logoDark, 'utf8');

const logoLight = `<svg width="180" height="50" viewBox="0 0 180 50" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="lhGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FE7113" />
      <stop offset="100%" stop-color="#FC5C03" />
    </linearGradient>
  </defs>
  <g transform="translate(4, 5) scale(0.44)">
    <path d="M38 12L12 76H26L45 28L54 50H42L36 64H60L65 76H78L52 12H38Z" fill="#FFFFFF"/>
    <path d="M48 36H78V48H64V64H78V76H48V64H52V48H48V36Z" fill="url(#lhGradLight)"/>
    <polygon points="36,64 48,36 60,64" fill="url(#lhGradLight)"/>
  </g>
  <text x="48" y="32" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="900" fill="#FFFFFF">AI <tspan fill="#FC5C03">Haat</tspan></text>
</svg>`;
fs.writeFileSync(path.join(publicDir, 'brand', 'logo-light.svg'), logoLight, 'utf8');

console.log('Generated partners, payments, and brand logos successfully.');
