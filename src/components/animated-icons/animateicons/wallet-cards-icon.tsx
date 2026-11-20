// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const WalletCards = forwardRef<SVGSVGElement, LucideProps>(function WalletCards(props, ref) {
    const duration = 0.7;
    const cardVariants: Variants = {
        normal: { y: 0 },
        animate: {
            y: [0, -1.6, 0.5, 0],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.7, 1],
            },
        },
    };
    const pocketVariants: Variants = {
        normal: { y: 0 },
        animate: {
            y: [0, 1.2, -0.4, 0],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.7, 1],
                delay: 0.05 * duration,
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.path d="M3 11h3.75a2 2 0 0 1 1.6.8l.45.6a4 4 0 0 0 6.4 0l.45-.6a2 2 0 0 1 1.6-.8H21" variants={pocketVariants}/>
      <m.path d="M3 7h18" variants={cardVariants}/>
      <rect x="3" y="3" width="18" height="18" rx="2"/>
    </IconMotion>);
});
