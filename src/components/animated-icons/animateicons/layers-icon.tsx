// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Layers = forwardRef<SVGSVGElement, LucideProps>(function Layers(props, ref) {
    const duration = 0.7;
    const topVariants: Variants = {
        normal: { y: 0 },
        animate: {
            y: [0, 3, 0],
            transition: { duration: 0.6 * duration, ease: "easeInOut" },
        },
    };
    const bottomVariants: Variants = {
        normal: { y: 0 },
        animate: {
            y: [0, -3, 0],
            transition: { duration: 0.6 * duration, ease: "easeInOut" },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" variants={topVariants}/>
      <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/>
      <m.path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" variants={bottomVariants}/>
    </IconMotion>);
});
