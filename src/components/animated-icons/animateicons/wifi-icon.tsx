// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Wifi = forwardRef<SVGSVGElement, LucideProps>(function Wifi(props, ref) {
    const duration = 0.7;
    const dotVariants: Variants = {
        normal: { scale: 1 },
        animate: {
            scale: [1, 1.7, 1],
            transition: { duration: 0.4 * duration, ease: "easeInOut" },
        },
    };
    const arcVariants = (i: number): Variants => ({
        normal: { y: 0 },
        animate: {
            y: [0, -1.5, 0.4, 0],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.7, 1],
                delay: (0.1 + i * 0.08) * duration,
            },
        },
    });
    return (<IconMotion {...props} ref={ref}>
      <m.path d="M12 20h.01" variants={dotVariants} style={{ transformBox: "view-box", originX: "12px", originY: "20px" }}/>
      <m.path d="M2 8.82a15 15 0 0 1 20 0" variants={arcVariants(2)}/>
      <m.path d="M5 12.859a10 10 0 0 1 14 0" variants={arcVariants(1)}/>
      <m.path d="M8.5 16.429a5 5 0 0 1 7 0" variants={arcVariants(0)}/>
    </IconMotion>);
});
