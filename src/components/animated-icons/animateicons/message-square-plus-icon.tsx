// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const MessageSquarePlus = forwardRef<SVGSVGElement, LucideProps>(function MessageSquarePlus(props, ref) {
    const duration = 0.7;
    const bubbleVariants: Variants = {
        normal: { scale: 1 },
        animate: {
            scale: [1, 0.7, 1.05, 1],
            transition: {
                duration: 0.65 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.75, 1],
            },
        },
    };
    const popVariants: Variants = {
        normal: { rotate: 0, scale: 1, transition: { duration: 0 } },
        animate: {
            rotate: [0, 90],
            scale: [1, 1.2, 1],
            transition: {
                duration: 0.5 * duration,
                ease: "easeInOut",
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={bubbleVariants} style={{ transformBox: "view-box", originX: "4px", originY: "20px" }}>
       <path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/>
       <m.g variants={popVariants} style={{ transformBox: "view-box", originX: "12px", originY: "11px" }}>
        <path d="M12 8v6"/>
        <path d="M9 11h6"/>
       </m.g>
      </m.g>
    </IconMotion>);
});
