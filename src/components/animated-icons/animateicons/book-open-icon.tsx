// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const BookOpen = forwardRef<SVGSVGElement, LucideProps>(function BookOpen(props, ref) {
    const duration = 0.7;
    const bookVariants: Variants = {
        normal: { scaleX: 1 },
        animate: {
            scaleX: [1, 0.8, 1.05, 1],
            transition: {
                duration: 0.8 * duration,
                ease: "easeInOut",
                times: [0, 0.3, 0.72, 1],
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <path d="M12 5v16"/>
      <m.path d="M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z" variants={bookVariants} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}/>
    </IconMotion>);
});
