// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Copy = forwardRef<SVGSVGElement, LucideProps>(function Copy(props, ref) {
    const duration = 0.7;
    const frontVariants: Variants = {
        normal: { x: 0, y: 0, rotate: 0, transition: { duration: 0 } },
        animate: {
            x: [0, -3, 0],
            y: [0, -3, 0],
            rotate: [0, 360],
            transition: { duration: 0.9 * duration, ease: "easeInOut" },
        },
    };
    const backVariants: Variants = {
        normal: { x: 0, y: 0 },
        animate: {
            x: [0, 3, 0],
            y: [0, 3, 0],
            transition: { duration: 0.9 * duration, ease: "easeInOut" },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.rect width="14" height="14" x="8" y="8" rx="2" ry="2" variants={frontVariants} style={{ transformBox: "view-box", originX: "15px", originY: "15px" }}/>
      <m.path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" variants={backVariants}/>
    </IconMotion>);
});
