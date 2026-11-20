// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Search = forwardRef<SVGSVGElement, LucideProps>(function Search(props, ref) {
    const duration = 0.7;
    const lensVariants: Variants = {
        normal: { x: 0, y: 0, rotate: 0, opacity: 1 },
        animate: {
            x: [0, 2, -2, 1, 0],
            y: [0, -1, 2, -1, 0],
            rotate: [0, 6, -6, 4, 0],
            transition: {
                duration: 1 * duration,
                ease: "easeInOut" as const,
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={lensVariants}>
       <m.circle cx="11" cy="11" r="8"/>
       <path d="m21 21-4.34-4.34"/>
      </m.g>
    </IconMotion>);
});
