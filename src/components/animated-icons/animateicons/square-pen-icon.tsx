// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Edit = forwardRef<SVGSVGElement, LucideProps>(function Edit(props, ref) {
    const duration = 0.7;
    const penVariants: Variants = {
        normal: { x: 0, y: 0, rotate: 0 },
        animate: {
            x: [0, -1.5, 1, -1, 0],
            y: [0, 1, -0.5, 0.8, 0],
            rotate: [0, -8, 4, -4, 0],
            transition: { duration: 0.8 * duration, ease: "easeInOut" },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <m.path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" variants={penVariants} style={{ transformBox: "view-box", originX: "9px", originY: "15px" }}/>
    </IconMotion>);
});
