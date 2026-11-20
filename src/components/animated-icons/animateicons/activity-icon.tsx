// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Activity = forwardRef<SVGSVGElement, LucideProps>(function Activity(props, ref) {
    const duration = 0.7;
    const activityVariants: Variants = {
        normal: {
            strokeDasharray: "none",
            strokeDashoffset: 0,
            opacity: 1,
        },
        animate: {
            strokeDasharray: "60 120",
            strokeDashoffset: [0, -180],
            transition: {
                duration: 1.4 * duration,
                ease: "linear",
                repeat: 1,
                repeatType: "loop",
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.path d="M2 12h2.49a2 2 0 0 0 1.92-1.46l2.35-8.36a.25.25 0 0 1 .48 0l5.52 19.64a.25.25 0 0 0 .48 0l2.35-8.36A2 2 0 0 1 19.52 12H22" variants={activityVariants}/>
    </IconMotion>);
});
