// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Tablet = forwardRef<SVGSVGElement, LucideProps>(function Tablet(props, ref) {
    const duration = 0.7;
    const tabletVariants: Variants = {
        normal: { rotate: 0 },
        animate: {
            rotate: [0, -4, 3, -1, 0],
            transition: { duration: 0.8 * duration, ease: "easeInOut" },
        },
    };
    const buttonVariants: Variants = {
        normal: { scale: 1 },
        animate: {
            scale: [1, 0.5, 1.6, 1],
            transition: {
                duration: 0.5 * duration,
                ease: "easeInOut",
                delay: 0.15 * duration,
                times: [0, 0.3, 0.65, 1],
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={tabletVariants} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}>
       <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/>
       <m.line x1="12" x2="12.01" y1="18" y2="18" variants={buttonVariants} style={{ transformBox: "view-box", originX: "12px", originY: "18px" }}/>
      </m.g>
    </IconMotion>);
});
