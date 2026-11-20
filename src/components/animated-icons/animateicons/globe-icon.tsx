// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Globe = forwardRef<SVGSVGElement, LucideProps>(function Globe(props, ref) {
    const duration = 0.7;
    const meridianVariants: Variants = {
        normal: { scaleX: 1 },
        animate: {
            scaleX: [1, -1, 1],
            transition: { duration: 0.9 * duration, ease: "easeInOut" },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <circle cx="12" cy="12" r="10"/>
      <m.path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" variants={meridianVariants} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}/>
      <path d="M2 12h20"/>
    </IconMotion>);
});
