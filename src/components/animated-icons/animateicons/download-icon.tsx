// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Download = forwardRef<SVGSVGElement, LucideProps>(function Download(props, ref) {
    const duration = 0.7;
    const arrowVariants: Variants = {
        normal: { y: 0, opacity: 1 },
        animate: {
            y: [0, 4, -4, 0],
            opacity: [1, 0, 0, 1],
            transition: {
                duration: 0.8 * duration,
                ease: "easeInOut",
                times: [0, 0.4, 0.5, 1],
            },
        },
    };
    const trayVariants: Variants = {
        normal: { y: 0 },
        animate: {
            y: [0, 0, 1, 0],
            transition: {
                duration: 0.8 * duration,
                ease: "easeInOut",
                times: [0, 0.75, 0.9, 1],
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={arrowVariants}>
       <path d="M12 15V3"/>
       <path d="m7 10 5 5 5-5"/>
      </m.g>
      <m.path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" variants={trayVariants}/>
    </IconMotion>);
});
