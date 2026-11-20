// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const TrendingDown = forwardRef<SVGSVGElement, LucideProps>(function TrendingDown(props, ref) {
    const duration = 0.7;
    const trendVariants: Variants = {
        normal: { x: 0, y: 0 },
        animate: {
            x: [0, 1, -0.3, 0],
            y: [0, 1.5, -0.4, 0],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.7, 1],
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={trendVariants}>
       <path d="M16 17h6v-6"/>
       <path d="m22 17-8.5-8.5-5 5L2 7"/>
      </m.g>
    </IconMotion>);
});
