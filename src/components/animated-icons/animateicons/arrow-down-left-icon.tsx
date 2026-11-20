// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const ArrowDownLeft = forwardRef<SVGSVGElement, LucideProps>(function ArrowDownLeft(props, ref) {
    const duration = 0.7;
    const nudgeVariants: Variants = {
        normal: { x: 0, y: 0 },
        animate: {
            x: [0, 1.5, -3, 0],
            y: [0, -1.5, 3, 0],
            transition: {
                duration: 0.6 * duration,
                times: [0, 0.2, 0.6, 1],
                ease: "easeInOut",
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={nudgeVariants}>
      <path d="M17 7 7 17"/>
      <path d="M17 17H7V7"/>
      </m.g>
    </IconMotion>);
});
