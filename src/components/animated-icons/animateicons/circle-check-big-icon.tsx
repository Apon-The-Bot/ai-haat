// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const CheckCircle = forwardRef<SVGSVGElement, LucideProps>(function CheckCircle(props, ref) {
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
    const tickVariants: Variants = {
        normal: { strokeDashoffset: 0, opacity: 1, scale: 1 },
        animate: {
            strokeDashoffset: [20, 0],
            opacity: [0, 1],
            scale: [0.8, 1.12, 1],
            transition: {
                strokeDashoffset: {
                    duration: 0.45 * duration,
                    ease: "easeOut",
                    delay: 0.15 * duration,
                },
                opacity: { duration: 0.25 * duration, delay: 0.15 * duration },
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
      <m.path d="M21.801 10A10 10 0 1 1 17 3.335" variants={shapeVariants} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}/>
      <m.path d="m9 11 3 3L22 4" strokeDasharray="20" strokeDashoffset="0" variants={tickVariants} style={{ transformBox: "view-box", originX: "15.5px", originY: "9px" }}/>
    </IconMotion>);
});
