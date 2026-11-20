// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const TrendingUp = forwardRef<SVGSVGElement, LucideProps>(function TrendingUp(props, ref) {
    const duration = 0.7;
    const trendVariants: Variants = {
        normal: { x: 0, y: 0 },
        animate: {
            x: [0, 1, -0.3, 0],
            y: [0, -1.5, 0.4, 0],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.7, 1],
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={trendVariants}>
       <path d="M16 7h6v6"/>
       <path d="m22 7-8.5 8.5-5-5L2 17"/>
      </m.g>
    </IconMotion>);
});
