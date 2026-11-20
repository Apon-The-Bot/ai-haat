// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const MousePointerClick = forwardRef<SVGSVGElement, LucideProps>(function MousePointerClick(props, ref) {
    const duration = 0.7;
    const pointerVariants: Variants = {
        normal: {
            scale: 1,
            y: 0,
        },
        animate: {
            scale: [1, 0.95, 1],
            y: [0, 1, 0],
            transition: {
                duration: 0.5 * duration,
                ease: "easeInOut",
            },
        },
    };
    const clickRayVariants: Variants = {
        normal: {
            opacity: 1,
            scale: 1,
        },
        animate: {
            opacity: [1, 0.5, 1, 0, 1],
            scale: [1, 0.6, 1.2, 1],
            transition: {
                duration: 0.6 * duration,
                ease: "easeOut",
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.path d="M14 4.1 12 6" variants={clickRayVariants}/>
      <m.path d="m5.1 8-2.9-.8" variants={clickRayVariants}/>
      <m.path d="m6 12-1.9 2" variants={clickRayVariants}/>
      <m.path d="M7.2 2.2 8 5.1" variants={clickRayVariants}/>
      <m.path d="M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z" variants={pointerVariants}/>
    </IconMotion>);
});
