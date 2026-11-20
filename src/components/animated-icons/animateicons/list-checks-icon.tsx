// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const ListChecks = forwardRef<SVGSVGElement, LucideProps>(function ListChecks(props, ref) {
    const duration = 0.7;
    const rowVariants = (delay: number): Variants => ({
        normal: { scaleX: 1 },
        animate: {
            scaleX: [1, 0.55, 1],
            transition: {
                duration: 0.5 * duration,
                ease: "easeInOut",
                delay: delay * duration,
            },
        },
    });
    const checkVariants = (delay: number): Variants => ({
        normal: { strokeDashoffset: 0, opacity: 1 },
        animate: {
            strokeDashoffset: [9, 0],
            opacity: [0, 1],
            transition: {
                strokeDashoffset: {
                    duration: 0.4 * duration,
                    ease: "easeOut",
                    delay: delay * duration,
                },
                opacity: { duration: 0.25 * duration, delay: delay * duration },
            },
        },
    });
    return (<IconMotion {...props} ref={ref}>
      <m.path d="M13 5h8" variants={rowVariants(0.05)} style={{ transformBox: "view-box", originX: "13px", originY: "5px" }}/>
      <m.path d="M13 12h8" variants={rowVariants(0.17)} style={{ transformBox: "view-box", originX: "13px", originY: "12px" }}/>
      <m.path d="M13 19h8" variants={rowVariants(0.29)} style={{ transformBox: "view-box", originX: "13px", originY: "19px" }}/>
      <m.path d="m3 17 2 2 4-4" strokeDasharray="9" strokeDashoffset="0" variants={checkVariants(0.25)}/>
      <m.path d="m3 7 2 2 4-4" strokeDasharray="9" strokeDashoffset="0" variants={checkVariants(0)}/>
    </IconMotion>);
});
