// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const X = forwardRef<SVGSVGElement, LucideProps>(function X(props, ref) {
    const duration = 0.7;
    const crossVariants: Variants = {
        normal: { rotate: 0, scale: 1, transition: { duration: 0 } },
        animate: {
            rotate: [0, 90],
            scale: [1, 1.2, 1],
            transition: { duration: 0.5 * duration, ease: "easeInOut" },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={crossVariants} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}>
       <path d="M18 6 6 18"/>
       <path d="m6 6 12 12"/>
      </m.g>
    </IconMotion>);
});
