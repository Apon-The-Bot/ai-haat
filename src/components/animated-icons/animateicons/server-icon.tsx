// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Server = forwardRef<SVGSVGElement, LucideProps>(function Server(props, ref) {
    const duration = 0.7;
    const blinkVariants = (delay: number): Variants => ({
        normal: { opacity: 1, scale: 1 },
        animate: {
            opacity: [1, 0.15, 1],
            scale: [1, 0.6, 1.2, 1],
            transition: {
                duration: 0.45 * duration,
                ease: "easeInOut",
                delay: delay * duration,
            },
        },
    });
    const unitVariants = (delay: number): Variants => ({
        normal: { scaleY: 1 },
        animate: {
            scaleY: [1, 0.92, 1.02, 1],
            transition: {
                duration: 0.5 * duration,
                ease: "easeInOut",
                delay: delay * duration,
                times: [0, 0.35, 0.7, 1],
            },
        },
    });
    return (<IconMotion {...props} ref={ref}>
      <m.rect width="20" height="8" x="2" y="2" rx="2" ry="2" variants={unitVariants(0)} style={{ transformBox: "view-box", originX: "12px", originY: "6px" }}/>
      <m.rect width="20" height="8" x="2" y="14" rx="2" ry="2" variants={unitVariants(0.15)} style={{ transformBox: "view-box", originX: "12px", originY: "18px" }}/>
      <m.line x1="6" x2="6.01" y1="6" y2="6" variants={blinkVariants(0.1)} style={{ transformBox: "view-box", originX: "6px", originY: "6px" }}/>
      <m.line x1="6" x2="6.01" y1="18" y2="18" variants={blinkVariants(0.25)} style={{ transformBox: "view-box", originX: "6px", originY: "18px" }}/>
    </IconMotion>);
});
