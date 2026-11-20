// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Calendar = forwardRef<SVGSVGElement, LucideProps>(function Calendar(props, ref) {
    const duration = 0.7;
    const ringVariants: Variants = {
        normal: { y: 0 },
        animate: {
            y: [0, 1.6, -0.3, 0],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.4, 0.75, 1],
            },
        },
    };
    const bodyVariants: Variants = {
        normal: { scaleY: 1 },
        animate: {
            scaleY: [1, 1, 0.96, 1],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.4, 0.65, 1],
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.path d="M8 2v3" variants={ringVariants}/>
      <m.path d="M16 2v3" variants={ringVariants}/>
      <m.g variants={bodyVariants} style={{ transformBox: "view-box", originX: "12px", originY: "21px" }}>
       <rect x="3" y="3" width="18" height="18" rx="2"/>
       <path d="M3 9h18"/>
      </m.g>
    </IconMotion>);
});
