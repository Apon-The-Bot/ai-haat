// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Undo2 = forwardRef<SVGSVGElement, LucideProps>(function Undo2(props, ref) {
    const duration = 0.7;
    const undoVariants: Variants = {
        normal: { rotate: 0 },
        animate: {
            rotate: [0, -12, 3, 0],
            transition: {
                duration: 0.7 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.7, 1],
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={undoVariants} style={{ transformBox: "view-box", originX: "12px", originY: "17px" }}>
       <path d="M3 7v6h6"/>
       <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
      </m.g>
    </IconMotion>);
});
