// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const ShoppingCart = forwardRef<SVGSVGElement, LucideProps>(function ShoppingCart(props, ref) {
    const duration = 0.7;
    const cartVariants: Variants = {
        normal: { x: 0 },
        animate: {
            x: [0, -1.2, 0.9, 0],
            transition: {
                duration: 0.7 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.7, 1],
            },
        },
    };
    const wheelVariants = (delay: number): Variants => ({
        normal: { y: 0 },
        animate: {
            y: [0, -1, 0.3, 0],
            transition: {
                duration: 0.5 * duration,
                ease: "easeInOut",
                delay: delay * duration,
                times: [0, 0.35, 0.7, 1],
            },
        },
    });
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={cartVariants}>
       <m.circle cx="8" cy="21" r="1" variants={wheelVariants(0.1)}/>
       <m.circle cx="19" cy="21" r="1" variants={wheelVariants(0.2)}/>
       <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
      </m.g>
    </IconMotion>);
});
