import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

function encryptionKey() {
  const value = process.env.WHATSAPP_SESSION_KEY;
  if (!value || !/^[a-f0-9]{64}$/i.test(value)) {
    throw new Error("Configure WHATSAPP_SESSION_KEY with a 32-byte hex key");
  }
  return Buffer.from(value, "hex");
}

export function sealSession(accountId: string, recordId: string, data: Buffer) {
  const nonce = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), nonce);
  cipher.setAAD(Buffer.from(JSON.stringify([accountId, recordId])));
  const body = Buffer.concat([cipher.update(data), cipher.final()]);
  return Buffer.concat([nonce, cipher.getAuthTag(), body]);
}

export function openSession(accountId: string, recordId: string, encrypted: Buffer) {
  const cipher = createDecipheriv("aes-256-gcm", encryptionKey(), encrypted.subarray(0, 12));
  cipher.setAAD(Buffer.from(JSON.stringify([accountId, recordId])));
  cipher.setAuthTag(encrypted.subarray(12, 28));
  return Buffer.concat([cipher.update(encrypted.subarray(28)), cipher.final()]);
}
