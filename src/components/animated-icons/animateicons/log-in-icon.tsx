// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const LogIn = forwardRef<SVGSVGElement, LucideProps>(function LogIn(props, ref) {
    const duration = 0.7;
    const arrowVariants: Variants = {
        normal: { x: 0 },
        animate: {
            x: [0, 2.5, -0.6, 0],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.4, 0.75, 1],
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={arrowVariants}>
       <path d="m10 17 5-5-5-5"/>
       <path d="M15 12H3"/>
      </m.g>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
    </IconMotion>);
});
