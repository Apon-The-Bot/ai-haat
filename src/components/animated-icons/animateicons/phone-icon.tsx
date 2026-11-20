// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Phone = forwardRef<SVGSVGElement, LucideProps>(function Phone(props, ref) {
    const duration = 0.7;
    const phoneVariants: Variants = {
        normal: { rotate: 0 },
        animate: {
            rotate: [0, -8, 8, -6, 0],
            transition: {
                duration: 0.9 * duration,
                ease: "easeInOut",
            },
        },
    };
    const pulseVariants: Variants = {
        normal: { opacity: 0, scale: 0.3 },
        animate: {
            scale: [0.3, 1.5],
            transition: {
                duration: 0.9 * duration,
                ease: "easeOut",
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.circle cx="12" cy="12" r="10" fill="none" variants={pulseVariants}/>
      <m.path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" variants={phoneVariants} style={{
            transformBox: "fill-box",
            transformOrigin: "center",
        }}/>
    </IconMotion>);
});
