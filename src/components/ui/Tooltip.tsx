"use client";

import React, { cloneElement, isValidElement, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  content: string;
  children: React.ReactElement<any>;
  delay?: number;
}

const TOOLTIP_ID_PREFIX = "aihaat-tooltip-";

/** A small, non-interactive tooltip for supplementary action guidance. */
export function Tooltip({ content, children, delay = 350 }: TooltipProps) {
  const triggerRef = useRef<HTMLElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, above: true });
  const idRef = useRef(`${TOOLTIP_ID_PREFIX}${Math.random().toString(36).slice(2)}`);

  const updatePosition = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const above = rect.top >= 64;
    setPosition({
      top: above ? rect.top - 8 : rect.bottom + 8,
      left: Math.min(Math.max(8, rect.left + rect.width / 2), window.innerWidth - 8),
      above,
    });
  };

  const show = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      updatePosition();
      setOpen(true);
    }, delay);
  };

  const hide = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") hide();
    };
    const onViewportChange = () => updatePosition();
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onViewportChange, true);
    window.addEventListener("resize", onViewportChange);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onViewportChange, true);
      window.removeEventListener("resize", onViewportChange);
    };
  }, [open]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  if (!isValidElement(children)) return children;
  const childProps = children.props as { onMouseEnter?: React.MouseEventHandler; onMouseLeave?: React.MouseEventHandler; onFocus?: React.FocusEventHandler; onBlur?: React.FocusEventHandler; onKeyDown?: React.KeyboardEventHandler; "aria-describedby"?: string };

  const trigger = cloneElement(children as React.ReactElement<any>, {
    ref: triggerRef,
    "aria-describedby": open ? idRef.current : childProps["aria-describedby"],
    onMouseEnter: (event: React.MouseEvent) => { childProps.onMouseEnter?.(event); show(); },
    onMouseLeave: (event: React.MouseEvent) => { childProps.onMouseLeave?.(event); hide(); },
    onFocus: (event: React.FocusEvent) => { childProps.onFocus?.(event); show(); },
    onBlur: (event: React.FocusEvent) => { childProps.onBlur?.(event); hide(); },
    onKeyDown: (event: React.KeyboardEvent) => { childProps.onKeyDown?.(event); if (event.key === "Escape") hide(); },
  });

  return (
    <>
      {trigger}
      {open && typeof document !== "undefined" && createPortal(
        <div
          id={idRef.current}
          role="tooltip"
          className={`pointer-events-none fixed z-[60] max-w-[280px] -translate-x-1/2 rounded-md bg-slate-900 px-2.5 py-1.5 text-center text-xs font-medium leading-4 text-white shadow-lg motion-safe:animate-in motion-safe:fade-in motion-safe:duration-100 ${position.above ? "-translate-y-full" : ""}`}
          style={{ top: position.top, left: position.left }}
        >
          {content}
        </div>,
        document.body,
      )}
    </>
  );
}
