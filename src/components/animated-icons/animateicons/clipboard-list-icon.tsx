// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const ClipboardList = forwardRef<SVGSVGElement, LucideProps>(function ClipboardList(props, ref) {
    const duration = 0.7;
    const rowVariants = (delay: number): Variants => ({
        normal: { scaleX: 1 },
        animate: {
            scaleX: [1, 0.5, 1.1, 1],
            transition: {
                duration: 0.5 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.7, 1],
                delay: delay * duration,
            },
        },
    });
    const dotVariants = (delay: number): Variants => ({
        normal: { scale: 1 },
        animate: {
            scale: [1, 1.6, 1],
            transition: {
                duration: 0.4 * duration,
                ease: "easeInOut",
                delay: delay * duration,
            },
        },
    });
    return (<IconMotion {...props} ref={ref}>
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <m.path d="M12 11h4" variants={rowVariants(0.05)} style={{ transformBox: "view-box", originX: "12px", originY: "11px" }}/>
      <m.path d="M12 16h4" variants={rowVariants(0.2)} style={{ transformBox: "view-box", originX: "12px", originY: "16px" }}/>
      <m.path d="M8 11h.01" variants={dotVariants(0)} style={{ transformBox: "view-box", originX: "8px", originY: "11px" }}/>
      <m.path d="M8 16h.01" variants={dotVariants(0.15)} style={{ transformBox: "view-box", originX: "8px", originY: "16px" }}/>
    </IconMotion>);
});
