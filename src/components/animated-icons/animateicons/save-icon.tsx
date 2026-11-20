// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Save = forwardRef<SVGSVGElement, LucideProps>(function Save(props, ref) {
    const duration = 0.7;
    const shutterVariants: Variants = {
        normal: { x: 0 },
        animate: {
            x: [0, 2, -0.4, 0],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.7, 1],
            },
        },
    };
    const labelVariants: Variants = {
        normal: { y: 0 },
        animate: {
            y: [0, -1, -0.2, 0],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.7, 1],
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
      <m.path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" variants={labelVariants}/>
      <m.path d="M7 3v4a1 1 0 0 0 1 1h7" variants={shutterVariants}/>
    </IconMotion>);
});
