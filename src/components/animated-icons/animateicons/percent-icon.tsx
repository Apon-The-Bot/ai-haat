// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Percent = forwardRef<SVGSVGElement, LucideProps>(function Percent(props, ref) {
    const duration = 0.7;
    const spinVariants: Variants = {
        normal: { rotate: 0, scale: 1, transition: { duration: 0 } },
        animate: {
            rotate: [0, 180],
            scale: [1, 0.85, 1],
            transition: { duration: 0.7 * duration, ease: "easeInOut" },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={spinVariants} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}>
       <line x1="19" x2="5" y1="5" y2="19"/>
       <circle cx="6.5" cy="6.5" r="2.5"/>
       <circle cx="17.5" cy="17.5" r="2.5"/>
      </m.g>
    </IconMotion>);
});
