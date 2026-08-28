import fs from "fs";
import path from "path";
import { ProductRequestItem } from "@/types";

const dataDir = path.join(process.cwd(), "data");
const requestsFile = path.join(dataDir, "product-requests.json");

function ensureDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(requestsFile)) {
    fs.writeFileSync(requestsFile, JSON.stringify([], null, 2), "utf-8");
  }
}

export function getAllProductRequests(): ProductRequestItem[] {
  ensureDir();
  try {
    const raw = fs.readFileSync(requestsFile, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as ProductRequestItem[];
    }
    return [];
  } catch (err) {
    console.warn("Failed to read fallback product-requests.json:", err);
    return [];
  }
}

export function saveProductRequest(req: ProductRequestItem): ProductRequestItem {
  ensureDir();
  const all = getAllProductRequests();
  const index = all.findIndex((r) => r.id === req.id);
  if (index >= 0) {
    all[index] = { ...all[index], ...req, updatedAt: new Date().toISOString() };
  } else {
    all.unshift(req);
  }

  try {
    fs.writeFileSync(requestsFile, JSON.stringify(all, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to write to product-requests.json fallback:", e);
  }
  return req;
}

export function findProductRequestsByUser(emailOrUserId: string): ProductRequestItem[] {
  const all = getAllProductRequests();
  const clean = emailOrUserId.toLowerCase().trim();
  return all.filter((r) => {
    const userMatch = r.userId && r.userId.toLowerCase() === clean;
    const emailMatch = r.customerEmail && r.customerEmail.toLowerCase() === clean;
    const contactMatch = r.contact && r.contact.toLowerCase().includes(clean);
    return userMatch || emailMatch || contactMatch;
  });
}
