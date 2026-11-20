// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Headphones = forwardRef<SVGSVGElement, LucideProps>(function Headphones(props, ref) {
    const duration = 0.7;
    const beatVariants: Variants = {
        normal: { scale: 1, y: 0 },
        animate: {
            scale: [1, 1.14, 1, 1.09, 1],
            y: [0, -0.8, 0, -0.5, 0],
            transition: {
                duration: 0.8 * duration,
                ease: "easeInOut",
                times: [0, 0.22, 0.5, 0.75, 1],
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={beatVariants} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}>
       <path d="M3 14H6A2 2 0 0 1 8 16V19A2 2 0 0 1 6 21H5A2 2 0 0 1 3 19V12"/>
       <path d="M3 12A9 9 0 0 1 21 12"/>
       <path d="M21 12V19A2 2 0 0 1 19 21H18A2 2 0 0 1 16 19V16A2 2 0 0 1 18 14H21"/>
      </m.g>
    </IconMotion>);
});
