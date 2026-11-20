// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const Award = forwardRef<SVGSVGElement, LucideProps>(function Award(props, ref) {
    const duration = 0.7;
    const cupVariants: Variants = {
        normal: { y: 0 },
        animate: {
            y: [0, -2, 0.5, 0],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.7, 1],
            },
        },
    };
    const stemVariants: Variants = {
        normal: { scaleY: 1 },
        animate: {
            scaleY: [1, 1.6, 1, 1],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.7, 1],
            },
        },
    };
    return (<IconMotion {...props} ref={ref}>
      <path d="M15.9349 21.033C16.1789 21.5331 15.699 22 15.1239 22H8.87606C8.30096 22 7.82107 21.5331 8.06509 21.033C8.63149 19.8722 10.1793 19 12 19C13.8207 19 15.3685 19.8722 15.9349 21.033Z"/>
      <m.path d="M12 16L11.9883 19" variants={stemVariants} style={{ transformBox: "view-box", originX: "12px", originY: "19px" }}/>
      <m.g variants={cupVariants}>
       <path d="M17.9866 4.49139C17.992 4.30176 17.9963 4.11477 17.9997 3.93095C18.0194 2.86463 17.1162 2.00002 16.0093 2.00002L7.99052 2C6.88381 2 5.98074 2.86438 6.00031 3.93054C6.00358 4.10833 6.00768 4.28907 6.01283 4.47231C6.05734 6.05627 6.18024 7.82593 6.51875 9.47415C7.18043 12.6958 8.66606 16 12.0001 16C15.3341 16 16.8193 12.6958 17.481 9.47415C17.8181 7.83255 17.9415 6.07048 17.9866 4.49139Z"/>
       <path d="M18 4.5L19.4447 4.68748C20.9062 4.87714 22 6.122 22 7.59578C22 8.99373 21.0133 10.1973 19.6425 10.4715L17.5 11"/>
       <path d="M6 4.5L4.55527 4.68748C3.09375 4.87714 2 6.122 2 7.59578C2 8.99373 2.98673 10.1973 4.35754 10.4715L6.5 11"/>
      </m.g>
    </IconMotion>);
});
