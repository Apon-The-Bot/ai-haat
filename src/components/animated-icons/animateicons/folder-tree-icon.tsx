// Adapted from AnimateIcons. See the adjacent MIT license.
"use client";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { IconMotion } from "../IconMotion";
export const FolderTree = forwardRef<SVGSVGElement, LucideProps>(function FolderTree(props, ref) {
    const duration = 0.7;
    const nudgeVariants = (delay: number): Variants => ({
        normal: { x: 0 },
        animate: {
            x: [0, 1.5, -0.4, 0],
            transition: {
                duration: 0.6 * duration,
                ease: "easeInOut",
                times: [0, 0.35, 0.7, 1],
                delay: delay * duration,
            },
        },
    });
    return (<IconMotion {...props} ref={ref}>
      <m.path d="M20 10a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2.5a1 1 0 0 1-.8-.4l-.9-1.2A1 1 0 0 0 15 3h-2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z" variants={nudgeVariants(0)}/>
      <m.path d="M20 21a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-2.9a1 1 0 0 1-.88-.55l-.42-.85a1 1 0 0 0-.92-.6H13a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z" variants={nudgeVariants(0.1)}/>
      <path d="M3 5a2 2 0 0 0 2 2h3"/>
      <path d="M3 3v13a2 2 0 0 0 2 2h3"/>
    </IconMotion>);
});
