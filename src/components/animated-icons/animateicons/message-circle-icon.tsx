// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const MessageCircle = forwardRef<SVGSVGElement, LucideProps>(function MessageCircle(props, ref) {
    const duration = 0.7;
    const popVariants: Variants = {
        normal: { scale: 1 },
        animate: {
            scale: [1, 0.7, 1.05, 1],
            transition: {
                duration: 0.65 * duration,
                times: [0, 0.35, 0.75, 1],
                ease: "easeInOut",
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={popVariants} style={{ transformBox: "view-box", originX: "4px", originY: "20px" }}>
       <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065
	               3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2
	               0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/>
      </m.g>
    </IconMotion>);
});
