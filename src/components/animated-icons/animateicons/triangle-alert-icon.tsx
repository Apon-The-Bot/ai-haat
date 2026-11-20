// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const AlertTriangle = forwardRef<SVGSVGElement, LucideProps>(function AlertTriangle(props, ref) {
    const duration = 0.7;
    const shapeVariants: Variants = {
        normal: { scale: 1 },
        animate: {
            scale: [1, 1.07, 0.97, 1],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.7, 1],
            },
        },
    };
    const markVariants: Variants = {
        normal: { rotate: 0 },
        animate: {
            rotate: [0, -14, 12, -6, 0],
            transition: { duration: 0.6 * duration, ease: "easeInOut" },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" variants={shapeVariants} style={{ transformBox: "view-box", originX: "12px", originY: "13px" }}/>
      <m.g variants={markVariants} style={{ transformBox: "view-box", originX: "12px", originY: "13px" }}>
       <path d="M12 9v4"/>
       <path d="M12 17h.01"/>
      </m.g>
    </IconMotion>);
});
