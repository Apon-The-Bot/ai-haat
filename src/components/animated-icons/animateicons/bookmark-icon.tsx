// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Bookmark = forwardRef<SVGSVGElement, LucideProps>(function Bookmark(props, ref) {
    const duration = 0.7;
    const bookmarkVariants: Variants = {
        normal: {
            y: 0,
            scaleX: 1,
            scaleY: 1,
        },
        animate: {
            y: [0, -4, 0],
            scaleY: [1, 1.1, 0.95, 1],
            scaleX: [1, 0.97, 1.02, 1],
            transition: {
                duration: 0.55 * duration,
                ease: "easeOut",
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={bookmarkVariants}>
      <path d="M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z"/>
      </m.g>
    </IconMotion>);
});
