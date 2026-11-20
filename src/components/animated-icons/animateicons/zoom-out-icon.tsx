// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const ZoomOut = forwardRef<SVGSVGElement, LucideProps>(function ZoomOut(props, ref) {
    const duration = 0.7;
    const lensVariants: Variants = {
        normal: { scale: 1 },
        animate: {
            scale: [1, 0.9, 1.03, 1],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.4, 0.75, 1],
            },
        },
    };
    const minusVariants: Variants = {
        normal: { rotate: 0, scale: 1, transition: { duration: 0 } },
        animate: {
            rotate: [0, 180],
            scale: [1, 0.7, 1],
            transition: { duration: 0.5 * duration, ease: "easeInOut" },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={lensVariants} style={{ transformBox: "view-box", originX: "11px", originY: "11px" }}>
       <circle cx="11" cy="11" r="8"/>
       <line x1="21" x2="16.65" y1="21" y2="16.65"/>
       <m.line x1="8" x2="14" y1="11" y2="11" variants={minusVariants} style={{ transformBox: "view-box", originX: "11px", originY: "11px" }}/>
      </m.g>
    </IconMotion>);
});
