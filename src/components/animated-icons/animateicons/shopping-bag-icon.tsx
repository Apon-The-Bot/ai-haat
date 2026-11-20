// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const ShoppingBag = forwardRef<SVGSVGElement, LucideProps>(function ShoppingBag(props, ref) {
    const duration = 0.7;
    const bagVariants: Variants = {
        normal: { rotate: 0 },
        animate: {
            rotate: [0, -5, 4, -2, 0],
            transition: { duration: 0.8 * duration, ease: "easeInOut" },
        },
    };
    const handleVariants: Variants = {
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
    return (<IconMotion {...props} ref={ref}>
      <m.g variants={bagVariants} style={{ transformBox: "view-box", originX: "12px", originY: "4px" }}>
       <path d="M3.103 6.034h17.794"/>
       <path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z"/>
       <m.path d="M16 10a4 4 0 0 1-8 0" variants={handleVariants}/>
      </m.g>
    </IconMotion>);
});
