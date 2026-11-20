// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Boxes = forwardRef<SVGSVGElement, LucideProps>(function Boxes(props, ref) {
    const duration = 0.7;
    const iconVariants: Variants = {
        normal: { scale: 1 },
        animate: {
            scale: [1, 1.04, 1],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
            },
        },
    };
    const groupVariants: Variants = {
        normal: { y: 0 },
        animate: (i: number) => ({
            y: [0, -2 - i, 0],
            transition: {
                duration: 0.54 * duration,
                delay: i * 0.08 * duration,
                ease: "easeInOut",
            },
        }),
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={iconVariants}>
      <m.g variants={groupVariants} custom={2}>
       <path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z"/>
       <path d="m7 16.5-4.74-2.85"/>
       <path d="m7 16.5 5-3"/>
       <path d="M7 16.5v5.17"/>
      </m.g>

      <m.g variants={groupVariants} custom={1}>
       <path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z"/>
       <path d="m17 16.5-5-3"/>
       <path d="m17 16.5 4.74-2.85"/>
       <path d="M17 16.5v5.17"/>
      </m.g>

      <m.g variants={groupVariants} custom={0}>
       <path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z"/>
       <path d="M12 8 7.26 5.15"/>
       <path d="m12 8 4.74-2.85"/>
       <path d="M12 13.5V8"/>
      </m.g>
      </m.g>
    </IconMotion>);
});
