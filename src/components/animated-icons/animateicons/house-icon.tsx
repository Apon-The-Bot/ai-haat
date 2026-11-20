// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Home = forwardRef<SVGSVGElement, LucideProps>(function Home(props, ref) {
    const duration = 0.7;
    const houseVariants: Variants = {
        normal: { scale: 1 },
        animate: {
            scale: [1, 0.8, 1.06, 1],
            transition: {
                duration: 0.7 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.75, 1],
            },
        },
    };
    const doorVariants: Variants = {
        normal: { strokeDashoffset: 0, opacity: 1 },
        animate: {
            strokeDashoffset: [25, 0],
            opacity: [0, 1],
            transition: {
                strokeDashoffset: {
                    duration: 0.45 * duration,
                    ease: "easeOut",
                    delay: 0.35 * duration,
                },
                opacity: { duration: 0.25 * duration, delay: 0.35 * duration },
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={houseVariants} style={{ transformBox: "view-box", originX: "12px", originY: "21px" }}>
       <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
       <m.path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" strokeDasharray="25" strokeDashoffset="0" variants={doorVariants}/>
      </m.g>
    </IconMotion>);
});
