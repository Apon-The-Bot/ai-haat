// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const CreditCard = forwardRef<SVGSVGElement, LucideProps>(function CreditCard(props, ref) {
    const duration = 0.7;
    const cardVariants: Variants = {
        normal: { scale: 1, rotate: 0 },
        animate: {
            scale: [1, 1.05, 1],
            rotate: [0, -5, 0],
            transition: { duration: 0.7 * duration, ease: "easeInOut" },
        },
    };
    const stripeVariants: Variants = {
        normal: { strokeDashoffset: 0, opacity: 1 },
        animate: {
            strokeDashoffset: [21, 0],
            opacity: [0.4, 1],
            transition: {
                strokeDashoffset: {
                    duration: 0.5 * duration,
                    ease: "easeOut",
                    delay: 0.1 * duration,
                },
                opacity: { duration: 0.25 * duration, delay: 0.1 * duration },
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={cardVariants} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}>
       <rect width="20" height="14" x="2" y="5" rx="2"/>
       <m.line x1="2" x2="22" y1="10" y2="10" strokeDasharray="21" strokeDashoffset="0" variants={stripeVariants}/>
      </m.g>
    </IconMotion>);
});
