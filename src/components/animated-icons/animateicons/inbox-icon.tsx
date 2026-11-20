// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Inbox = forwardRef<SVGSVGElement, LucideProps>(function Inbox(props, ref) {
    const duration = 0.7;
    const trayVariants: Variants = {
        normal: { scaleY: 1 },
        animate: {
            scaleY: [1, 1.7, 0.9, 1],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.7, 1],
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.polyline points="22 12 16 12 14 15 10 15 8 12 2 12" variants={trayVariants} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}/>
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
    </IconMotion>);
});
