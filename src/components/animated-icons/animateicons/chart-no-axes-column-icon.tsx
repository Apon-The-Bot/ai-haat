// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const BarChart3 = forwardRef<SVGSVGElement, LucideProps>(function BarChart3(props, ref) {
    const duration = 0.7;
    const barVariants = (i: number): Variants => ({
        normal: { scaleY: 1 },
        animate: {
            scaleY: [1, 0.4, 1.05, 1],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.75, 1],
                delay: i * 0.1 * duration,
            },
        },
    });
    return (<IconMotion {...props} ref={ref}>
      <m.path d="M5 21v-6" variants={barVariants(0)} style={{ transformBox: "view-box", originX: "12px", originY: "21px" }}/>
      <m.path d="M12 21V3" variants={barVariants(1)} style={{ transformBox: "view-box", originX: "12px", originY: "21px" }}/>
      <m.path d="M19 21V9" variants={barVariants(2)} style={{ transformBox: "view-box", originX: "12px", originY: "21px" }}/>
    </IconMotion>);
});
