// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Info = forwardRef<SVGSVGElement, LucideProps>(function Info(props, ref) {
    const duration = 0.7;
    const ringVariants: Variants = {
        normal: { scale: 1 },
        animate: {
            scale: [1, 1.08, 0.97, 1],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.7, 1],
            },
        },
    };
    const dotVariants: Variants = {
        normal: { y: 0 },
        animate: {
            y: [0, -2, 0.6, 0],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.7, 1],
                delay: 0.08 * duration,
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.circle cx="12" cy="12" r="10" variants={ringVariants} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}/>
      <path d="M12 16v-4"/>
      <m.path d="M12 8h.01" variants={dotVariants}/>
    </IconMotion>);
});
