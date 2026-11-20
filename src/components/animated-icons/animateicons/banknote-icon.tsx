// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Banknote = forwardRef<SVGSVGElement, LucideProps>(function Banknote(props, ref) {
    const duration = 0.7;
    const coinVariants: Variants = {
        normal: { scaleX: 1 },
        animate: {
            scaleX: [1, 0.15, 1],
            transition: { duration: 0.55 * duration, ease: "easeInOut" },
        },
    };
    const dotVariants = (delay: number): Variants => ({
        normal: { scale: 1 },
        animate: {
            scale: [1, 1.7, 1],
            transition: {
                duration: 0.4 * duration,
                ease: "easeInOut",
                delay: delay * duration,
            },
        },
    });
    return (<IconMotion {...props} ref={ref}>
      <rect width="20" height="12" x="2" y="6" rx="2"/>
      <m.circle cx="12" cy="12" r="2" variants={coinVariants} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}/>
      <m.path d="M6 12h.01" variants={dotVariants(0.2)} style={{ transformBox: "view-box", originX: "6px", originY: "12px" }}/>
      <m.path d="M18 12h.01" variants={dotVariants(0.3)} style={{ transformBox: "view-box", originX: "18px", originY: "12px" }}/>
    </IconMotion>);
});
