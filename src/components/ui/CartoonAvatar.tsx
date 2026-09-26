/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { getGenderAvatar } from "@/utils/avatarHelper";

interface CartoonAvatarProps {
  name: string;
  gender?: "male" | "female";
  seed?: string | number;
  size?: number;
  className?: string;
  rounded?: "full" | "xl" | "2xl";
  showOnlineDot?: boolean;
  showProductBadge?: boolean;
  productImage?: string;
  productName?: string;
}

export function CartoonAvatar({
  name,
  gender,
  seed,
  size = 48,
  className = "",
  rounded = "2xl",
  showOnlineDot = true,
  showProductBadge = false,
  productImage,
  productName,
}: CartoonAvatarProps) {
  const [hasError, setHasError] = useState(false);
  const avatarInfo = getGenderAvatar(name, gender, seed);

  const roundedClass =
    rounded === "full"
      ? "rounded-full"
      : rounded === "xl"
      ? "rounded-xl"
      : "rounded-2xl";

  const firstLetter = (name.trim().charAt(0) || "U").toUpperCase();

  return (
    <div
      className={`relative shrink-0 select-none ${roundedClass} ${className}`}
      style={{ width: size, height: size }}
    >
      <div
        className={`w-full h-full overflow-hidden ${roundedClass} bg-gradient-to-tr from-gray-100 to-gray-50 border border-gray-100/90 shadow-2xs flex items-center justify-center`}
      >
        {!hasError ? (
          /* Using standard unoptimized img for instant 0ms local SVG rendering without next/image remote/optimization overhead */
          <img
            src={avatarInfo.avatarPath}
            alt={`${name} Avatar`}
            width={size}
            height={size}
            className="w-full h-full object-cover"
            onError={() => setHasError(true)}
            loading="eager"
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center font-black text-white ${
              avatarInfo.gender === "female"
                ? "bg-gradient-to-tr from-rose-500 to-pink-400"
                : "bg-gradient-to-tr from-sky-600 to-indigo-500"
            }`}
            style={{ fontSize: Math.max(12, Math.floor(size * 0.4)) }}
          >
            {firstLetter}
          </div>
        )}
      </div>

      {/* Pulsing Live Online Dot */}
      {showOnlineDot && (
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 pointer-events-none">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#22C55E] border-2 border-white shadow-xs" />
        </span>
      )}

      {/* Tiny Product Thumbnail Badge (Corner Overlap) */}
      {showProductBadge && productImage && (
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-md bg-white border border-gray-200/80 shadow-xs p-0.5 overflow-hidden flex items-center justify-center">
          <img
            src={productImage}
            alt={productName || "Product"}
            className="w-full h-full object-contain"
          />
        </div>
      )}
    </div>
  );
}
export default CartoonAvatar;
