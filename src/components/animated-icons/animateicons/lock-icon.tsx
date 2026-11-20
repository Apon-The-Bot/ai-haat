// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Lock = forwardRef<SVGSVGElement, LucideProps>(function Lock(props, ref) {
    const duration = 0.7;
    const lockVariants: Variants = {
        normal: { x: 0, rotate: 0 },
        animate: {
            x: [0, -3, 3, -3, 0],
            rotate: [0, -2, 2, -2, 0],
            transition: { duration: 0.55 * duration },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={lockVariants}>
      <m.rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
      <m.path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </m.g>
    </IconMotion>);
});
