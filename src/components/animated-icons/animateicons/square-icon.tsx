// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Square = forwardRef<SVGSVGElement, LucideProps>(function Square(props, ref) {
    const duration = 0.7;
    const tumbleVariants: Variants = {
        normal: { rotate: 0, scale: 1, y: 0, transition: { duration: 0 } },
        animate: {
            rotate: [0, 90],
            scale: [1, 0.8, 1],
            y: [0, -1, 0],
            transition: { duration: 0.6 * duration, ease: "easeInOut" },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.rect width="18" height="18" x="3" y="3" rx="2" variants={tumbleVariants} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}/>
    </IconMotion>);
});
