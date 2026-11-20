// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Cpu = forwardRef<SVGSVGElement, LucideProps>(function Cpu(props, ref) {
    const duration = 0.7;
    const pinVariants = (delay: number): Variants => ({
        normal: { opacity: 1 },
        animate: {
            opacity: [1, 0.2, 1],
            transition: {
                duration: 0.4 * duration,
                ease: "easeInOut",
                delay: delay * duration,
            },
        },
    });
    const coreVariants: Variants = {
        normal: { scale: 1 },
        animate: {
            scale: [1, 0.75, 1.15, 1],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.7, 1],
                delay: 0.1 * duration,
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <m.path d="M7 2v2" variants={pinVariants(0)}/>
      <m.path d="M12 2v2" variants={pinVariants(0.025)}/>
      <m.path d="M17 2v2" variants={pinVariants(0.05)}/>
      <m.path d="M20 7h2" variants={pinVariants(0.075)}/>
      <m.path d="M20 12h2" variants={pinVariants(0.1)}/>
      <m.path d="M20 17h2" variants={pinVariants(0.125)}/>
      <m.path d="M17 20v2" variants={pinVariants(0.15)}/>
      <m.path d="M12 20v2" variants={pinVariants(0.175)}/>
      <m.path d="M7 20v2" variants={pinVariants(0.2)}/>
      <m.path d="M2 17h2" variants={pinVariants(0.225)}/>
      <m.path d="M2 12h2" variants={pinVariants(0.25)}/>
      <m.path d="M2 7h2" variants={pinVariants(0.275)}/>
      <rect x="4" y="4" width="16" height="16" rx="2"/>
      <m.rect x="8" y="8" width="8" height="8" rx="1" variants={coreVariants} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}/>
    </IconMotion>);
});
