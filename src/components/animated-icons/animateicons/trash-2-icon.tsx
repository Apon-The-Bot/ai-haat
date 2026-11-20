// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Trash2 = forwardRef<SVGSVGElement, LucideProps>(function Trash2(props, ref) {
    const duration = 0.7;
    const binVariants: Variants = {
        normal: { scaleY: 1, y: 0 },
        animate: {
            y: [0, 0, 1, 0],
            scaleY: [1, 1, 0.94, 1],
            transition: {
                duration: 0.9 * duration,
                times: [0, 0.55, 0.75, 1],
                ease: "easeOut",
            },
        },
    };
    const lidVariants: Variants = {
        normal: { rotate: 0 },
        animate: {
            rotate: [0, -24, -24, 0],
            transition: {
                duration: 0.9 * duration,
                times: [0, 0.2, 0.55, 1],
                ease: "easeInOut",
            },
        },
    };
    const barVariants: Variants = {
        normal: { y: 0, opacity: 1 },
        animate: {
            y: [0, 5, 5, 0],
            opacity: [1, 0, 0, 1],
            transition: {
                duration: 0.9 * duration,
                times: [0, 0.35, 0.6, 1],
                ease: "easeInOut",
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.path d="M10 11v6" variants={barVariants}/>
      <m.path d="M14 11v6" variants={barVariants}/>
      <m.path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" variants={binVariants} style={{ transformBox: "view-box", originX: "12px", originY: "22px" }}/>
      <m.g variants={lidVariants} style={{ transformBox: "view-box", originX: "3px", originY: "6px" }}>
       <m.path d="M3 6h18"/>
       <m.path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      </m.g>
    </IconMotion>);
});
