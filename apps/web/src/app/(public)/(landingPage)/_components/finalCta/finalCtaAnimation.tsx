"use client";

import type { StageStatus } from "@/components/common/stageshow";
import { type RefObject, useEffect, useRef } from "react";

import type { PlayOnceStageHandle } from "../stageControl";
import { PLAY_SECONDS, buildFinalCtaScene } from "./finalCtaScene";

const BODY_FONT = "var(--font-inter), system-ui, sans-serif";

export default function FinalCtaAnimation({
  onReady,
  onStatusChange,
  handleRef,
}: {
  onReady?: () => void;
  onStatusChange?: (status: StageStatus) => void;
  handleRef?: RefObject<PlayOnceStageHandle | null>;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const onReadyRef = useRef(onReady);
  const onStatusChangeRef = useRef(onStatusChange);
  const statusRef = useRef<StageStatus>("paused");

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cancelled = false;
    let animationFrame = 0;
    let last = 0;
    let clock = 0;
    let visible = false;
    let userPaused = false;
    let finished = false;
    let scene: ReturnType<typeof buildFinalCtaScene> | null = null;

    const updateStatus = (next: StageStatus) => {
      if (statusRef.current === next) return;
      statusRef.current = next;
      onStatusChangeRef.current?.(next);
    };

    const stop = (markPaused = true) => {
      if (animationFrame !== 0) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
      if (markPaused && !finished) updateStatus("paused");
    };

    const finish = () => {
      finished = true;
      if (animationFrame !== 0) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
      clock = PLAY_SECONDS;
      scene?.render(PLAY_SECONDS, PLAY_SECONDS);
      updateStatus("done");
    };

    const loop = (now: number) => {
      animationFrame = requestAnimationFrame(loop);
      if (!visible || !scene) {
        last = now;
        return;
      }

      const delta = Math.min(0.1, (now - last) / 1000);
      last = now;
      clock = Math.min(PLAY_SECONDS, clock + delta);
      scene.render(clock, clock);
      if (clock >= PLAY_SECONDS) finish();
    };

    const start = () => {
      if (
        animationFrame !== 0 ||
        finished ||
        !visible ||
        document.hidden ||
        userPaused ||
        motionQuery.matches
      ) {
        return;
      }
      last = performance.now();
      animationFrame = requestAnimationFrame(loop);
      updateStatus("playing");
    };

    const pause = () => {
      userPaused = true;
      stop();
    };

    const play = () => {
      userPaused = false;
      start();
    };

    const replay = () => {
      userPaused = false;
      finished = false;
      stop(false);
      clock = 0;
      scene?.render(0, 0);
      updateStatus("paused");
      start();
    };

    const handle: PlayOnceStageHandle = { pause, play, replay };
    if (handleRef) handleRef.current = handle;

    const setup = async () => {
      if (document.fonts) await document.fonts.ready;
      if (cancelled) return;

      clock = 0;
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
      stop(false);
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      motionQuery.removeEventListener("change", handleMotion);
      if (handleRef?.current === handle) handleRef.current = null;
      scene = null;
      svg.innerHTML = "";
    };
  }, [handleRef]);

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
