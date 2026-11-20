// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Check = forwardRef<SVGSVGElement, LucideProps>(function Check(props, ref) {
    const duration = 0.7;
    const tickVariants: Variants = {
        normal: { strokeDashoffset: 0, scale: 1, opacity: 1 },
        animate: {
            strokeDashoffset: [20, 0],
            scale: [0.9, 1.12, 1],
            opacity: [0, 1],
            transition: {
                strokeDashoffset: { duration: 0.5 * duration, ease: "easeOut" },
                scale: {
                    duration: 0.55 * duration,
                    ease: "easeInOut",
                    times: [0, 0.6, 1],
                },
                opacity: { duration: 0.25 * duration, ease: "easeOut" },
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.path d="M5 13l4 4L19 7" strokeDasharray="20" strokeDashoffset="0" variants={tickVariants} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}/>
    </IconMotion>);
});
