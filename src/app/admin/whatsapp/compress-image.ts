const LIMIT = 5 * 1024 * 1024;

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.size <= LIMIT) return file;
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Image processing is unavailable in this browser");
    let scale = Math.min(1, 2048 / Math.max(bitmap.width, bitmap.height));
    for (let pass = 0; pass < 6; pass++) {
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(value => value ? resolve(value) : reject(new Error("Unable to compress image")), "image/jpeg", .82 - pass * .07);
      });
      if (blob.size <= LIMIT) return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", {type: "image/jpeg"});
      scale *= .72;
    }
    throw new Error("Unable to prepare this image. Please choose another image.");
  } finally {
    bitmap.close();
  }
}
