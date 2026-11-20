// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const MoreHorizontal = forwardRef<SVGSVGElement, LucideProps>(function MoreHorizontal(props, ref) {
    const duration = 0.7;
    const dotVariants: Variants = {
        normal: { y: 0 },
        animate: (i: number) => ({
            y: [0, -3, 0],
            transition: {
                duration: 0.55 * duration,
                delay: i * 0.12 * duration,
                ease: "easeInOut",
            },
        }),
    };
    return (<IconMotion {...props} ref={ref}>
      <m.circle cx="5" cy="12" r="1" variants={dotVariants} custom={0}/>
      <m.circle cx="12" cy="12" r="1" variants={dotVariants} custom={1}/>
      <m.circle cx="19" cy="12" r="1" variants={dotVariants} custom={2}/>
    </IconMotion>);
});
