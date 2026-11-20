// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const EyeOff = forwardRef<SVGSVGElement, LucideProps>(function EyeOff(props, ref) {
    const duration = 0.7;
    const bodyVariants: Variants = {
        normal: { opacity: 1 },
        animate: {
            opacity: [1, 0.45, 1],
            transition: { duration: 0.7 * duration, ease: "easeInOut" },
        },
    };
    const slashVariants: Variants = {
        normal: { strokeDashoffset: 0 },
        animate: {
            strokeDashoffset: [29, 0],
            transition: {
                duration: 0.45 * duration,
                ease: "easeInOut",
                delay: 0.1 * duration,
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={bodyVariants}>
       <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/>
       <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/>
       <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/>
      </m.g>
      <m.path d="m2 2 20 20" strokeDasharray="29" strokeDashoffset="0" variants={slashVariants}/>
    </IconMotion>);
});
