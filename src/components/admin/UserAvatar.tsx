"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";

interface UserAvatarProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  size?: "sm" | "lg";
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
  const [imageFailed, setImageFailed] = useState(false);
  const dimensions = size === "lg" ? "h-20 w-20 text-2xl rounded-2xl" : "h-9 w-9 text-xs rounded-full";
  const avatar = (
    <div className={`${dimensions} relative shrink-0 overflow-hidden bg-gradient-to-tr from-[#FC5C03] to-[#FF8C4B] text-white font-bold flex items-center justify-center shadow-2xs`}>
      {image && !imageFailed ? (
        <img
          src={image}
          alt={`${name || "Customer"} profile`}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
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
