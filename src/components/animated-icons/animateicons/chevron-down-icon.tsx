// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const ChevronDown = forwardRef<SVGSVGElement, LucideProps>(function ChevronDown(props, ref) {
    const duration = 0.7;
    const nudgeVariants: Variants = {
        normal: { y: 0 },
        animate: {
            y: [0, 2.5, -0.625, 0],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.4, 0.75, 1],
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.path d="m6 9 6 6 6-6" variants={nudgeVariants}/>
    </IconMotion>);
});
