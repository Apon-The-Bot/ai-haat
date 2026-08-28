/**
 * Image binary validation and magic-byte inspection engine
 */
export function validateImageBuffer(buffer: Buffer): { valid: boolean; detectedFormat?: string; error?: string } {
  if (!buffer || buffer.length < 12) {
    return { valid: false, error: "File is empty or too small to be a valid image." };
  }

  // 1. JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, detectedFormat: "jpeg" };
  }

  // 2. PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, detectedFormat: "png" };
  }

  // 3. GIF: 47 49 46 38 (GIF87a or GIF89a)
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return { valid: true, detectedFormat: "gif" };
  }

  // 4. WEBP: RIFF....WEBP (52 49 46 46 .... 57 45 42 50)
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { valid: true, detectedFormat: "webp" };
  }

  // 5. SVG
  const headText = buffer.slice(0, 200).toString("utf-8").toLowerCase();
  if (headText.includes("<svg") || headText.includes("<?xml") && headText.includes("svg")) {
    return { valid: true, detectedFormat: "svg" };
  }

  return { valid: false, error: "Invalid file content. Real image format signature required." };
}
