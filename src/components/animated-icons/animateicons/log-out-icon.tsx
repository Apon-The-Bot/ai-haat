// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const LogOut = forwardRef<SVGSVGElement, LucideProps>(function LogOut(props, ref) {
    const duration = 0.7;
    const arrowVariants: Variants = {
        normal: { x: 0 },
        animate: {
            x: [0, -1, 1.6, 0],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.25, 0.65, 1],
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={arrowVariants}>
       <path d="m16 17 5-5-5-5"/>
       <path d="M21 12H9"/>
      </m.g>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    </IconMotion>);
});
