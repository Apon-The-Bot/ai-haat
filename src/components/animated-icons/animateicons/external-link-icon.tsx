// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const ExternalLink = forwardRef<SVGSVGElement, LucideProps>(function ExternalLink(props, ref) {
    const duration = 0.7;
    const arrowVariants: Variants = {
        normal: { x: 0, y: 0 },
        animate: {
            x: [0, 1.5, -0.4, 0],
            y: [0, -1.5, 0.4, 0],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.4, 0.75, 1],
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={arrowVariants}>
       <path d="M15 3h6v6"/>
       <path d="M10 14 21 3"/>
      </m.g>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    </IconMotion>);
});
