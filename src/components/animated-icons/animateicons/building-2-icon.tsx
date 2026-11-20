// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Building2 = forwardRef<SVGSVGElement, LucideProps>(function Building2(props, ref) {
    const duration = 0.7;
    const doorVariants: Variants = {
        normal: { scaleX: 1 },
        animate: {
            scaleX: [1, 0.45, 1],
            transition: { duration: 0.5 * duration, ease: "easeInOut" },
        },
    };
    const windowVariants: Variants = {
        normal: { scaleX: 1, opacity: 1 },
        animate: (i: number) => ({
            scaleX: [1, 0.3, 1],
            opacity: [1, 0.35, 1],
            transition: {
                duration: 0.45 * duration,
                ease: "easeInOut",
                delay: (0.1 + i * 0.1) * duration,
            },
        }),
    };
    return (<IconMotion {...props} ref={ref}>
      <m.path d="M10 12h4" custom={0} variants={windowVariants} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}/>
      <m.path d="M10 8h4" custom={1} variants={windowVariants} style={{ transformBox: "view-box", originX: "12px", originY: "8px" }}/>
      <m.path d="M14 21v-3a2 2 0 0 0-4 0v3" variants={doorVariants} style={{ transformBox: "view-box", originX: "10px", originY: "21px" }}/>
      <path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"/>
      <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/>
    </IconMotion>);
});
