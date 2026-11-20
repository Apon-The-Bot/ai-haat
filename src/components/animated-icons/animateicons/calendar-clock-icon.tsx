// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const CalendarClock = forwardRef<SVGSVGElement, LucideProps>(function CalendarClock(props, ref) {
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
    const handsVariants: Variants = {
        normal: { rotate: 0, transition: { duration: 0 } },
        animate: {
            rotate: [0, 360],
            transition: {
                duration: 0.8 * duration,
                ease: "easeInOut",
                delay: 0.1 * duration,
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.path d="M8 2v3" variants={ringVariants}/>
      <m.path d="M16 2v3" variants={ringVariants}/>
      <path d="M21 7.338V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h2.338"/>
      <path d="M3 9h5.859"/>
      <circle cx="16" cy="16" r="6"/>
      <m.path d="M16 14v2.2" variants={handsVariants} style={{ transformBox: "view-box", originX: "16px", originY: "16.2px" }}/>
      <path d="m16 16.2 1.6 1"/>
    </IconMotion>);
});
