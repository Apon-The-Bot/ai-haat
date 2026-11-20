// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Heart = forwardRef<SVGSVGElement, LucideProps>(function Heart(props, ref) {
    const duration = 0.7;
    const heartVariants: Variants = {
        normal: { scale: 1 },
        animate: {
            scale: [1, 1.13, 0.97, 1.07, 1],
            transition: {
                duration: 0.8 * duration,
                ease: "easeInOut",
                times: [0, 0.25, 0.5, 0.75, 1],
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" variants={heartVariants} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}/>
    </IconMotion>);
});
