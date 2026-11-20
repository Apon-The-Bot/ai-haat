"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { ReactNode } from "react";
import { animatedIconAssets } from "./registry";
import type { AnimatedIconName } from "./registry";

const sizes = { xs: 16, sm: 20, md: 24, lg: 32, xl: 48, feature: 64 } as const;
const playing = new Set<HTMLVideoElement>();
const interactive = "a[href],button,input,select,textarea,summary,[role=button],[role=link],[data-icon-trigger]";
const layer = "absolute inset-0 h-full w-full object-contain";

export type AnimatedIconControl = {
  play(): void;
  pause(): void;
  restart(): void;
};

type Props = {
  name: AnimatedIconName;
  size?: keyof typeof sizes;
  trigger?: "hover" | "press" | "state" | "viewport" | "manual";
  active?: boolean;
  loop?: boolean;
  fallback: ReactNode;
  className?: string;
} & ({ decorative?: true; label?: never } | { decorative?: false; label: string });

export const AnimatedIcon = forwardRef<AnimatedIconControl, Props>(function AnimatedIcon(props, ref) {
  return <IconPlayer key={props.name} {...props} ref={ref} />;
});

const IconPlayer = forwardRef<AnimatedIconControl, Props>(function IconPlayer(
  { name, size = "md", trigger = "hover", active = false, loop = false, fallback, label, className },
  ref,
) {
  const root = useRef<HTMLSpanElement>(null);
  const media = useRef<HTMLVideoElement>(null);
  const request = useRef<AnimatedIconControl>();
  const asset = animatedIconAssets[name];
  const [posterReady, setPosterReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const busy = trigger === "state" && active && loop;
  const activeRef = useRef(active);

  useImperativeHandle(ref, () => ({
    play: () => request.current?.play(),
    pause: () => request.current?.pause(),
    restart: () => request.current?.restart(),
  }), []);

  useEffect(() => {
    const node = root.current;
    const video = media.current;
    if (!node || !video || !asset || failed) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const host = node.closest(interactive) ?? node;
    let visible = false;
    let entered = false;
    let statePlayed = false;
    let disposed = false;
    let playback = 0;

    function pause() {
      if (!video) return;
      playback++;
      video.pause();
      playing.delete(video);
      setShowVideo(false);
    }

    function start(restart = false): boolean {
      if (!video || !visible || motion.matches || document.hidden) return false;
      if (trigger === "state" && !activeRef.current) return false;
      if (!playing.has(video) && playing.size >= 3) return false;
      if (!video.src && asset) video.src = asset.video;
      if (restart && video.readyState >= HTMLMediaElement.HAVE_METADATA) video.currentTime = 0;
      if (playing.has(video) && !restart) return true;
      const attempt = ++playback;
      playing.add(video);
      void video.play().then(() => {
        if (!disposed && playback === attempt) setShowVideo(true);
      }).catch(() => {
        if (!disposed && playback === attempt) pause();
      });
      return true;
    }

    function checkPlayback() {
      if (!visible || motion.matches || document.hidden) {
        pause();
      } else if (trigger === "viewport" && !entered) {
        entered = start(true);
      } else if (trigger === "state" && activeRef.current && (loop || !statePlayed)) {
        statePlayed = start(!loop);
      }
    }

    const onPlay = () => { start(true); };
    const onEnded = () => pause();
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= 0.25;
      checkPlayback();
    }, { threshold: 0.25 });
    observer.observe(node);
    motion.addEventListener("change", checkPlayback);
    document.addEventListener("visibilitychange", checkPlayback);
    video.addEventListener("ended", onEnded);
    if (trigger === "hover") {
      host.addEventListener("pointerenter", onPlay);
      host.addEventListener("focusin", onPlay);
    }
    if (trigger === "press") host.addEventListener("click", onPlay);
    request.current = {
      play: () => {
        if (trigger === "state" && !activeRef.current) {
          statePlayed = false;
          pause();
        } else if (trigger === "state" || trigger === "viewport") checkPlayback();
        else start();
      },
      pause,
      restart: onPlay,
    };
    return () => {
      disposed = true;
      request.current = undefined;
      observer.disconnect();
      motion.removeEventListener("change", checkPlayback);
      document.removeEventListener("visibilitychange", checkPlayback);
      host.removeEventListener("pointerenter", onPlay);
      host.removeEventListener("focusin", onPlay);
      host.removeEventListener("click", onPlay);
      video.removeEventListener("ended", onEnded);
      video.pause();
      playing.delete(video);
      video.removeAttribute("src");
      video.load();
    };
  }, [asset, failed, loop, trigger]);

  useEffect(() => {
    activeRef.current = active;
    if (trigger === "state") request.current?.play();
  }, [active, trigger]);

  return (
    <span
      ref={root}
      className={`relative inline-flex shrink-0 align-middle${className ? ` ${className}` : ""}`}
      style={{ width: sizes[size], height: sizes[size] }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {(!posterReady || failed) && <span className="flex h-full w-full items-center justify-center" aria-hidden="true">{fallback}</span>}
      {asset && !failed && (
        <>
          {/* The locally generated frame is shared with the reduced-motion experience. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset.poster}
            alt=""
            loading="lazy"
            decoding="async"
            className={layer}
            style={{ visibility: posterReady && !showVideo ? "visible" : "hidden" }}
            onLoad={() => setPosterReady(true)}
            onError={() => setFailed(true)}
          />
          <video
            ref={media}
            className={layer}
            style={{ visibility: showVideo ? "visible" : "hidden" }}
            preload="none"
            muted
            playsInline
            loop={busy}
            aria-hidden="true"
            onError={() => {
              setShowVideo(false);
              setFailed(true);
            }}
          />
        </>
      )}
    </span>
  );
});
