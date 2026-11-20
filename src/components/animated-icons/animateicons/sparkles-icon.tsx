// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Sparkles = forwardRef<SVGSVGElement, LucideProps>(function Sparkles(props, ref) {
    const duration = 0.7;
    const bigVariants: Variants = {
        normal: { rotate: 0, scale: 1 },
        animate: {
            rotate: [0, 14, -8, 0],
            scale: [1, 1.1, 0.95, 1],
            transition: {
                duration: 0.8 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.7, 1],
            },
        },
    };
    const plusVariants: Variants = {
        normal: { rotate: 0, scale: 1 },
        animate: {
            rotate: [0, 45, 0],
            scale: [1, 1.3, 1],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                delay: 0.12 * duration,
            },
        },
    };
    const dotVariants: Variants = {
        normal: { scale: 1 },
        animate: {
            scale: [1, 1.4, 0.9, 1],
            transition: {
                duration: 0.5 * duration,
                ease: "easeInOut",
                delay: 0.25 * duration,
                times: [0, 0.35, 0.7, 1],
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" variants={bigVariants} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}/>
      <m.g variants={plusVariants} style={{ transformBox: "view-box", originX: "20px", originY: "4px" }}>
       <path d="M20 2v4"/>
       <path d="M22 4h-4"/>
      </m.g>
      <m.circle cx="4" cy="20" r="2" variants={dotVariants} style={{ transformBox: "view-box", originX: "4px", originY: "20px" }}/>
    </IconMotion>);
});
