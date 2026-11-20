// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const MoreVertical = forwardRef<SVGSVGElement, LucideProps>(function MoreVertical(props, ref) {
    const duration = 0.7;
    const dotVariants: Variants = {
        normal: { x: 0 },
        animate: (i: number) => ({
            x: [0, -3, 0],
            transition: {
                duration: 0.55 * duration,
                delay: i * 0.12 * duration,
                ease: "easeInOut",
            },
        }),
    };
    return (<IconMotion {...props} ref={ref}>
      <m.circle cx="12" cy="5" r="1" variants={dotVariants} custom={0}/>
      <m.circle cx="12" cy="12" r="1" variants={dotVariants} custom={1}/>
      <m.circle cx="12" cy="19" r="1" variants={dotVariants} custom={2}/>
    </IconMotion>);
});
