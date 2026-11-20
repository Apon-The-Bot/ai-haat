// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Command = forwardRef<SVGSVGElement, LucideProps>(function Command(props, ref) {
    const duration = 0.7;
    const loopVariants = (delay: number): Variants => ({
        normal: { scale: 1 },
        animate: {
            scale: [1, 1.2, 0.95, 1],
            transition: {
                duration: 0.5 * duration,
                ease: "easeInOut",
                times: [0, 0.4, 0.75, 1],
                delay: delay * duration,
            },
        },
    });
    const crossVariants: Variants = {
        normal: { scale: 1 },
        animate: {
            scale: [1, 0.88, 1.03, 1],
            transition: {
                duration: 0.5 * duration,
                ease: "easeInOut",
                times: [0, 0.4, 0.75, 1],
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={crossVariants} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}>
       <path d="M15 6V18"/>
       <path d="M18 15H6"/>
       <path d="M9 18V6"/>
       <path d="M6 9H18"/>
      </m.g>
      <m.path d="M9 6A3 3 0 1 0 6 9" variants={loopVariants(0)} style={{ transformBox: "view-box", originX: "6px", originY: "6px" }}/>
      <m.path d="M18 9A3 3 0 1 0 15 6" variants={loopVariants(0.08)} style={{ transformBox: "view-box", originX: "18px", originY: "6px" }}/>
      <m.path d="M15 18A3 3 0 1 0 18 15" variants={loopVariants(0.16)} style={{ transformBox: "view-box", originX: "18px", originY: "18px" }}/>
      <m.path d="M6 15A3 3 0 1 0 9 18" variants={loopVariants(0.24)} style={{ transformBox: "view-box", originX: "6px", originY: "18px" }}/>
    </IconMotion>);
});
