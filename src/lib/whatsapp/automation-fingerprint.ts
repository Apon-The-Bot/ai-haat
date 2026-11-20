import { createHmac } from "node:crypto";

// The verifier provides canonical E.164 and a dedicated 256-bit secret. This
// helper derives a lookup fingerprint and does not prove address ownership.
export function fingerprintWhatsAppAddress(canonicalAddress: string, key: Buffer): string {
  if (!/^\+[1-9][0-9]{1,14}$/.test(canonicalAddress) || key.byteLength !== 32) {
    throw new Error("Invalid WhatsApp fingerprint input");
  }
  return createHmac("sha256", key)
    .update("aihaat:whatsapp:address:v1\0")
    .update(canonicalAddress)
    .digest("hex");
}
