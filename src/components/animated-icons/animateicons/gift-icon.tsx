// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Gift = forwardRef<SVGSVGElement, LucideProps>(function Gift(props, ref) {
    const duration = 0.7;
    const lidVariants: Variants = {
        normal: { rotate: 0 },
        animate: {
            rotate: [0, -5.5, 1.5, 0],
            transition: {
                duration: 0.7 * duration,
                ease: "easeInOut",
                times: [0, 0.4, 0.75, 1],
            },
        },
    };
    const bowVariants: Variants = {
        normal: { scaleY: 1 },
        animate: {
            scaleY: [1, 0.92, 1, 1],
            transition: {
                duration: 0.7 * duration,
                ease: "easeInOut",
                times: [0, 0.4, 0.75, 1],
            },
        },
    };
    const ribbonVariants: Variants = {
        normal: { scaleY: 1 },
        animate: {
            scaleY: [1, 1.06, 1, 1],
            transition: {
                duration: 0.7 * duration,
                ease: "easeInOut",
                times: [0, 0.4, 0.75, 1],
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.path d="M12 7v14" variants={ribbonVariants} style={{ transformBox: "view-box", originX: "12px", originY: "21px" }}/>
      <path d="M20 11v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/>
      <m.g variants={lidVariants} style={{ transformBox: "view-box", originX: "3px", originY: "11px" }}>
       <m.path d="M7.5 7a1 1 0 0 1 0-5A4.8 8 0 0 1 12 7a4.8 8 0 0 1 4.5-5 1 1 0 0 1 0 5" variants={bowVariants} style={{ transformBox: "view-box", originX: "12px", originY: "7px" }}/>
       <rect x="3" y="7" width="18" height="4" rx="1"/>
      </m.g>
    </IconMotion>);
});
