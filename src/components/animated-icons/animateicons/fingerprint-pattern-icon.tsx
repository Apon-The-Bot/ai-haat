// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Fingerprint = forwardRef<SVGSVGElement, LucideProps>(function Fingerprint(props, ref) {
    const duration = 0.7;
    const ridgeVariants: Variants = {
        normal: { scale: 1 },
        animate: ([delay, amp]: number[]) => ({
            scale: [1, amp, 0.98, 1],
            transition: {
                duration: 0.45 * duration,
                ease: "easeInOut",
                times: [0, 0.4, 0.75, 1],
                delay: delay * duration,
            },
        }),
    };
    return (<IconMotion {...props} ref={ref}>
      <m.path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" variants={ridgeVariants} custom={[0, 1.1]} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}/>
      <m.path d="M14 13.12c0 2.38 0 6.38-1 8.88" variants={ridgeVariants} custom={[0.05, 1.1]} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}/>
      <m.path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" variants={ridgeVariants} custom={[0.15, 1.06]} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}/>
      <m.path d="M2 12a10 10 0 0 1 18-6" variants={ridgeVariants} custom={[0.22, 1.05]} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}/>
      <m.path d="M2 16h.01" variants={ridgeVariants} custom={[0.25, 1.05]} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}/>
      <m.path d="M21.8 16c.2-2 .131-5.354 0-6" variants={ridgeVariants} custom={[0.2, 1.05]} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}/>
      <m.path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" variants={ridgeVariants} custom={[0.12, 1.08]} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}/>
      <m.path d="M8.65 22c.21-.66.45-1.32.57-2" variants={ridgeVariants} custom={[0.15, 1.06]} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}/>
      <m.path d="M9 6.8a6 6 0 0 1 9 5.2v2" variants={ridgeVariants} custom={[0.08, 1.09]} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}/>
    </IconMotion>);
});
