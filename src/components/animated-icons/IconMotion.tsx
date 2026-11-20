"use client";

import { LazyMotion, domMin, m, useAnimationControls } from "framer-motion";
import type { SVGMotionProps } from "framer-motion";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { LucideProps } from "lucide-react";

const interactive = "a[href],button,input,select,textarea,summary,[role=button],[role=link],[data-icon-trigger]";
const playing = new Set<SVGSVGElement>();

function disabled(host: Element) {
  return host.matches(":disabled,[aria-disabled=true]");
}

export const IconMotion = forwardRef<SVGSVGElement, LucideProps>(function IconMotion(
  { size = 24, color = "currentColor", strokeWidth = 2, absoluteStrokeWidth, children, ...props },
  ref,
) {
  const element = useRef<SVGSVGElement>(null);
  const controls = useAnimationControls();
  useImperativeHandle(ref, () => element.current!, []);

  useEffect(() => {
    const icon = element.current;
    if (!icon) return;
    const host = icon.closest(interactive) ?? icon;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let run = 0;
    let observer: IntersectionObserver | undefined;
    const stop = (reset = true) => {
      run++;
      controls.stop();
      if (reset) controls.set("normal");
      playing.delete(icon);
      observer?.disconnect();
      observer = undefined;
      motion.removeEventListener("change", onPreferenceChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
    const start = () => {
      if (document.hidden || motion.matches || disabled(host) || playing.has(icon) || playing.size >= 3) return;
      const bounds = icon.getBoundingClientRect();
      if (!bounds.width || !bounds.height || bounds.bottom <= 0 || bounds.top >= innerHeight ||
        bounds.right <= 0 || bounds.left >= innerWidth) return;
      const current = ++run;
      playing.add(icon);
      motion.addEventListener("change", onPreferenceChange);
      document.addEventListener("visibilitychange", onVisibilityChange);
      observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) stop();
      });
      observer.observe(icon);
      void controls.start("animate").then(() => {
        if (run === current) stop();
      }, () => {
        if (run === current) stop(false);
      });
    };
    const onPointer = (event: Event) => {
      if ((event as PointerEvent).pointerType !== "touch") start();
    };
    const onPreferenceChange = () => {
      if (motion.matches) stop();
    };
    const onVisibilityChange = () => {
      if (document.hidden) stop();
    };

    host.addEventListener("pointerenter", onPointer);
    host.addEventListener("focusin", start);
    host.addEventListener("click", start);
    return () => {
      host.removeEventListener("pointerenter", onPointer);
      host.removeEventListener("focusin", start);
      host.removeEventListener("click", start);
      stop(false);
    };
  }, [controls]);

  const numericSize = Number(size);
  return (
    <LazyMotion features={domMin}>
      <m.svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={absoluteStrokeWidth && numericSize ? Number(strokeWidth) * 24 / numericSize : strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...(props as SVGMotionProps<SVGSVGElement>)}
        data-animateicons=""
        ref={element}
        initial="normal"
        animate={controls}
      >
        {children}
      </m.svg>
    </LazyMotion>
  );
});
