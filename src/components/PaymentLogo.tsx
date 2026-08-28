import React from "react";
import Image from "next/image";

interface PaymentLogoProps {
  method: "bkash" | "nagad" | "rocket" | "upay" | "visa" | "mastercard" | string;
  className?: string;
  width?: number;
  height?: number;
}

export function PaymentLogo({ method, className = "", width = 64, height = 24 }: PaymentLogoProps) {
  const norm = method.toLowerCase().trim();

  let src = "/images/payments/bkash.svg";
  let alt = "bKash";

  if (norm.includes("bkash")) {
    src = "/images/payments/bkash.svg";
    alt = "bKash";
  } else if (norm.includes("nagad")) {
    src = "/images/payments/nagad.svg";
    alt = "Nagad";
  } else if (norm.includes("rocket")) {
    src = "/images/payments/rocket.svg";
    alt = "Rocket";
  } else if (norm.includes("upay")) {
    src = "/images/payments/upay.svg";
    alt = "Upay";
  } else if (norm.includes("visa")) {
    src = "/images/payments/visa.svg";
    alt = "Visa";
  } else if (norm.includes("mastercard")) {
    src = "/images/payments/mastercard.svg";
    alt = "Mastercard";
  }

  return (
    <div className={`inline-flex items-center justify-center overflow-hidden rounded ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="object-contain w-auto h-auto max-h-full"
      />
    </div>
  );
}
