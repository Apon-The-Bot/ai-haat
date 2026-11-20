// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Unlock = forwardRef<SVGSVGElement, LucideProps>(function Unlock(props, ref) {
    const duration = 0.7;
    const shackleVariants: Variants = {
        normal: { rotate: 0 },
        animate: {
            rotate: [0, -14, 5, -2, 0],
            transition: {
                duration: 0.7 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.65, 0.85, 1],
            },
        },
    };
    const bodyVariants: Variants = {
        normal: { y: 0 },
        animate: {
            y: [0, 0.8, 0],
            transition: { duration: 0.35 * duration, ease: "easeOut" },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.rect width="18" height="11" x="3" y="11" rx="2" ry="2" variants={bodyVariants}/>
      <m.path d="M7 11V7a5 5 0 0 1 9.9-1" variants={shackleVariants} style={{ transformBox: "view-box", originX: "7px", originY: "11px" }}/>
    </IconMotion>);
});
