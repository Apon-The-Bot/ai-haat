// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Laptop = forwardRef<SVGSVGElement, LucideProps>(function Laptop(props, ref) {
    const duration = 0.7;
    const hinge = {
        transformPerspective: 55,
        originX: "12px",
        originY: "15.526px",
    };
    const lidVariants: Variants = {
        normal: {
            rotateX: 0,
            ...hinge,
            transition: { duration: 0.5 * duration, ease: "easeInOut" },
        },
        animate: {
            rotateX: [0, 72, -6, 2, 0],
            ...hinge,
            transition: {
                duration: 1.4 * duration,
                ease: "easeInOut",
                times: [0, 0.2, 0.7, 0.88, 1],
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.path d="M4 15.526V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8.526" variants={lidVariants} style={{ transformBox: "view-box" }}/>
      <path d="M20 15.526a2 2 0 0 0 .212.897l1.068 2.127a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45l1.068-2.127A2 2 0 0 0 4 15.526"/>
      <path d="M20.054 15.987H3.946"/>
    </IconMotion>);
});
