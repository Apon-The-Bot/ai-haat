// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const FileText = forwardRef<SVGSVGElement, LucideProps>(function FileText(props, ref) {
    const duration = 0.7;
    const lineVariants = (delay: number, length: number): Variants => ({
        normal: { strokeDashoffset: 0, opacity: 1 },
        animate: {
            strokeDashoffset: [-length, 0],
            opacity: [0, 1],
            transition: {
                strokeDashoffset: {
                    duration: 0.4 * duration,
                    ease: "easeOut",
                    delay: delay * duration,
                },
                opacity: {
                    duration: 0.25 * duration,
                    ease: "easeOut",
                    delay: delay * duration,
                },
            },
        },
    });
    const popVariants: Variants = {
        normal: { scale: 1 },
        animate: {
            scale: [1, 1.08, 0.98, 1],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.4, 0.75, 1],
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={popVariants} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}>
       <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/>
       <path d="M14 2v5a1 1 0 0 0 1 1h5"/>
       <m.path d="M10 9H8" strokeDasharray="3" strokeDashoffset="0" variants={lineVariants(0, 3)}/>
       <m.path d="M16 13H8" strokeDasharray="9" strokeDashoffset="0" variants={lineVariants(0.15, 9)}/>
       <m.path d="M16 17H8" strokeDasharray="9" strokeDashoffset="0" variants={lineVariants(0.3, 9)}/>
      </m.g>
    </IconMotion>);
});
