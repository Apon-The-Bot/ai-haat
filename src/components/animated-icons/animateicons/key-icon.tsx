// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Key = forwardRef<SVGSVGElement, LucideProps>(function Key(props, ref) {
    const duration = 0.7;
    const keyVariants: Variants = {
        normal: { rotate: 0 },
        animate: {
            rotate: [0, 11, -5, 0],
            transition: {
                duration: 0.7 * duration,
                ease: "easeInOut",
                times: [0, 0.4, 0.75, 1],
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={keyVariants} style={{ transformBox: "view-box", originX: "7.5px", originY: "15.5px" }}>
       <circle cx="7.5" cy="15.5" r="5.5"/>
       <path d="m21 2-9.6 9.6"/>
       <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/>
      </m.g>
    </IconMotion>);
});
