// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const CheckSquare = forwardRef<SVGSVGElement, LucideProps>(function CheckSquare(props, ref) {
    const duration = 0.7;
    const shapeVariants: Variants = {
        normal: { scale: 1 },
        animate: {
            scale: [1, 1.06, 0.97, 1],
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
      <m.path d="M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344" variants={shapeVariants} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}/>
      <m.path d="m9 11 3 3L22 4" strokeDasharray="20" strokeDashoffset="0" variants={tickVariants} style={{ transformBox: "view-box", originX: "15.5px", originY: "9px" }}/>
    </IconMotion>);
});
