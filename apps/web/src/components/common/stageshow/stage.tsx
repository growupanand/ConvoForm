"use client";

// Ported from the Stageshow kit (MIT, see LICENSE in this folder). The kit's
// stage resets off-screen and runs on timers; this one keeps a scene clock
// that only advances while the stage is in view and the tab is visible, so a
// loop pauses where it is and resumes from there.

import {
  type ReactNode,
  use,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import {
  type Act,
  type Layout,
  type Point,
  createAct,
  placeCursor,
} from "./act";
import { SceneClock, Stopped } from "./clock";
import {
  StageBox,
  StageCanvas,
  type StageSizes,
  layoutFor,
} from "./stageFrame";
import { StageGateContext } from "./stageGate";
import styles from "./stageshow.module.css";

export interface StageProps<S> {
  sizes: StageSizes;
  initial: S;
  /** One loop. It must end in `initial`, with the cursor back at rest. */
  script: (act: Act<S>) => Promise<void>;
  /** Where the cursor rests at the start and end of every loop. */
  rest: Record<Layout, Point>;
  /** The scene for a state and layout: the same function the static frames use. */
  children: (state: S, layout: Layout) => ReactNode;
}

function CursorGlyph() {
  return (
    <svg width="18" height="22" viewBox="0 0 18 22" aria-hidden="true">
      <path
        d="M2 2v15.2l4.1-3.9 2.6 6.1 2.7-1.2-2.6-6h5.7L2 2Z"
        fill="var(--marketing-ink)"
        stroke="var(--marketing-surface)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Stage<S>({
  sizes,
  initial,
  script,
  rest,
  children,
}: StageProps<S>) {
  const gate = use(StageGateContext);
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorAt = useRef<Point>({ x: 0, y: 0 });
  const [clock] = useState(() => new SceneClock());
  const [layout, setLayout] = useState<Layout | null>(null);
  const [state, setState] = useState(initial);

  // The layout comes from the stage's width, with the same breakpoint the
  // static frames use in CSS
  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const measure = () => setLayout(layoutFor(host.clientWidth));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  // The clock runs only while the stage is on screen, the tab is visible and
  // the fonts are in, so nothing is measured or started with fallback faces
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let inView = false;
    let fonts = false;
    let disposed = false;
    const sync = () => {
      if (inView && fonts && document.visibilityState === "visible") {
        clock.start();
      } else {
        clock.stop();
      }
    };
    const observer = new IntersectionObserver(
      (entries) => {
        inView = entries.some((entry) => entry.isIntersecting);
        host.toggleAttribute("data-offscreen", !inView);
        sync();
      },
      { threshold: 0.2 },
    );
    observer.observe(host);
    document.addEventListener("visibilitychange", sync);
    document.fonts.ready.then(() => {
      if (disposed) return;
      fonts = true;
      sync();
    });
    return () => {
      disposed = true;
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      clock.stop();
    };
  }, [clock]);

  // One run per layout: a layout change stops the loop, snaps back to the
  // start and begins again in the new design
  // initial, rest and script are module constants for every scene
  useEffect(() => {
    if (!layout) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const controller = new AbortController();
    const { signal } = controller;
    cursorAt.current = rest[layout];
    placeCursor(cursorRef.current, rest[layout]);
    canvas.setAttribute("data-instant", "");
    setState(initial);

    const run = async () => {
      await clock.frame(signal);
      await clock.frame(signal);
      canvas.removeAttribute("data-instant");
      gate.ready();
      for (;;) {
        const act = createAct<S>({
          clock,
          signal,
          layout,
          root: canvas,
          cursor: cursorRef.current,
          cursorAt,
          runStart: clock.time,
          setState,
        });
        await script(act);
      }
    };
    run().catch((error) => {
      if (!(error instanceof Stopped)) {
        console.error("[stageshow] script error", error);
      }
    });
    return () => controller.abort();
  }, [layout, clock, gate]);

  return (
    <div ref={hostRef} className={styles.layer}>
      {layout ? (
        <StageBox layout={layout} size={sizes[layout]} live>
          <StageCanvas ref={canvasRef} size={sizes[layout]}>
            {children(state, layout)}
            <div ref={cursorRef} className={styles.cursor}>
              <CursorGlyph />
            </div>
          </StageCanvas>
        </StageBox>
      ) : null}
    </div>
  );
}
