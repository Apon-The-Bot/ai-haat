// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const PackageOpen = forwardRef<SVGSVGElement, LucideProps>(function PackageOpen(props, ref) {
    const duration = 0.7;
    const leftFlapVariants: Variants = {
        normal: { rotate: 0 },
        animate: {
            rotate: [0, -6, 4, -2, 0],
            transition: { duration: 0.7 * duration, ease: "easeInOut" },
        },
    };
    const rightFlapVariants: Variants = {
        normal: { rotate: 0 },
        animate: {
            rotate: [0, 6, -4, 2, 0],
            transition: { duration: 0.7 * duration, ease: "easeInOut" },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <path d="M12 22v-9"/>
      <m.path d="M15.17 2.21a1.67 1.67 0 0 1 1.63 0L21 4.57a1.93 1.93 0 0 1 0 3.36L8.82 14.79a1.655 1.655 0 0 1-1.64 0L3 12.43a1.93 1.93 0 0 1 0-3.36z" variants={leftFlapVariants} style={{ transformBox: "view-box", originX: "12px", originY: "8.5px" }}/>
      <path d="M20 13v3.87a2.06 2.06 0 0 1-1.11 1.83l-6 3.08a1.93 1.93 0 0 1-1.78 0l-6-3.08A2.06 2.06 0 0 1 4 16.87V13"/>
      <m.path d="M21 12.43a1.93 1.93 0 0 0 0-3.36L8.83 2.2a1.64 1.64 0 0 0-1.63 0L3 4.57a1.93 1.93 0 0 0 0 3.36l12.18 6.86a1.636 1.636 0 0 0 1.63 0z" variants={rightFlapVariants} style={{ transformBox: "view-box", originX: "12px", originY: "8.5px" }}/>
    </IconMotion>);
});
