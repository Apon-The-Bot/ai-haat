// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Edit2 = forwardRef<SVGSVGElement, LucideProps>(function Edit2(props, ref) {
    const duration = 0.7;
    const writeVariants: Variants = {
        normal: { rotate: 0 },
        animate: {
            rotate: [0, -4.5, 4, -2, 0],
            transition: { duration: 0.7 * duration, ease: "easeInOut" },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={writeVariants} style={{ transformBox: "view-box", originX: "3px", originY: "21px" }}>
       <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>
       <path d="m15 5 4 4"/>
      </m.g>
    </IconMotion>);
});
