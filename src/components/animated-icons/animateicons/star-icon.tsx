// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Star = forwardRef<SVGSVGElement, LucideProps>(function Star(props, ref) {
    const duration = 0.7;
    const starVariants: Variants = {
        normal: { rotate: 0, scale: 1 },
        animate: {
            rotate: [0, -12, 10, -5, 0],
            scale: [1, 1.06, 0.97, 1.02, 1],
            transition: { duration: 0.8 * duration, ease: "easeInOut" },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" variants={starVariants} style={{ transformBox: "view-box", originX: "12px", originY: "12.5px" }}/>
    </IconMotion>);
});
