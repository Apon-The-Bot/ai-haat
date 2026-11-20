// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const ZoomIn = forwardRef<SVGSVGElement, LucideProps>(function ZoomIn(props, ref) {
    const duration = 0.7;
    const lensVariants: Variants = {
        normal: { scale: 1 },
        animate: {
            scale: [1, 1.1, 0.97, 1],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.4, 0.75, 1],
            },
        },
    };
    const plusVariants: Variants = {
        normal: { rotate: 0, scale: 1, transition: { duration: 0 } },
        animate: {
            rotate: [0, 90],
            scale: [1, 1.2, 1],
            transition: { duration: 0.5 * duration, ease: "easeInOut" },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={lensVariants} style={{ transformBox: "view-box", originX: "11px", originY: "11px" }}>
       <circle cx="11" cy="11" r="8"/>
       <line x1="21" x2="16.65" y1="21" y2="16.65"/>
       <m.g variants={plusVariants} style={{ transformBox: "view-box", originX: "11px", originY: "11px" }}>
        <line x1="11" x2="11" y1="8" y2="14"/>
        <line x1="8" x2="14" y1="11" y2="11"/>
       </m.g>
      </m.g>
    </IconMotion>);
});
