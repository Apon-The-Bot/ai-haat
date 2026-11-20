// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const UploadCloud = forwardRef<SVGSVGElement, LucideProps>(function UploadCloud(props, ref) {
    const duration = 0.7;
    const arrowVariants: Variants = {
        normal: { x: 0, y: 0 },
        animate: {
            x: [0, 0, 0, 0],
            y: [0, -1.5, 0.4, 0],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.7, 1],
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={arrowVariants}>
       <path d="M12 13v8"/>
       <path d="m8 17 4-4 4 4"/>
      </m.g>
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
    </IconMotion>);
});
