// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const MinusCircle = forwardRef<SVGSVGElement, LucideProps>(function MinusCircle(props, ref) {
    const duration = 0.7;
    const circleVariants: Variants = {
        normal: { scale: 1 },
        animate: {
            scale: [1, 0.9, 1.05, 1],
            transition: {
                duration: 0.5 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.7, 1],
            },
        },
    };
    const lineVariants: Variants = {
        normal: { rotate: 0, scale: 1, transition: { duration: 0 } },
        animate: {
            rotate: [0, 180],
            scale: [1, 0.7, 1],
            transition: { duration: 0.5 * duration, ease: "easeInOut" },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.circle cx="12" cy="12" r="10" variants={circleVariants} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}/>
      <m.path d="M8 12h8" variants={lineVariants} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}/>
    </IconMotion>);
});
