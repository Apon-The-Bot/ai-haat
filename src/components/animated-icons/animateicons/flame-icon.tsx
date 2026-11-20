// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Flame = forwardRef<SVGSVGElement, LucideProps>(function Flame(props, ref) {
    const duration = 0.7;
    const flameVariants: Variants = {
        normal: { scaleX: 1, scaleY: 1, skewX: 0 },
        animate: {
            scaleX: [1, 0.93, 1.04, 0.98, 1],
            scaleY: [1, 1.08, 0.95, 1.03, 1],
            skewX: [0, -5, 4, -2, 0],
            transition: { duration: 0.8 * duration, ease: "easeInOut" },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4" variants={flameVariants} style={{ transformBox: "view-box", originX: "12px", originY: "21px" }}/>
    </IconMotion>);
});
