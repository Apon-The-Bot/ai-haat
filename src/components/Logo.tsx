"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg" | "xl";
  showSubtitle?: boolean;
  className?: string;
}

export function Logo({
  variant = "dark",
  size = "md",
  showSubtitle = false,
  className = "",
}: LogoProps) {
  const isLight = variant === "light";

  // Height mappings according to spec
  const heightClasses = {
    sm: "h-8",
    md: "h-10", // ~40px (Header spec: 40px - 44px)
    lg: "h-12",
    xl: "h-16",
  }[size];

  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 group ${className}`}>
      {/* Crisp Logo Monogram Icon */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          viewBox="0 0 100 90"
          className={`${size === "sm" ? "w-7 h-7" : size === "md" ? "w-9 h-9" : size === "lg" ? "w-11 h-11" : "w-14 h-14"} transition-transform duration-300 group-hover:scale-105`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer orange circular accent if desired or direct crisp AH geometry */}
          <defs>
            <linearGradient id="aihaatOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FE7113" />
              <stop offset="100%" stopColor="#FC5C03" />
            </linearGradient>
          </defs>
          {/* 'A' left leg in dark charcoal or white */}
          <path
            d="M38 12L12 76H26L45 28L54 50H42L36 64H60L65 76H78L52 12H38Z"
            fill={isLight ? "#FFFFFF" : "#1A1D26"}
          />
          {/* 'H' geometric orange polygon */}
          <path
            d="M48 36H78V48H64V64H78V76H48V64H52V48H48V36Z"
            fill="url(#aihaatOrangeGrad)"
          />
          {/* Inner accent triangle */}
          <polygon points="36,64 48,36 60,64" fill="url(#aihaatOrangeGrad)" />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center tracking-tight font-black leading-none text-2xl sm:text-2xl select-none">
          <span className={isLight ? "text-white" : "text-[#1A1D26]"}>AI</span>
          <span className="text-[#FC5C03] ml-1">Haat</span>
        </div>
        {showSubtitle && (
          <div className="flex items-center gap-1.5 mt-0.5 select-none">
            <span className="w-3 h-[1px] bg-[#FC5C03]"></span>
            <span
              className={`text-[8.5px] font-bold tracking-widest uppercase ${
                isLight ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Premium Digital
            </span>
            <span className="w-3 h-[1px] bg-[#FC5C03]"></span>
          </div>
        )}
      </div>
    </Link>
  );
}
