// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const RotateCcw = forwardRef<SVGSVGElement, LucideProps>(function RotateCcw(props, ref) {
    const duration = 0.7;
    const spinVariants: Variants = {
        normal: { rotate: 0, scale: 1, transition: { duration: 0 } },
        animate: {
            rotate: [0, -360],
            scale: [1, 0.9, 1],
            transition: { duration: 0.8 * duration, ease: "easeInOut" },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={spinVariants} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}>
       <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
       <path d="M3 3v5h5"/>
      </m.g>
    </IconMotion>);
});
