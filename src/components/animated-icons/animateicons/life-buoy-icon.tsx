// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const LifeBuoy = forwardRef<SVGSVGElement, LucideProps>(function LifeBuoy(props, ref) {
    const duration = 0.7;
    const buoyVariants: Variants = {
        normal: { rotate: 0, scale: 1, transition: { duration: 0 } },
        animate: {
            rotate: [0, 90],
            scale: [1, 0.9, 1],
            transition: { duration: 0.7 * duration, ease: "easeInOut" },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={buoyVariants} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}>
       <circle cx="12" cy="12" r="10"/>
       <path d="m4.93 4.93 4.24 4.24"/>
       <path d="m14.83 9.17 4.24-4.24"/>
       <path d="m14.83 14.83 4.24 4.24"/>
       <path d="m9.17 14.83-4.24 4.24"/>
       <circle cx="12" cy="12" r="4"/>
      </m.g>
    </IconMotion>);
});
