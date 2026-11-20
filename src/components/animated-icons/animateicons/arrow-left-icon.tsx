// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const ArrowLeft = forwardRef<SVGSVGElement, LucideProps>(function ArrowLeft(props, ref) {
    const duration = 0.7;
    const nudgeVariants: Variants = {
        normal: { x: 0 },
        animate: {
            x: [0, 2, -4, 0],
            transition: {
                duration: 0.6 * duration,
                times: [0, 0.2, 0.6, 1],
                ease: "easeInOut",
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={nudgeVariants}>
      <path d="m12 19-7-7 7-7"/>
      <path d="M19 12H5"/>
      </m.g>
    </IconMotion>);
});
