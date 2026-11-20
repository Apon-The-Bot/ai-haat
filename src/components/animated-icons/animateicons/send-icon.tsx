// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Send = forwardRef<SVGSVGElement, LucideProps>(function Send(props, ref) {
    const duration = 0.7;
    const planeVariants: Variants = {
        normal: { x: 0, y: 0, opacity: 1 },
        animate: {
            x: [0, 12, -12, 0],
            y: [0, -12, 12, 0],
            opacity: [1, 0, 0, 1],
            transition: {
                duration: 0.9 * duration,
                ease: ["easeIn", "easeInOut", "easeOut"],
                times: [0, 0.4, 0.45, 1],
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={planeVariants}>
       <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/>
       <path d="m21.854 2.147-10.94 10.939"/>
      </m.g>
    </IconMotion>);
});
