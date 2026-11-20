// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const LayoutDashboard = forwardRef<SVGSVGElement, LucideProps>(function LayoutDashboard(props, ref) {
    const duration = 0.7;
    const tileVariants: Variants = {
        normal: { scale: 1 },
        animate: (i: number) => ({
            scale: [1, 0.78, 1.1, 1],
            transition: {
                duration: 0.51 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.75, 1],
                delay: i * 0.048 * duration,
            },
        }),
    };
    return (<IconMotion {...props} ref={ref}>
      <m.rect width="7" height="9" x="3" y="3" rx="1" variants={tileVariants} custom={0} style={{ transformBox: "fill-box", originX: "50%", originY: "50%" }}/>
      <m.rect width="7" height="5" x="14" y="3" rx="1" variants={tileVariants} custom={1} style={{ transformBox: "fill-box", originX: "50%", originY: "50%" }}/>
      <m.rect width="7" height="9" x="14" y="12" rx="1" variants={tileVariants} custom={2} style={{ transformBox: "fill-box", originX: "50%", originY: "50%" }}/>
      <m.rect width="7" height="5" x="3" y="16" rx="1" variants={tileVariants} custom={3} style={{ transformBox: "fill-box", originX: "50%", originY: "50%" }}/>
    </IconMotion>);
});
