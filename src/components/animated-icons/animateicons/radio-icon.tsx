// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Radio = forwardRef<SVGSVGElement, LucideProps>(function Radio(props, ref) {
    const duration = 0.7;
    const waveVariants = (peak: number, delay: number): Variants => ({
        normal: { scale: 1 },
        animate: {
            scale: [1, peak, 0.97, 1],
            transition: {
                duration: 0.5 * duration,
                ease: "easeInOut",
                times: [0, 0.4, 0.75, 1],
                delay: delay * duration,
            },
        },
    });
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={waveVariants(1.15, 0.1)} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}>
       <path d="M16.247 7.761a6 6 0 0 1 0 8.478"/>
       <path d="M7.753 16.239a6 6 0 0 1 0-8.478"/>
      </m.g>
      <m.g variants={waveVariants(1.08, 0.2)} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}>
       <path d="M19.075 4.933a10 10 0 0 1 0 14.134"/>
       <path d="M4.925 19.067a10 10 0 0 1 0-14.134"/>
      </m.g>
      <m.circle cx="12" cy="12" r="2" variants={waveVariants(1.3, 0)} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}/>
    </IconMotion>);
});
