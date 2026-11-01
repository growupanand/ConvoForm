"use client";

import { useEffect, useRef } from "react";

import { LOOP_SECONDS, buildFinalCtaScene } from "./finalCtaScene";

const BODY_FONT = "var(--font-inter), system-ui, sans-serif";

export default function FinalCtaAnimation({
  onReady,
}: {
  onReady?: () => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cancelled = false;
    let animationFrame = 0;
    let last = 0;
    let clock = 0;
    let visible = false;
    let scene: ReturnType<typeof buildFinalCtaScene> | null = null;

    const stop = () => {
      if (animationFrame !== 0) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
    };

    const loop = (now: number) => {
      animationFrame = requestAnimationFrame(loop);
      if (!visible || !scene) {
        last = now;
        return;
      }

      const delta = Math.min(0.1, (now - last) / 1000);
      last = now;
      clock += delta;
      scene.render(clock % LOOP_SECONDS, clock);
    };

    const start = () => {
      if (animationFrame !== 0 || !visible || document.hidden) return;
      last = performance.now();
      animationFrame = requestAnimationFrame(loop);
    };

    const setup = async () => {
      if (document.fonts) await document.fonts.ready;
      if (cancelled) return;

      scene = buildFinalCtaScene(svg);
      scene.render(0, 0);
      onReadyRef.current?.();
      start();
    };

    void setup();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visible = entry.isIntersecting;
          if (entry.isIntersecting) start();
          else stop();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(svg);

    const handleVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    const handleMotion = () => {
      if (motionQuery.matches) stop();
      else start();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    motionQuery.addEventListener("change", handleMotion);

    return () => {
      cancelled = true;
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      motionQuery.removeEventListener("change", handleMotion);
      scene = null;
      svg.innerHTML = "";
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="16 84 428 196"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      className="block h-full w-full overflow-visible"
      style={{ fontFamily: BODY_FONT }}
    />
  );
}
