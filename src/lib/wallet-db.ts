import fs from "fs";
import path from "path";

export interface LocalUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: "ADMIN" | "USER";
  walletBalanceBDT: number;
  createdAt: string;
  updatedAt: string;
}

export interface LocalWalletTx {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  amountBDT: number;
  type: "DEPOSIT" | "PURCHASE" | "REFUND";
  method: string;
  senderNumber?: string;
  trxId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  note?: string;
  date: string;
  createdAt: string;
}

const dataDir = path.join(process.cwd(), "data");
const usersFile = path.join(dataDir, "users.json");
const walletFile = path.join(dataDir, "wallet.json");

function ensureDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify([], null, 2), "utf-8");
  }
  if (!fs.existsSync(walletFile)) {
    fs.writeFileSync(walletFile, JSON.stringify([], null, 2), "utf-8");
  }
}

export function getAllLocalUsers(): LocalUser[] {
  ensureDir();
  try {
    const raw = fs.readFileSync(usersFile, "utf-8");
    return JSON.parse(raw) || [];
  } catch {
    return [];
  }
}

export function saveLocalUsers(users: LocalUser[]) {
  ensureDir();
  try {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), "utf-8");
  } catch (err) {
    console.error("Save local users error:", err);
  }
}

export function getLocalUserByEmail(email: string): LocalUser | null {
  const users = getAllLocalUsers();
  const clean = email.toLowerCase().trim();
  return users.find((u) => u.email.toLowerCase().trim() === clean) || null;
}

export function upsertLocalUser(user: Partial<LocalUser> & { email: string }): LocalUser {
  const users = getAllLocalUsers();
  const clean = user.email.toLowerCase().trim();
  const idx = users.findIndex((u) => u.email.toLowerCase().trim() === clean);

  const isAdmin =
    clean === "mdamanullahsheikhapon@gmail.com" || clean === "admin@aihaat.com";

  const now = new Date().toISOString();

  if (idx >= 0) {
    const updated: LocalUser = {
      ...users[idx],
      ...user,
      email: clean,
      role: isAdmin ? "ADMIN" : (user.role || users[idx].role || "USER"),
      walletBalanceBDT: user.walletBalanceBDT ?? users[idx].walletBalanceBDT ?? 0,
      updatedAt: now,
    };
    users[idx] = updated;
    saveLocalUsers(users);
    return updated;
  } else {
    const created: LocalUser = {
      id: user.id || `usr_${Date.now().toString().slice(-6)}`,
      name: user.name || clean.split("@")[0],
      email: clean,
      phone: user.phone || "",
      avatar: user.avatar,
      role: isAdmin ? "ADMIN" : (user.role || "USER"),
      walletBalanceBDT: user.walletBalanceBDT || 0,
      createdAt: now,
      updatedAt: now,
    };
    users.push(created);
    saveLocalUsers(users);
    return created;
  }
}

export function creditLocalWalletBalance(email: string, amount: number): LocalUser {
  const user = upsertLocalUser({ email });
  user.walletBalanceBDT = (user.walletBalanceBDT || 0) + amount;
  return upsertLocalUser(user);
}

export function debitLocalWalletBalance(email: string, amount: number): boolean {
  const user = getLocalUserByEmail(email);
  if (!user || (user.walletBalanceBDT || 0) < amount) {
    return false;
  }
  user.walletBalanceBDT = (user.walletBalanceBDT || 0) - amount;
  upsertLocalUser(user);
  return true;
}

export function getAllLocalTransactions(): LocalWalletTx[] {
  ensureDir();
  try {
    const raw = fs.readFileSync(walletFile, "utf-8");
    return JSON.parse(raw) || [];
  } catch {
    return [];
  }
}

export function recordLocalTransaction(tx: Omit<LocalWalletTx, "id" | "date" | "createdAt"> & { id?: string }): LocalWalletTx {
  ensureDir();
  const txs = getAllLocalTransactions();
  const now = new Date();
  const dateFormatted = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const newTx: LocalWalletTx = {
    id: tx.id || `tx_${Date.now().toString().slice(-6)}`,
    ...tx,
    date: dateFormatted,
    createdAt: now.toISOString(),
  };

  txs.unshift(newTx);
  try {
    fs.writeFileSync(walletFile, JSON.stringify(txs, null, 2), "utf-8");
  } catch (err) {
    console.error("Save local tx error:", err);
  }
  return newTx;
}
