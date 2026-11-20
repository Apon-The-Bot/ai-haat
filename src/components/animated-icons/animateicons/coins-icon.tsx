// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Coins = forwardRef<SVGSVGElement, LucideProps>(function Coins(props, ref) {
    const duration = 0.7;
    const flipVariants = (delay: number): Variants => ({
        normal: { scaleX: 1 },
        animate: {
            scaleX: [1, 0.2, 1.05, 1],
            transition: {
                duration: 0.55 * duration,
                ease: "easeInOut",
                times: [0, 0.4, 0.75, 1],
                delay: delay * duration,
            },
        },
    });
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={flipVariants(0.15)} style={{ transformBox: "view-box", originX: "8px", originY: "16px" }}>
       <path d="M13.744 17.736a6 6 0 1 1-7.48-7.48"/>
       <path d="m6.134 14.768.866-.5 2 3.464"/>
      </m.g>
      <m.g variants={flipVariants(0)} style={{ transformBox: "view-box", originX: "16px", originY: "8px" }}>
       <path d="M15 6h1v4"/>
       <circle cx="16" cy="8" r="6"/>
      </m.g>
    </IconMotion>);
});
