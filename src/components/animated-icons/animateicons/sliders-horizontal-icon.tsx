// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Sliders = forwardRef<SVGSVGElement, LucideProps>(function Sliders(props, ref) {
    const duration = 0.7;
    const trackVariants: Variants = {
        normal: { opacity: 1 },
        animate: {
            opacity: [1, 0.6, 1],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
            },
        },
    };
    const knobVariants: Variants = {
        normal: { x: 0 },
        animate: (i: number) => ({
            x: [0, i * 3, 0],
            transition: {
                duration: 0.7 * duration,
                ease: "easeInOut",
                delay: i * 0.05 * duration,
            },
        }),
    };
    return (<IconMotion {...props} ref={ref}>
      <m.path d="M10 5H3" variants={trackVariants}/>
      <m.path d="M21 5h-7" variants={trackVariants}/>
      <m.path d="M12 19H3" variants={trackVariants}/>
      <m.path d="M21 19h-5" variants={trackVariants}/>
      <m.path d="M21 12h-9" variants={trackVariants}/>
      <m.path d="M8 12H3" variants={trackVariants}/>

      <m.path d="M14 3v4" variants={knobVariants} custom={1}/>
      <m.path d="M16 17v4" variants={knobVariants} custom={-1}/>
      <m.path d="M8 10v4" variants={knobVariants} custom={1}/>
    </IconMotion>);
});
