"use client";

import { useEffect, useRef } from "react";

import type { TrustIconName } from "./trustIconName";
import { buildTrustIconScene } from "./trustIconScene";

export default function TrustIconsAnimation({
  icon,
  onReady,
}: {
  icon: TrustIconName;
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
    let scene: ReturnType<typeof buildTrustIconScene> | null = null;

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
      scene.render(clock);
    };

    const start = () => {
      if (animationFrame !== 0 || !visible || document.hidden) return;
      last = performance.now();
      animationFrame = requestAnimationFrame(loop);
    };

    const setup = async () => {
      if (document.fonts) await document.fonts.ready;
      if (cancelled) return;

      scene = buildTrustIconScene(svg, icon);
      scene.render(0);
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
  }, [icon]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 160 80"
      aria-hidden="true"
      className="h-full w-full overflow-visible"
    />
  );
}
