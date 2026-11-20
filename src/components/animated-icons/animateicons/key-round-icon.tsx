// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const KeyRound = forwardRef<SVGSVGElement, LucideProps>(function KeyRound(props, ref) {
    const duration = 0.7;
    const turnVariants: Variants = {
        normal: { rotate: 0 },
        animate: {
            rotate: [0, -8, 3, 0],
            transition: {
                duration: 0.7 * duration,
                ease: "easeInOut",
                times: [0, 0.4, 0.75, 1],
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={turnVariants} style={{ transformBox: "view-box", originX: "16.5px", originY: "7.5px" }}>
       <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/>
       <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>
      </m.g>
    </IconMotion>);
});
