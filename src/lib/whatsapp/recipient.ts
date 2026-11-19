export function recipientAddress(input: string) {
  const raw = input.trim();
  if (/^[0-9]+(?:-[0-9]+)?@g\.us$/.test(raw) || /^\d+@lid$/.test(raw)) return raw;
  if (/^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9_-]{20,24}$/.test(raw)) return raw;
  const digits = raw.replace(/@s\.whatsapp\.net$/, "").replace(/[ ()-]/g,"");
  if (/^01[3-9]\d{8}$/.test(digits)) return "88"+digits+"@s.whatsapp.net";
  if (!/^\+?[1-9]\d{7,14}$/.test(digits)) throw new Error("Invalid WhatsApp recipient");
  return digits.replace(/^\+/,"")+"@s.whatsapp.net";
}
