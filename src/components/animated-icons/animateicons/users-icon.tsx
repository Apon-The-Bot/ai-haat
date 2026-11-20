// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Users = forwardRef<SVGSVGElement, LucideProps>(function Users(props, ref) {
    const duration = 0.7;
    const headVariants: Variants = {
        normal: { y: 0 },
        animate: {
            y: [0, -1.5, 0.5, 0],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.7, 1],
            },
        },
    };
    const sideHeadVariants: Variants = {
        normal: { y: 0 },
        animate: {
            y: [0, -1.2, 0.4, 0],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.7, 1],
                delay: 0.1 * duration,
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <m.path d="M16 3.128a4 4 0 0 1 0 7.744" variants={sideHeadVariants}/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <m.circle cx="9" cy="7" r="4" variants={headVariants}/>
    </IconMotion>);
});
