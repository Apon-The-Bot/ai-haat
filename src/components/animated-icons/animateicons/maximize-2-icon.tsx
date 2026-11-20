// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Maximize2 = forwardRef<SVGSVGElement, LucideProps>(function Maximize2(props, ref) {
    const duration = 0.7;
    const arrowVariants = (dx: number, dy: number): Variants => ({
        normal: { x: 0, y: 0 },
        animate: {
            x: [0, dx, -dx * 0.2, 0],
            y: [0, dy, -dy * 0.2, 0],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.7, 1],
            },
        },
    });
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={arrowVariants(1.5, -1.5)}>
       <path d="M15 3h6v6"/>
       <path d="m21 3-7 7"/>
      </m.g>
      <m.g variants={arrowVariants(-1.5, 1.5)}>
       <path d="m3 21 7-7"/>
       <path d="M9 21H3v-6"/>
      </m.g>
    </IconMotion>);
});
