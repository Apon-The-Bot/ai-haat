"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { sanitizeProfileImageUrl } from "@/lib/profile-image";

interface UserAvatarProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  size?: "xs" | "sm" | "md" | "lg";
  onClick?: () => void;
}

function initials(name?: string | null, email?: string | null) {
  const value = name?.trim() || email?.trim() || "U";
  return value
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function UserAvatar({ name, email, image, size = "sm", onClick }: UserAvatarProps) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const dimensions = {
    xs: "h-5 w-5 text-[9px]",
    sm: "h-9 w-9 text-xs",
    md: "h-12 w-12 text-lg",
    lg: "h-20 w-20 text-2xl",
  }[size];
  const validImage = sanitizeProfileImageUrl(image);
  const avatar = (
    <div className={`${dimensions} relative shrink-0 overflow-hidden rounded-full bg-[#FC5C03] text-white font-bold flex items-center justify-center shadow-2xs`}>
      {validImage && failedImage !== validImage ? (
        <img
          src={validImage}
          alt={`${name || "Customer"} profile`}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
          onError={() => setFailedImage(validImage)}
        />
      ) : (
        initials(name, email)
      )}
    </div>
  );

  return onClick ? (
    <button type="button" onClick={onClick} className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FC5C03]" aria-label="Preview profile picture">
      {avatar}
    </button>
  ) : avatar;
}
