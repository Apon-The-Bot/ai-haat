// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Calculator = forwardRef<SVGSVGElement, LucideProps>(function Calculator(props, ref) {
    const duration = 0.7;
    const keyVariants = (i: number): Variants => ({
        normal: { scale: 1 },
        animate: {
            scale: [1, 1.8, 1],
            transition: {
                duration: 0.35 * duration,
                ease: "easeInOut",
                delay: (0.15 + i * 0.06) * duration,
            },
        },
    });
    const displayVariants: Variants = {
        normal: { strokeDashoffset: 0, opacity: 1 },
        animate: {
            strokeDashoffset: [9, 0],
            opacity: [0, 1],
            transition: {
                strokeDashoffset: { duration: 0.4 * duration, ease: "easeOut" },
                opacity: { duration: 0.25 * duration, ease: "easeOut" },
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <rect width="16" height="20" x="4" y="2" rx="2"/>
      <m.line x1="8" x2="16" y1="6" y2="6" strokeDasharray="9" strokeDashoffset="0" variants={displayVariants}/>
      <line x1="16" x2="16" y1="14" y2="18"/>
      <m.path d="M16 10h.01" variants={keyVariants(0)} style={{ transformBox: "view-box", originX: "16px", originY: "10px" }}/>
      <m.path d="M12 10h.01" variants={keyVariants(1)} style={{ transformBox: "view-box", originX: "12px", originY: "10px" }}/>
      <m.path d="M8 10h.01" variants={keyVariants(2)} style={{ transformBox: "view-box", originX: "8px", originY: "10px" }}/>
      <m.path d="M12 14h.01" variants={keyVariants(3)} style={{ transformBox: "view-box", originX: "12px", originY: "14px" }}/>
      <m.path d="M8 14h.01" variants={keyVariants(4)} style={{ transformBox: "view-box", originX: "8px", originY: "14px" }}/>
      <m.path d="M12 18h.01" variants={keyVariants(5)} style={{ transformBox: "view-box", originX: "12px", originY: "18px" }}/>
      <m.path d="M8 18h.01" variants={keyVariants(6)} style={{ transformBox: "view-box", originX: "8px", originY: "18px" }}/>
    </IconMotion>);
});
