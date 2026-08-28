const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Read .env.local and .env
['.env.local', '.env'].forEach(file => {
  const p = path.resolve(__dirname, '..', file);
  if (fs.existsSync(p)) {
    const lines = fs.readFileSync(p, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || '';
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
});

const prisma = new PrismaClient();

function encryptCredential(plaintext) {
  const keyHex = process.env.MFA_ENCRYPTION_KEY;
  if (!keyHex || keyHex.length !== 64) {
    throw new Error("MFA_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)");
  }
  const key = Buffer.from(keyHex, "hex");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  let encrypted = cipher.update(plaintext, "utf8", "base64");
  encrypted += cipher.final("base64");
  const authTag = cipher.getAuthTag().toString("base64");
  return `v1:${iv.toString("base64")}:${encrypted}:${authTag}`;
}

const STOCK_ITEMS = [
  // Windows 11 Pro Retail Key
  {
    productId: 'p-windows-11-pro',
    variationId: 'w2',
    type: 'LICENSE_KEY',
    payload: 'W269N-WFGWX-YVC9B-4J6C9-T83GX',
    notes: 'Official Microsoft Windows 11 Pro Retail Retail Key',
  },
  {
    productId: 'p-windows-11-pro',
    variationId: 'w2',
    type: 'LICENSE_KEY',
    payload: 'VK7JG-NPHTM-C97JM-9MPGT-3V66T',
    notes: 'Official Microsoft Windows 11 Pro Retail Key #2',
  },
  // IDM Lifetime
  {
    productId: 'p-idm-lifetime',
    variationId: 'idm1',
    type: 'LICENSE_KEY',
    payload: 'IDM-8921-AK99-PL02-LIFETIME-KEY',
    notes: 'Internet Download Manager 1 PC Lifetime Genuine Key',
  },
  // Netflix 4K UHD
  {
    productId: 'p-netflix-4k-uhd',
    variationId: 'nf1',
    type: 'ACCOUNT_CREDENTIAL',
    payload: 'Email: netflix.user48@gmail.com\nPassword: Netfl!xPass2026\nProfile: Pin #4 (PIN: 1144)',
    notes: '1 Month UHD 4K Profile 4',
  },
  // NordVPN
  {
    productId: 'p-nordvpn',
    variationId: 'nv1',
    type: 'ACCOUNT_CREDENTIAL',
    payload: 'Email: nord.vpn.user99@proton.me\nPassword: NordSecure2026!\nDedicated Profile: Device 1',
    notes: '1 Month NordVPN Secure Profile',
  },
  // Google Play Gift Card US $10
  {
    productId: 'p-google-play-card',
    variationId: 'gp2',
    type: 'LICENSE_KEY',
    payload: 'GPLAY-US10-9X2K-4M7Q-88PV',
    notes: 'Google Play $10 USD Digital Gift Card Code',
  },
  // Telegram Premium 1 Month
  {
    productId: 'p-telegram-premium',
    variationId: 'tg1',
    type: 'DOWNLOAD_LINK',
    payload: 'https://t.me/giftcode/aihaat_tg_premium_gift_884192',
    notes: 'Telegram 1 Month Official Gift Activation Link',
  },
];

async function seedStocks() {
  console.log('Seeding digital stock pool into MySQL...');

  let count = 0;
  for (const item of STOCK_ITEMS) {
    try {
      const encrypted = encryptCredential(item.payload);
      await prisma.digitalStock.create({
        data: {
          productId: item.productId,
          variationId: item.variationId,
          type: item.type,
          payloadEncrypted: encrypted,
          status: 'AVAILABLE',
          notes: item.notes,
        },
      });
      console.log(`[+] Stocked ${item.type} for ${item.productId} (${item.variationId})`);
      count++;
    } catch (e) {
      console.error(`[-] Failed to stock item:`, e.message);
    }
  }

  console.log(`\nSuccessfully loaded ${count} digital stock items into database.`);
  await prisma.$disconnect();
}

seedStocks();
