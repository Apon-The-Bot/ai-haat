// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const CheckCheck = forwardRef<SVGSVGElement, LucideProps>(function CheckCheck(props, ref) {
    const duration = 0.7;
    const tickVariants = (delay: number, length: number): Variants => ({
        normal: { strokeDashoffset: 0, opacity: 1 },
        animate: {
            strokeDashoffset: [-length, 0],
            opacity: [0, 1],
            transition: {
                strokeDashoffset: {
                    duration: 0.45 * duration,
                    ease: "easeOut",
                    delay: delay * duration,
                },
                opacity: { duration: 0.25 * duration, delay: delay * duration },
            },
        },
    });
    return (<IconMotion {...props} ref={ref}>
      <m.path d="M18 6 7 17l-5-5" strokeDasharray="24" strokeDashoffset="0" variants={tickVariants(0, 24)}/>
      <m.path d="m22 10-7.5 7.5L13 16" strokeDasharray="14" strokeDashoffset="0" variants={tickVariants(0.25, 14)}/>
    </IconMotion>);
});
