// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const MousePointer = forwardRef<SVGSVGElement, LucideProps>(function MousePointer(props, ref) {
    const duration = 0.7;
    const pointerVariants: Variants = {
        normal: { x: 0, y: 0, rotate: 0 },
        animate: {
            x: [0, 3, -0.5, 0],
            y: [0, 3, -0.5, 0],
            rotate: [0, -10, 4, 0],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.4, 0.75, 1],
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={pointerVariants} style={{ transformBox: "view-box", originX: "3px", originY: "3px" }}>
       <path d="M12.586 12.586 19 19"/>
       <path d="M3.688 3.037a.497.497 0 0 0-.651.651l6.5 15.999a.501.501 0 0 0 .947-.062l1.569-6.083a2 2 0 0 1 1.448-1.479l6.124-1.579a.5.5 0 0 0 .063-.947z"/>
      </m.g>
    </IconMotion>);
});
