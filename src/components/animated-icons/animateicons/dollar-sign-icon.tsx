// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const DollarSign = forwardRef<SVGSVGElement, LucideProps>(function DollarSign(props, ref) {
    const duration = 0.7;
    const coinVariants: Variants = {
        normal: { scaleX: 1, y: 0 },
        animate: {
            scaleX: [1, 0.2, 1],
            y: [0, -1.5, 0],
            transition: { duration: 0.6 * duration, ease: "easeInOut" },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <line x1="12" x2="12" y1="2" y2="22"/>
      <m.path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" variants={coinVariants} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}/>
    </IconMotion>);
});
