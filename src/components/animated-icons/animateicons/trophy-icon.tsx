// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Trophy = forwardRef<SVGSVGElement, LucideProps>(function Trophy(props, ref) {
    const duration = 0.7;
    const trophyVariants: Variants = {
        normal: { y: 0, rotate: 0 },
        animate: {
            y: [0, -2, 0, -1, 0],
            rotate: [0, -8, 6, -3, 0],
            transition: { duration: 0.8 * duration, ease: "easeInOut" },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={trophyVariants} style={{ transformBox: "view-box", originX: "12px", originY: "22px" }}>
       <path d="M10 14.66V17a1 1 0 0 1-1 1 2 2 0 0 0-2 2v2"/>
       <path d="M14 14.66V17a1 1 0 0 0 1 1 2 2 0 0 1 2 2v2"/>
       <path d="M17.916 10H19.5A2.5 2.5 0 0 0 22 7.5V5a1 1 0 0 0-1-1h-3"/>
       <path d="M4 22h16"/>
       <path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"/>
       <path d="M6.084 10H4.5A2.5 2.5 0 0 1 2 7.5V5a1 1 0 0 1 1-1h3"/>
      </m.g>
    </IconMotion>);
});
