// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const XCircle = forwardRef<SVGSVGElement, LucideProps>(function XCircle(props, ref) {
    const duration = 0.7;
    const shapeVariants: Variants = {
        normal: { scale: 1 },
        animate: {
            scale: [1, 1.1, 0.96, 1],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.7, 1],
            },
        },
    };
    const crossVariants: Variants = {
        normal: { rotate: 0, scale: 1, transition: { duration: 0 } },
        animate: {
            rotate: [0, 90],
            scale: [1, 1.2, 1],
            transition: { duration: 0.5 * duration, ease: "easeInOut" },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.circle cx="12" cy="12" r="10" variants={shapeVariants} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}/>
      <m.g variants={crossVariants} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}>
       <path d="m15 9-6 6"/>
       <path d="m9 9 6 6"/>
      </m.g>
    </IconMotion>);
});
