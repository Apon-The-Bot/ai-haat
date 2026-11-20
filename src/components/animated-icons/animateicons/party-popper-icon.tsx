// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const PartyPopper = forwardRef<SVGSVGElement, LucideProps>(function PartyPopper(props, ref) {
    const duration = 0.7;
    const coneVariants: Variants = {
        normal: { rotate: 0 },
        animate: {
            rotate: [0, -7, 3, 0],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.3, 0.65, 1],
            },
        },
    };
    const streamerVariants = (delay: number): Variants => ({
        normal: { scale: 1 },
        animate: {
            scale: [1, 0.88, 1.06, 1],
            transition: {
                duration: 0.55 * duration,
                ease: "easeInOut",
                times: [0, 0.3, 0.7, 1],
                delay: (0.1 + delay) * duration,
            },
        },
    });
    const confettiVariants = (delay: number): Variants => ({
        normal: { scale: 1 },
        animate: {
            scale: [1, 1.7, 1],
            transition: {
                duration: 0.4 * duration,
                ease: "easeInOut",
                delay: (0.25 + delay) * duration,
            },
        },
    });
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={coneVariants} style={{ transformBox: "view-box", originX: "2px", originY: "22px" }}>
       <path d="M5.8 11.3 2 22l10.7-3.79"/>
       <path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z"/>
      </m.g>
      <m.path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10" variants={streamerVariants(0)} style={{ transformBox: "view-box", originX: "10px", originY: "15px" }}/>
      <m.path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17" variants={streamerVariants(0.06)} style={{ transformBox: "view-box", originX: "10px", originY: "15px" }}/>
      <m.path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7" variants={streamerVariants(0.03)} style={{ transformBox: "view-box", originX: "10px", originY: "15px" }}/>
      <m.path d="M4 3h.01" variants={confettiVariants(0)} style={{ transformBox: "view-box", originX: "4px", originY: "3px" }}/>
      <m.path d="M15 2h.01" variants={confettiVariants(0.05)} style={{ transformBox: "view-box", originX: "15px", originY: "2px" }}/>
      <m.path d="M22 8h.01" variants={confettiVariants(0.1)} style={{ transformBox: "view-box", originX: "22px", originY: "8px" }}/>
      <m.path d="M22 20h.01" variants={confettiVariants(0.15)} style={{ transformBox: "view-box", originX: "22px", originY: "20px" }}/>
    </IconMotion>);
});
