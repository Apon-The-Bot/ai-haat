// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Power = forwardRef<SVGSVGElement, LucideProps>(function Power(props, ref) {
    const duration = 0.7;
    const stemVariants: Variants = {
        normal: { y: 0 },
        animate: {
            y: [0, 2, -0.4, 0],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.7, 1],
            },
        },
    };
    const ringVariants: Variants = {
        normal: { scale: 1 },
        animate: {
            scale: [1, 1.07, 0.97, 1],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.7, 1],
                delay: 0.1 * duration,
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.path d="M12 2v10" variants={stemVariants}/>
      <m.path d="M18.4 6.6a9 9 0 1 1-12.77.04" variants={ringVariants} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}/>
    </IconMotion>);
});
