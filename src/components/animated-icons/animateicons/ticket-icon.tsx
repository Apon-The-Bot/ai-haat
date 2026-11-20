// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Ticket = forwardRef<SVGSVGElement, LucideProps>(function Ticket(props, ref) {
    const duration = 0.7;
    const ticketVariants: Variants = {
        normal: { rotate: 0 },
        animate: {
            rotate: [0, -5, 4, -2, 0],
            transition: { duration: 0.8 * duration, ease: "easeInOut" },
        },
    };
    const perfVariants = (i: number): Variants => ({
        normal: { scaleY: 1 },
        animate: {
            scaleY: [1, 0.3, 1],
            transition: {
                duration: 0.4 * duration,
                ease: "easeInOut",
                delay: (0.1 + i * 0.08) * duration,
            },
        },
    });
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={ticketVariants} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}>
       <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
       <m.path d="M13 5v2" variants={perfVariants(0)} style={{ transformBox: "view-box", originX: "13px", originY: "6px" }}/>
       <m.path d="M13 11v2" variants={perfVariants(1)} style={{ transformBox: "view-box", originX: "13px", originY: "12px" }}/>
       <m.path d="M13 17v2" variants={perfVariants(2)} style={{ transformBox: "view-box", originX: "13px", originY: "18px" }}/>
      </m.g>
    </IconMotion>);
});
