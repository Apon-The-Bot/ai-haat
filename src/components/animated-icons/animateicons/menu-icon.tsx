// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Menu = forwardRef<SVGSVGElement, LucideProps>(function Menu(props, ref) {
    const duration = 0.7;
    const barVariants = (scale: number, delay: number): Variants => ({
        normal: { scaleX: 1 },
        animate: {
            scaleX: [1, scale, 1],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                delay: delay * duration,
            },
        },
    });
    return (<IconMotion {...props} ref={ref}>
      <m.path d="M4 6h16" variants={barVariants(0.8, 0)} style={{ transformBox: "view-box", originX: "20px", originY: "6px" }}/>
      <m.path d="M4 12h16" variants={barVariants(0.6, 0.1)} style={{ transformBox: "view-box", originX: "20px", originY: "12px" }}/>
      <m.path d="M4 18h16" variants={barVariants(0.4, 0.2)} style={{ transformBox: "view-box", originX: "20px", originY: "18px" }}/>
    </IconMotion>);
});
