// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const ArrowUpDown = forwardRef<SVGSVGElement, LucideProps>(function ArrowUpDown(props, ref) {
    const duration = 0.7;
    const upVariants: Variants = {
        normal: { y: 0 },
        animate: {
            y: [0, -3, 0],
            transition: {
                duration: 0.6 * duration,
                times: [0, 0.5, 1],
                ease: "easeInOut",
            },
        },
    };
    const downVariants: Variants = {
        normal: { y: 0 },
        animate: {
            y: [0, 3, 0],
            transition: {
                duration: 0.6 * duration,
                times: [0, 0.5, 1],
                ease: "easeInOut",
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.path d="m21 16-4 4-4-4" variants={downVariants}/>
      <m.path d="M17 20V4" variants={downVariants}/>
      <m.path d="m3 8 4-4 4 4" variants={upVariants}/>
      <m.path d="M7 4v16" variants={upVariants}/>
    </IconMotion>);
});
