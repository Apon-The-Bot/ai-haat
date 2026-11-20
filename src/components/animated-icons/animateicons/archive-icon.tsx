// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Archive = forwardRef<SVGSVGElement, LucideProps>(function Archive(props, ref) {
    const duration = 0.7;
    const lidVariants: Variants = {
        normal: { rotate: 0 },
        animate: {
            rotate: [0, -6, 2, 0],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.4, 0.75, 1],
            },
        },
    };
    const boxVariants: Variants = {
        normal: { scaleY: 1 },
        animate: {
            scaleY: [1, 1, 0.94, 1],
            transition: {
                duration: 0.6 * duration,
                ease: "easeOut",
                times: [0, 0.55, 0.75, 1],
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.rect width="20" height="5" x="2" y="3" rx="1" variants={lidVariants} style={{ transformBox: "view-box", originX: "2px", originY: "8px" }}/>
      <m.g variants={boxVariants} style={{ transformBox: "view-box", originX: "12px", originY: "21px" }}>
       <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/>
       <path d="M10 12h4"/>
      </m.g>
    </IconMotion>);
});
