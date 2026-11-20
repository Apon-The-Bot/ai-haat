// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Building = forwardRef<SVGSVGElement, LucideProps>(function Building(props, ref) {
    const duration = 0.7;
    const rowVariants: Variants = {
        normal: { y: 0, opacity: 1 },
        animate: (i: number) => ({
            y: [0, -1.5, 0.4, 0],
            opacity: [1, 0.4, 1, 1],
            transition: {
                duration: 0.5 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.7, 1],
                delay: i * 0.1 * duration,
            },
        }),
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={rowVariants} custom={0}>
       <path d="M8 14h.01"/>
       <path d="M12 14h.01"/>
       <path d="M16 14h.01"/>
      </m.g>
      <m.g variants={rowVariants} custom={1}>
       <path d="M8 10h.01"/>
       <path d="M12 10h.01"/>
       <path d="M16 10h.01"/>
      </m.g>
      <m.g variants={rowVariants} custom={2}>
       <path d="M8 6h.01"/>
       <path d="M12 6h.01"/>
       <path d="M16 6h.01"/>
      </m.g>
      <path d="M9 22v-3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/>
      <rect x="4" y="2" width="16" height="20" rx="2"/>
    </IconMotion>);
});
