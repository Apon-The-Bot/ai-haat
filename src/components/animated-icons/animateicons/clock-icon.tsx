// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Clock = forwardRef<SVGSVGElement, LucideProps>(function Clock(props, ref) {
    const duration = 0.7;
    const minuteVariants: Variants = {
        normal: { rotate: 0, transition: { duration: 0 } },
        animate: {
            rotate: [0, 360],
            transition: { duration: 0.9 * duration, ease: "easeInOut" },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <circle cx="12" cy="12" r="10"/>
      <m.path d="M12 6V12" variants={minuteVariants} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}/>
      <path d="M12 12L16 14"/>
    </IconMotion>);
});
