/**
 * High-performance client-side image compression and WebP conversion engine.
 * Converts heavy images (JPG, PNG, HEIC, etc., even 10MB+) into ultra-compact
 * modern WebP files (usually 20KB - 80KB) before uploading.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0 (default 0.82)
}

export interface CompressionResult {
  file: File;
  previewUrl: string;
  originalSizeKB: number;
  compressedSizeKB: number;
  savingsPercent: number;
  width: number;
  height: number;
}

export interface UploadResult {
  success: boolean;
  url: string;
  fileName: string;
  originalSizeKB: number;
  compressedSizeKB: number;
  savingsPercent: number;
  error?: string;
}

/**
 * Compresses an image File/Blob on client-side canvas and returns a WebP File.
 */
export async function compressImageToWebp(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.82 } = options;

  return new Promise((resolve, reject) => {
    // If browser doesn't support FileReader or Canvas, reject or fallback
    if (typeof window === "undefined" || !window.FileReader) {
      return reject(new Error("Browser environment required for image compression."));
    }

    const originalSizeKB = Math.round(file.size / 1024);

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file."));

    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid or corrupted image file."));

      img.onload = () => {
        let { width, height } = img;

        // Calculate proportional scale
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return reject(new Error("Could not initialize canvas context for compression."));
        }

        // High quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP Blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error("Failed to convert image to WebP format."));
            }

            const compressedSizeKB = Math.round(blob.size / 1024);
            const savingsPercent =
              originalSizeKB > 0
                ? Math.max(0, Math.round(((originalSizeKB - compressedSizeKB) / originalSizeKB) * 100))
                : 0;

            // Generate clean WebP filename
            const cleanBase = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
            const webpFileName = `${cleanBase || "image"}_${Date.now()}.webp`;

            const webpFile = new File([blob], webpFileName, {
              type: "image/webp",
              lastModified: Date.now(),
            });

            const previewUrl = URL.createObjectURL(blob);

            resolve({
              file: webpFile,
              previewUrl,
              originalSizeKB,
              compressedSizeKB,
              savingsPercent,
              width,
              height,
            });
          },
          "image/webp",
          quality
        );
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Compresses an image file to WebP and directly uploads it to /api/upload.
 */
export async function uploadCompressedImage(
  file: File,
  options?: CompressionOptions,
  onStatusChange?: (status: string) => void
): Promise<UploadResult> {
  try {
    onStatusChange?.("ইমেজ অপ্টিমাইজ ও WebP তে রূপান্তর হচ্ছে...");
    const compressed = await compressImageToWebp(file, options);

    onStatusChange?.(`সার্ভারে আপলোড হচ্ছে (${compressed.compressedSizeKB} KB)...`);
    const formData = new FormData();
    formData.append("file", compressed.file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to upload image.");
    }

    onStatusChange?.("আপলোড সফল হয়েছে!");

    return {
      success: true,
      url: data.url,
      fileName: data.fileName,
      originalSizeKB: compressed.originalSizeKB,
      compressedSizeKB: compressed.compressedSizeKB,
      savingsPercent: compressed.savingsPercent,
    };
  } catch (err: any) {
    onStatusChange?.("আপলোডে সমস্যা হয়েছে");
    return {
      success: false,
      url: "",
      fileName: "",
      originalSizeKB: Math.round(file.size / 1024),
      compressedSizeKB: 0,
      savingsPercent: 0,
      error: err.message || "Failed to upload image",
    };
  }
}
