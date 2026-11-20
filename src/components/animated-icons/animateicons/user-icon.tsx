// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const User = forwardRef<SVGSVGElement, LucideProps>(function User(props, ref) {
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
    const bodyVariants: Variants = {
        normal: { scaleY: 1 },
        animate: {
            scaleY: [1, 0.88, 1.04, 1],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.7, 1],
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" variants={bodyVariants} style={{ transformBox: "view-box", originX: "12px", originY: "21px" }}/>
      <m.circle cx="12" cy="7" r="4" variants={headVariants}/>
    </IconMotion>);
});
