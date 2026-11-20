// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const HelpCircle = forwardRef<SVGSVGElement, LucideProps>(function HelpCircle(props, ref) {
    const duration = 0.7;
    const markVariants: Variants = {
        normal: { rotate: 0 },
        animate: {
            rotate: [0, -12, 10, -4, 0],
            transition: { duration: 0.7 * duration, ease: "easeInOut" },
        },
    };
    const dotVariants: Variants = {
        normal: { y: 0 },
        animate: {
            y: [0, -1.5, 0.5, 0],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                delay: 0.1 * duration,
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <circle cx="12" cy="12" r="10"/>
      <m.path d="M9.5 9.5C9.5 8.11929 10.6193 7 12 7C13.3807 7 14.5 8.11929 14.5 9.5C14.5 10.3569 14.0689 11.1131 13.4117 11.5636C12.7283 12.0319 12 12.6716 12 13.5" variants={markVariants} style={{ transformBox: "view-box", originX: "12px", originY: "10.5px" }}/>
      <m.path d="M12.125 16.75H12M12.25 16.75C12.25 16.8881 12.1381 17 12 17C11.8619 17 11.75 16.8881 11.75 16.75C11.75 16.6119 11.8619 16.5 12 16.5C12.1381 16.5 12.25 16.6119 12.25 16.75Z" variants={dotVariants}/>
    </IconMotion>);
});
