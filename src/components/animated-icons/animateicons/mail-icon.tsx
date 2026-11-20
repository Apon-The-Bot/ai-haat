// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Mail = forwardRef<SVGSVGElement, LucideProps>(function Mail(props, ref) {
    const duration = 0.7;
    const flapVariants: Variants = {
        normal: { scaleY: 1 },
        animate: {
            scaleY: [1, -0.8, -0.8, 1],
            transition: {
                duration: 0.8 * duration,
                ease: "easeInOut",
                times: [0, 0.4, 0.65, 1],
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" variants={flapVariants} style={{ transformBox: "view-box", originX: "12px", originY: "7px" }}/>
      <rect x="2" y="4" width="20" height="16" rx="2"/>
    </IconMotion>);
});
