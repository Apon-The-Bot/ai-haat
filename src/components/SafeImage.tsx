"use client";

import React, { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";

interface SafeImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string;
  containerClassName?: string;
  aspectRatio?: "1/1" | "16/9" | "4/3" | "auto";
  objectFit?: "cover" | "contain";
  showSkeleton?: boolean;
}

export function SafeImage({
  src,
  alt,
  fallbackSrc = "/images/placeholders/aihaat-placeholder.svg",
  className = "",
  containerClassName = "",
  aspectRatio = "1/1",
  objectFit = "cover",
  showSkeleton = true,
  fill = true,
  width,
  height,
  priority = false,
  sizes,
  ...rest
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(typeof src === "string" ? src : fallbackSrc);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (typeof src === "string" && src) {
      setImgSrc(src);
      setHasError(false);
      setIsLoading(true);
    }
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[SafeImage] Failed to load image: ${src}. Falling back to: ${fallbackSrc}`);
      }
      setHasError(true);
      setImgSrc(fallbackSrc);
      setIsLoading(false);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const aspectClass =
    aspectRatio === "1/1"
      ? "aspect-square"
      : aspectRatio === "16/9"
      ? "aspect-video"
      : aspectRatio === "4/3"
      ? "aspect-[4/3]"
      : "";

  return (
    <div
      className={`relative overflow-hidden bg-gray-50 ${aspectClass} ${containerClassName}`}
    >
      {/* Skeleton Shimmer */}
      {showSkeleton && isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse z-10" />
      )}

      <Image
        src={imgSrc || fallbackSrc}
        alt={alt || "AI Haat Digital Product"}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        priority={priority}
        sizes={sizes || "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"}
        onError={handleError}
        onLoad={handleLoad}
        className={`transition-opacity duration-200 ${
          isLoading ? "opacity-0" : "opacity-100"
        } ${objectFit === "contain" ? "object-contain" : "object-cover"} ${className}`}
        {...rest}
      />
    </div>
  );
}
