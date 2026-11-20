// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Terminal = forwardRef<SVGSVGElement, LucideProps>(function Terminal(props, ref) {
    const duration = 0.7;
    const promptVariants: Variants = {
        normal: { x: 0 },
        animate: {
            x: [0, 2, -0.4, 0],
            transition: {
                duration: 0.5 * duration,
                ease: "easeInOut",
                times: [0, 0.4, 0.75, 1],
            },
        },
    };
    const cursorVariants: Variants = {
        normal: { opacity: 1 },
        animate: {
            opacity: [1, 0.1, 1, 0.1, 1],
            transition: {
                duration: 0.7 * duration,
                ease: "easeInOut",
                delay: 0.15 * duration,
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.path d="M12 19h8" variants={cursorVariants}/>
      <m.path d="m4 17 6-6-6-6" variants={promptVariants}/>
    </IconMotion>);
});
