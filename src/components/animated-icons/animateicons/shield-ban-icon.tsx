// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const ShieldBan = forwardRef<SVGSVGElement, LucideProps>(function ShieldBan(props, ref) {
    const duration = 0.7;
    const blockVariants: Variants = {
        normal: { rotate: 0, x: 0 },
        animate: {
            rotate: [0, -7, 4, -1.5, 0],
            x: [0, -0.6, 0.25, -0.1, 0],
            transition: {
                duration: 0.7 * duration,
                ease: "easeInOut",
                times: [0, 0.2, 0.5, 0.78, 1],
            },
        },
    };
    const slashVariants: Variants = {
        normal: { strokeDashoffset: 0 },
        animate: {
            strokeDashoffset: [20, 0],
            transition: {
                duration: 0.45 * duration,
                ease: "easeInOut",
                delay: 0.1 * duration,
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={blockVariants} style={{ transformBox: "view-box", originX: "12px", originY: "22px" }}>
       <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
       <m.path d="m4.243 5.21 14.39 12.472" strokeDasharray="20 40" strokeDashoffset="0" variants={slashVariants}/>
      </m.g>
    </IconMotion>);
});
