// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const AlertCircle = forwardRef<SVGSVGElement, LucideProps>(function AlertCircle(props, ref) {
    const duration = 0.7;
    const shapeVariants: Variants = {
        normal: { scale: 1 },
        animate: {
            scale: [1, 1.08, 0.96, 1],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.7, 1],
            },
        },
    };
    const markVariants: Variants = {
        normal: { rotate: 0 },
        animate: {
            rotate: [0, -14, 10, -5, 0],
            transition: { duration: 0.6 * duration, ease: "easeInOut" },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.circle cx="12" cy="12" r="10" variants={shapeVariants} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}/>
      <m.g variants={markVariants} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}>
       <line x1="12" x2="12" y1="8" y2="12"/>
       <line x1="12" x2="12.01" y1="16" y2="16"/>
      </m.g>
    </IconMotion>);
});
