// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const MapPin = forwardRef<SVGSVGElement, LucideProps>(function MapPin(props, ref) {
    const duration = 0.7;
    const pinVariants: Variants = {
        normal: { y: 0, rotate: 0 },
        animate: {
            y: [0, 1, 0.3, 0],
            rotate: [0, -9, 7, -3, 0],
            transition: {
                y: {
                    duration: 0.5 * duration,
                    ease: "easeInOut",
                    times: [0, 0.3, 0.6, 1],
                },
                rotate: { duration: 0.7 * duration, ease: "easeInOut" },
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={pinVariants} style={{ transformBox: "view-box", originX: "12px", originY: "22px" }}>
       <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
       <circle cx="12" cy="10" r="3"/>
      </m.g>
    </IconMotion>);
});
