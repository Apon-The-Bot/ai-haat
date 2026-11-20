// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const FileCode = forwardRef<SVGSVGElement, LucideProps>(function FileCode(props, ref) {
    const duration = 0.7;
    const leftVariants: Variants = {
        normal: { x: 0, y: 0 },
        animate: {
            x: [0, -1.2, 0.3, 0],
            y: [0, 0, 0, 0],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.7, 1],
            },
        },
    };
    const rightVariants: Variants = {
        normal: { x: 0, y: 0 },
        animate: {
            x: [0, 1.2, -0.3, 0],
            y: [0, 0, 0, 0],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.7, 1],
            },
        },
    };
    const popVariants: Variants = {
        normal: { scale: 1 },
        animate: {
            scale: [1, 1.08, 0.98, 1],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.4, 0.75, 1],
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={popVariants} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}>
       <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/>
       <path d="M14 2v5a1 1 0 0 0 1 1h5"/>
       <m.path d="M10 12.5 8 15l2 2.5" variants={leftVariants}/>
       <m.path d="m14 12.5 2 2.5-2 2.5" variants={rightVariants}/>
      </m.g>
    </IconMotion>);
});
