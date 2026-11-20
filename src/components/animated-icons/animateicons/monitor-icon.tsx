// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Monitor = forwardRef<SVGSVGElement, LucideProps>(function Monitor(props, ref) {
    const duration = 0.7;
    const screenVariants: Variants = {
        normal: { rotate: 0 },
        animate: {
            rotate: [0, -5, 4, -2, 0],
            transition: { duration: 0.7 * duration, ease: "easeInOut" },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.rect width="20" height="14" x="2" y="3" rx="2" variants={screenVariants} style={{ transformBox: "view-box", originX: "12px", originY: "17px" }}/>
      <line x1="8" x2="16" y1="21" y2="21"/>
      <line x1="12" x2="12" y1="17" y2="21"/>
    </IconMotion>);
});
