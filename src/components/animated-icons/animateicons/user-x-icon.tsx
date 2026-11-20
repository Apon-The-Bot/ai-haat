// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const UserX = forwardRef<SVGSVGElement, LucideProps>(function UserX(props, ref) {
    const duration = 0.7;
    const headVariants: Variants = {
        normal: { y: 0 },
        animate: {
            y: [0, -1.5, 0.5, 0],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.7, 1],
            },
        },
    };
    const crossVariants: Variants = {
        normal: { rotate: 0, scale: 1, transition: { duration: 0 } },
        animate: {
            rotate: [0, 90],
            scale: [1, 1.2, 1],
            transition: { duration: 0.5 * duration, ease: "easeInOut" },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <m.circle cx="9" cy="7" r="4" variants={headVariants}/>
      <m.g variants={crossVariants} style={{
            transformBox: "view-box",
            originX: "19.5px",
            originY: "10.5px",
        }}>
       <line x1="17" x2="22" y1="8" y2="13"/>
       <line x1="22" x2="17" y1="8" y2="13"/>
      </m.g>
    </IconMotion>);
});
