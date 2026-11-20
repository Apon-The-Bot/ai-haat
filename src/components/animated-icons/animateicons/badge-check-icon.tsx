// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const BadgeCheck = forwardRef<SVGSVGElement, LucideProps>(function BadgeCheck(props, ref) {
    const duration = 0.7;
    const badgeVariants: Variants = {
        normal: { scale: 1 },
        animate: {
            scale: [1, 1.08, 0.97, 1],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.7, 1],
            },
        },
    };
    const tickVariants: Variants = {
        normal: { strokeDashoffset: 0, opacity: 1, scale: 1 },
        animate: {
            strokeDashoffset: [9, 0],
            opacity: [0, 1],
            scale: [0.8, 1.12, 1],
            transition: {
                strokeDashoffset: {
                    duration: 0.45 * duration,
                    ease: "easeOut",
                    delay: 0.15 * duration,
                },
                opacity: { duration: 0.3 * duration, delay: 0.15 * duration },
                scale: {
                    duration: 0.45 * duration,
                    delay: 0.19 * duration,
                    times: [0, 0.6, 1],
                    ease: "easeInOut",
                },
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" variants={badgeVariants} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}/>
      <m.path d="m9 12 2 2 4-4" strokeDasharray="9" strokeDashoffset="0" variants={tickVariants} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}/>
    </IconMotion>);
});
