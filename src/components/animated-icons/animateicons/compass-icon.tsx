// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Compass = forwardRef<SVGSVGElement, LucideProps>(function Compass(props, ref) {
    const duration = 0.7;
    const ringVariants: Variants = {
        normal: { scale: 1 },
        animate: {
            scale: [1, 1.06, 0.98, 1],
            transition: {
                duration: 0.9 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.7, 1],
            },
        },
    };
    const needleVariants: Variants = {
        normal: { rotate: 0, transition: { duration: 0 } },
        animate: {
            rotate: [0, 190, 172, 180],
            transition: {
                duration: 1 * duration,
                ease: "easeInOut",
                times: [0, 0.5, 0.78, 1],
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.circle cx="12" cy="12" r="10" variants={ringVariants} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}/>
      <m.path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z" variants={needleVariants} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}/>
    </IconMotion>);
});
