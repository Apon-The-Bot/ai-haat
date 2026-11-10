"use client";

import Image, { ImageProps } from "next/image";

export interface AdaptiveImageProps extends Omit<ImageProps, "src" | "alt" | "onError"> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  containerClassName?: string;
  aspectRatio?: "1/1" | "16/9" | "4/3" | "auto";
  objectFit?: "cover" | "contain";
  showSkeleton?: boolean;
  imageRole?: "product" | "thumbnail" | "banner" | "logo" | "avatar";
}

const PLACEHOLDER = "/images/placeholders/aihaat-placeholder.svg";

function normalizeLegacyPath(src: string, fallbackSrc: string) {
  if (src === "/images/products/chatgpt.png" || src === "/images/products/chatgpt.svg") {
    return "/images/products/chatgpt-plus.svg";
  }
  if (src === "/images/test.svg") return fallbackSrc;
  return src;
}

export function AdaptiveImage({
  src,
  alt,
  fallbackSrc = PLACEHOLDER,
  containerClassName = "",
  aspectRatio = "1/1",
  objectFit = "cover",
  showSkeleton = true,
  fill = true,
  width,
  height,
  sizes,
  className = "",
  ...rest
}: AdaptiveImageProps) {
  const normalizedSrc = normalizeLegacyPath(src, fallbackSrc);
  const aspectClass = aspectRatio === "1/1" ? "aspect-square" : aspectRatio === "16/9" ? "aspect-video" : aspectRatio === "4/3" ? "aspect-[4/3]" : "";
  const objectClass = objectFit === "contain" ? "object-contain" : "object-cover";
  const imageSizes = sizes || "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw";

  return (
    <div className={`relative overflow-hidden bg-gray-50/60 ${aspectClass} ${containerClassName}`}>
      {showSkeleton && <div className="absolute inset-0 animate-pulse bg-gray-100" aria-hidden="true" />}
      <Image
        {...rest}
        src={normalizedSrc}
        alt={alt || "AI Haat Digital Product"}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={imageSizes}
        className={`relative transition-opacity duration-300 ${objectClass} ${className}`}
        onError={(event) => {
          const image = event.currentTarget as HTMLImageElement;
          if (image.src.endsWith(fallbackSrc)) return;
          image.src = fallbackSrc;
        }}
      />
    </div>
  );
}

export default AdaptiveImage;
