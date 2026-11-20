// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Store = forwardRef<SVGSVGElement, LucideProps>(function Store(props, ref) {
    const duration = 0.7;
    const awningVariants: Variants = {
        normal: { skewX: 0 },
        animate: {
            skewX: [0, 10, -8, 4, 0],
            transition: { duration: 0.7 * duration, ease: "easeInOut" },
        },
    };
    const doorVariants: Variants = {
        normal: { scaleY: 1 },
        animate: {
            scaleY: [1, 0.75, 1.03, 1],
            transition: {
                duration: 0.5 * duration,
                ease: "easeInOut",
                delay: 0.15 * duration,
                times: [0, 0.4, 0.75, 1],
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.path d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5" variants={doorVariants} style={{ transformBox: "view-box", originX: "12px", originY: "21px" }}/>
      <m.path d="M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244" variants={awningVariants} style={{ transformBox: "view-box", originX: "12px", originY: "2px" }}/>
      <path d="M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05"/>
    </IconMotion>);
});
