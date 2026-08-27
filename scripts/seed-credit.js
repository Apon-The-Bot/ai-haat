const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const usersFile = path.join(dataDir, 'users.json');
const walletFile = path.join(dataDir, 'wallet.json');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const email = 'mdamanullahsheikhapon@gmail.com';
let users = [];
try {
  users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
} catch {}

const idx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
if (idx >= 0) {
  users[idx].walletBalanceBDT = 2000;
} else {
  users.push({
    id: 'usr_apon_admin',
    name: 'Md. Amanullah Sheikh Apon',
    email: email,
    role: 'ADMIN',
    walletBalanceBDT: 2000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}
fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf8');

let txs = [];
try {
  txs = JSON.parse(fs.readFileSync(walletFile, 'utf8'));
} catch {}

txs.unshift({
  id: 'tx_KKQ3TEYT7D',
  userId: 'usr_apon_admin',
  userEmail: email,
  userName: 'Md. Amanullah Sheikh Apon',
  amountBDT: 2000,
  type: 'DEPOSIT',
  method: 'bKash (Gateway)',
  trxId: 'KKQ3TEYT7D',
  status: 'APPROVED',
  note: 'bKash Payment Verified (KKQ3TEYT7D)',
  date: 'Aug 27, 2026',
  createdAt: new Date().toISOString(),
});
fs.writeFileSync(walletFile, JSON.stringify(txs, null, 2), 'utf8');

console.log('✓ Successfully recorded 2000 BDT credit for', email);
