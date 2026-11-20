// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Package = forwardRef<SVGSVGElement, LucideProps>(function Package(props, ref) {
    const duration = 0.7;
    const boxVariants: Variants = {
        normal: { y: 0, rotate: 0 },
        animate: {
            y: [0, -1, 0.3, 0],
            rotate: [0, -6, 4, 0],
            transition: {
                duration: 0.7 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.7, 1],
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={boxVariants} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}>
       <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/>
       <path d="M12 22V12"/>
       <polyline points="3.29 7 12 12 20.71 7"/>
       <path d="m7.5 4.27 9 5.15"/>
      </m.g>
    </IconMotion>);
});
