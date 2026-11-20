// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Ban = forwardRef<SVGSVGElement, LucideProps>(function Ban(props, ref) {
    const duration = 0.7;
    const slashVariants: Variants = {
        normal: { rotate: 0 },
        animate: {
            rotate: [0, -16, 12, -6, 0],
            transition: { duration: 0.7 * duration, ease: "easeInOut" },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <circle cx="12" cy="12" r="10"/>
      <m.path d="M4.929 4.929 19.07 19.071" variants={slashVariants} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}/>
    </IconMotion>);
});
