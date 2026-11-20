// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Truck = forwardRef<SVGSVGElement, LucideProps>(function Truck(props, ref) {
    const duration = 0.7;
    const driveVariants: Variants = {
        normal: { x: 0 },
        animate: {
            x: [0, -1, 1, 0],
            transition: {
                duration: 0.7 * duration,
                ease: "easeInOut",
                times: [0, 0.3, 0.7, 1],
            },
        },
    };
    const bodyVariants: Variants = {
        normal: { y: 0 },
        animate: {
            y: [0, -1, 0.3, 0],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.7, 1],
                delay: 0.05 * duration,
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={driveVariants}>
       <m.g variants={bodyVariants}>
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
        <path d="M15 18H9"/>
        <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
       </m.g>
       <circle cx="17" cy="18" r="2"/>
       <circle cx="7" cy="18" r="2"/>
      </m.g>
    </IconMotion>);
});
