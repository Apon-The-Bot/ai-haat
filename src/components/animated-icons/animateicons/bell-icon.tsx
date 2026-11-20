// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Bell = forwardRef<SVGSVGElement, LucideProps>(function Bell(props, ref) {
    const duration = 0.7;
    const bellVariants: Variants = {
        normal: { rotate: 0 },
        animate: {
            rotate: [0, -12, 10.2, -6, 3, 0],
            transition: { duration: 1.1 * duration, ease: "easeInOut" },
        },
    };
    const clapperVariants: Variants = {
        normal: { x: 0 },
        animate: {
            x: [0, 1.7, -1.4, 0.8, -0.4, 0],
            transition: { duration: 1.1 * duration, ease: "easeInOut" },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={bellVariants}>
      <m.path d="M10.268 21a2 2 0 0 0 3.464 0" variants={clapperVariants}/>
      <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>
      </m.g>
    </IconMotion>);
});
