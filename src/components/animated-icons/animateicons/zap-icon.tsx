// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Zap = forwardRef<SVGSVGElement, LucideProps>(function Zap(props, ref) {
    const duration = 0.7;
    const bodyVariants: Variants = {
        normal: {
            pathLength: 1,
            pathOffset: 0,
            opacity: 1,
            scale: 1,
            rotate: 0,
        },
        animate: {
            pathLength: [0, 1],
            pathOffset: [0.6, 0],
            opacity: [0.4, 1],
            scale: [0.92, 1.08, 1],
            rotate: [0, -4, 2, 0],
            transition: {
                pathLength: {
                    duration: 0.45 * duration,
                    ease: "easeOut",
                },
                pathOffset: {
                    duration: 0.45 * duration,
                    ease: "easeOut",
                },
                scale: {
                    duration: 0.6 * duration,
                    ease: "easeOut",
                },
                rotate: {
                    duration: 0.6 * duration,
                    ease: "easeOut",
                },
                opacity: {
                    duration: 0.25 * duration,
                    ease: "linear",
                },
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" variants={bodyVariants}/>
    </IconMotion>);
});
