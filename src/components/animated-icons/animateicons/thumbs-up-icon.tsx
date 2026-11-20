// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const ThumbsUp = forwardRef<SVGSVGElement, LucideProps>(function ThumbsUp(props, ref) {
    const duration = 0.7;
    const svgVariants: Variants = {
        normal: { scale: 1, rotate: 0 },
        animate: {
            scale: [1, 1.08, 0.98, 1.03, 1],
            rotate: [0, -8, 6, -4, 0],
            transition: {
                duration: 0.855 * duration,
                ease: "easeInOut",
            },
        },
    };
    const stemVariants: Variants = {
        normal: { scaleY: 1, opacity: 1 },
        animate: {
            scaleY: [1, 0.92, 1.04, 1],
            opacity: [1, 0.85, 1],
            transition: {
                duration: 0.63 * duration,
                ease: "easeInOut",
                delay: 0.072 * duration,
            },
        },
    };
    const thumbVariants: Variants = {
        normal: { rotate: 0, y: 0, scale: 1 },
        animate: {
            rotate: [0, -8, 6, -4, 0],
            y: [0, -4, -8, -4, 0],
            scale: [1, 1.05, 1.1, 1.04, 1],
            transition: {
                duration: 0.855 * duration,
                ease: "easeInOut",
                delay: 0.045 * duration,
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={svgVariants}>
      <m.path d="M7 10v12" variants={stemVariants} style={{ transformOrigin: "center" }}/>
      <m.path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" variants={thumbVariants} style={{ transformOrigin: "center" }}/>
      </m.g>
    </IconMotion>);
});
