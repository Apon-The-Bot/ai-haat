// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const PackageCheck = forwardRef<SVGSVGElement, LucideProps>(function PackageCheck(props, ref) {
    const duration = 0.7;
    const boxVariants: Variants = {
        normal: { y: 0, rotate: 0 },
        animate: {
            y: [0, -1, 0.3, 0],
            rotate: [0, -6, 4, 0],
            transition: {
                duration: 0.7 * duration,
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
      <m.g variants={boxVariants} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}>
       <path d="M12 22V12"/>
       <path d="M21 11.127V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.729l7 4a2 2 0 0 0 2 .001l1.32-.753"/>
       <path d="M3.29 7 12 12l8.71-5"/>
       <path d="m7.5 4.27 8.997 5.148"/>
      </m.g>
      <m.path d="m16 17 2 2 4-4" strokeDasharray="9" strokeDashoffset="0" variants={tickVariants} style={{ transformBox: "view-box", originX: "19px", originY: "17px" }}/>
    </IconMotion>);
});
