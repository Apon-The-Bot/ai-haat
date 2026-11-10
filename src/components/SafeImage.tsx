"use client";

import React from "react";
import { AdaptiveImage, AdaptiveImageProps } from "@/components/common/AdaptiveImage";

export interface SafeImageProps extends AdaptiveImageProps {
  // Retains exact backward compatibility with all existing props
}

/**
 * Enhanced SafeImage component powered by the Intelligent Adaptive Image Engine.
 * Automatically serves responsive WebP variants, adapts quality to real-time network speeds,
 * and falls back gracefully for legacy or external images.
 */
export function SafeImage(props: SafeImageProps) {
  return <AdaptiveImage {...props} />;
}

export default SafeImage;
