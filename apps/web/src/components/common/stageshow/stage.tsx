import {
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./stageshow.css";
import { type Script, Stopped, checkSeam, createAct } from "./act";
import { Cursor } from "./cursor";
import { type Layout, LookContext } from "./looks";
import {
  type Point,
  type Rect,
  type Target,
  sameRects,
  stageSpace,
  targetRectOf,
} from "./measure";
import { StillContext, useReducedMotion } from "./reduced-motion";
import { warn } from "./util";

// A trimmed Stage from the Stageshow kit (see LICENSE). It fits a design-size
// scene into its container, runs the script while it is on screen, and draws
// the cursor over the scene.

export type Play = "loop" | "once";

export interface StageProps<S> {
  /** Design size. The stage scales down to fit its container. */
  width: number;
  height: number;
  /** Scene state at the start of each loop. */
  initial?: S;
  /** Loops while on screen. Leave out for a static illustration. */
  script?: Script<S>;
  /** The still frame shown under reduced motion or with no script. */
  poster?: S;
  /** Where the cursor rests at the start of each loop. */
  cursor?: {
    at: Target | { wide: Target; compact: Target };
    idle?: number | false;
  };
  play?: Play;
  /** A second, smaller design for narrow containers. */
  compact?: { below: number; width: number; height: number };
  className?: string;
  /** Called once the first measured frame is settled. */
  onReady?: () => void;
  /** `layout` is 'wide' or 'compact'. */
  children: (s: S, rect: (name: string) => Rect, layout: Layout) => ReactNode;
}

const NONE = {};

export function Stage<S extends object>({
  width,
  height,
  initial = NONE as S,
  script,
  poster,
  cursor,
  play = "loop",
  compact,
  className,
  onReady,
  children,
}: StageProps<S>) {
  const [layout, setLayout] = useState<Layout>("wide");
  const layoutRef = useRef(layout);
  layoutRef.current = layout;

  const designW = layout === "compact" && compact ? compact.width : width;
  const designH = layout === "compact" && compact ? compact.height : height;

  const fitRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const still = !script || reduced;

  const [state, setState] = useState<S>(() =>
    still && poster ? poster : initial,
  );
  const stateRef = useRef(state);
  stateRef.current = state;

  const [scale, setScale] = useState(1);
  const scaleRef = useRef(1);
  scaleRef.current = scale;
  const [inset, setInset] = useState(0);
  const pos = useRef<Point>({ x: 0, y: 0 });
  const active = useRef(0);
  const moved = useRef(false);
  const loopAt = useRef(0);
  const firstMove = useRef<number | null>(null);

  const restAt = useCallback((): Target => {
    if (!cursor) return { x: 0, y: 0 };
    const at = cursor.at;
    return typeof at === "object" && "wide" in at ? at[layoutRef.current] : at;
  }, [cursor]);

  // Fit: pick the layout from the container width, then scale its design size
  // into it.
  useLayoutEffect(() => {
    const fit = fitRef.current;
    if (!fit) return;
    const measure = () => {
      const w = fit.clientWidth;
      const next: Layout = compact && w < compact.below ? "compact" : "wide";
      setLayout(next);
      const dw = next === "compact" && compact ? compact.width : width;
      const s = Math.min(1, w / dw);
      setScale(s);
      setInset(Math.max(0, (w - dw * s) / 2));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(fit);
    return () => ro.disconnect();
  }, [width, compact?.below, compact?.width]);

  // Rects of every data-target, in stage pixels, refreshed after each commit.
  const [rects, setRects] = useState<Record<string, Rect>>({});
  const measureAll = useCallback(() => {
    const root = rootRef.current;
    if (!root) return {};
    const out: Record<string, Rect> = {};
    const targets = root.querySelectorAll<HTMLElement>("[data-target]");
    if (!targets.length) return out;
    const space = stageSpace(root, scaleRef.current);
    targets.forEach((el) => {
      const name = el.dataset.target;
      if (!name) return;
      out[name] = targetRectOf(root, el, scaleRef.current, space);
    });
    return out;
  }, []);
  const remeasure = useCallback(() => {
    const next = measureAll();
    setRects((prev) => (sameRects(prev, next) ? prev : next));
  }, [measureAll]);
  useLayoutEffect(() => {
    remeasure();
  });
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.addEventListener("transitionend", remeasure);
    root.addEventListener("animationend", remeasure);
    return () => {
      root.removeEventListener("transitionend", remeasure);
      root.removeEventListener("animationend", remeasure);
    };
  }, [remeasure]);
  const rectFor = useCallback(
    (name: string) => rects[name] ?? { x: 0, y: 0, width: 0, height: 0 },
    [rects],
  );

  // Placing: until the first measurements (after fonts load) have painted, and
  // again after a wide/compact switch, nothing transitions.
  const [settling, setSettling] = useState(true);
  useLayoutEffect(() => {
    setSettling(true);
    let live = true;
    let frame = 0;
    const release = () => {
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          if (live) setSettling(false);
        });
      });
    };
    if (!document.fonts || document.fonts.status === "loaded") release();
    else document.fonts.ready.then(() => live && release());
    return () => {
      live = false;
      cancelAnimationFrame(frame);
    };
  }, [layout]);

  const readyCalled = useRef(false);
  useEffect(() => {
    if (settling || readyCalled.current) return;
    readyCalled.current = true;
    onReady?.();
  }, [settling, onReady]);

  const place = useCallback((p: Point) => {
    if (
      loopAt.current &&
      !moved.current &&
      Math.hypot(p.x - pos.current.x, p.y - pos.current.y) > 0.5
    ) {
      moved.current = true;
      firstMove.current ??= performance.now() - loopAt.current;
    }
    pos.current = p;
    active.current = performance.now();
    const el = cursorRef.current;
    if (!el) return;
    el.style.transform = `translate(${p.x}px, ${p.y}px)`;
    el.removeAttribute("data-idle");
  }, []);

  const resolve = useCallback((target: Target): Point => {
    const t =
      typeof target === "object" && target !== null && "wide" in target
        ? layoutRef.current === "compact"
          ? target.compact
          : target.wide
        : target;
    const name = typeof t === "string" ? t : "at" in t ? t.at : null;
    if (name === null) return t as Point;
    const root = rootRef.current;
    const el = root?.querySelector<HTMLElement>(`[data-target="${name}"]`);
    if (!root || !el) {
      warn(`no element with data-target="${name}"`);
      return pos.current;
    }
    const r = targetRectOf(root, el, scaleRef.current);
    const f =
      typeof t === "string"
        ? { x: 0.5, y: 0.5 }
        : (t as { x: number; y: number });
    return { x: r.x + r.width * f.x, y: r.y + r.height * f.y };
  }, []);

  // Rest the cursor at its start point.
  useLayoutEffect(() => {
    if (cursor && !loopAt.current) place(resolve(restAt()));
  }, [scale, layout]); // eslint-disable-line react-hooks/exhaustive-deps

  const reset = useCallback(() => {
    setState(initial);
    moved.current = false;
    loopAt.current = 0;
    rootRef.current?.querySelectorAll("[data-pressed]").forEach((el) => {
      el.removeAttribute("data-pressed");
    });
    rootRef.current?.removeAttribute("data-mark");
    cursorRef.current?.removeAttribute("data-pressed");
    cursorRef.current?.removeAttribute("data-idle");
    if (!cursor) return;
    requestAnimationFrame(() => place(resolve(restAt())));
  }, [initial, cursor, place, resolve, restAt]);

  const makeAct = useMemo(
    () => (signal: AbortSignal) =>
      createAct<S>(signal, {
        rootRef,
        cursorRef,
        pos,
        scaleRef,
        layout,
        resolve,
        place,
        remeasure,
        setState,
      }),
    [layout, place, remeasure, resolve],
  );

  // Run the loop only while the stage is on screen and the tab is visible.
  useEffect(() => {
    const stage = rootRef.current;
    const fit = fitRef.current;
    if (!stage || !fit) return;

    if (still || !script) {
      reset();
      setState(poster ?? initial);
      stage.removeAttribute("data-offscreen");
      return;
    }

    reset();
    let ctrl: AbortController | null = null;
    let onScreen = false;
    let done = false;

    const idle = cursor?.idle ?? 4000;
    const LEAD = 1200;
    let idleTimer = 0;
    let revealTimer = 0;
    const watchIdle = () => {
      window.clearInterval(idleTimer);
      if (!cursor || idle === false) return;
      active.current = performance.now();
      idleTimer = window.setInterval(() => {
        const el = cursorRef.current;
        if (!el) return;
        const now = performance.now();
        if (!moved.current) {
          if (firstMove.current === null && now - active.current > LEAD)
            el.setAttribute("data-idle", "");
          return;
        }
        if (el.hasAttribute("data-pressed")) active.current = now;
        else if (now - active.current > idle) el.setAttribute("data-idle", "");
      }, 150);
    };
    const beginLoop = () => {
      loopAt.current = performance.now();
      moved.current = false;
      window.clearTimeout(revealTimer);
      const el = cursorRef.current;
      const wait = firstMove.current;
      if (idle === false || !el || wait === null || wait <= LEAD) return;
      el.setAttribute("data-idle", "");
      revealTimer = window.setTimeout(
        () => el.removeAttribute("data-idle"),
        wait - 400,
      );
    };
    const unwatchIdle = () => {
      window.clearInterval(idleTimer);
      window.clearTimeout(revealTimer);
      loopAt.current = 0;
      cursorRef.current?.removeAttribute("data-idle");
    };

    const start = () => {
      if (ctrl || done || !onScreen || document.hidden) return;
      if (cursor) place(resolve(restAt()));
      ctrl = new AbortController();
      const signal = ctrl.signal;
      watchIdle();
      const act = makeAct(signal);
      (async () => {
        do {
          beginLoop();
          try {
            await script(act);
          } catch (e) {
            if (e instanceof Stopped) return;
            console.error("[stageshow] script error", e);
            ctrl = null;
            unwatchIdle();
            return;
          }
          if (play === "loop")
            checkSeam(
              stateRef.current,
              initial,
              pos.current,
              cursor ? resolve(restAt()) : null,
            );
        } while (play === "loop" && !signal.aborted);
        if (play === "once" && !signal.aborted) done = true;
      })();
    };
    const stop = () => {
      unwatchIdle();
      if (!ctrl) return;
      ctrl.abort();
      ctrl = null;
      reset();
    };

    const markOffscreen = () => {
      stage.toggleAttribute("data-offscreen", !onScreen || document.hidden);
    };
    markOffscreen();
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        onScreen = entry.isIntersecting;
        markOffscreen();
        if (onScreen) start();
        else stop();
      },
      { threshold: 0.2 },
    );
    io.observe(fit);
    const onVisibility = () => {
      markOffscreen();
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      unwatchIdle();
      ctrl?.abort();
      ctrl = null;
    };
  }, [
    still,
    script,
    makeAct,
    play,
    layout,
    cursor,
    initial,
    poster,
    place,
    resolve,
    restAt,
    reset,
  ]);

  const look = useMemo(() => ({ layout }), [layout]);
  const showCursor = cursor && !still;

  return (
    <div
      ref={fitRef}
      className={`ss-fit${className ? ` ${className}` : ""}`}
      style={{ maxWidth: designW }}
    >
      <div
        ref={rootRef}
        className="ss-stage"
        data-still={still || undefined}
        data-placing={settling || undefined}
        data-layout={layout}
        style={{
          width: designW,
          height: designH,
          marginLeft: inset || undefined,
          transform: `scale(${scale})`,
        }}
      >
        <StillContext.Provider value={still}>
          <LookContext.Provider value={look}>
            {children(state, rectFor, layout)}
          </LookContext.Provider>
        </StillContext.Provider>
        {showCursor && <Cursor cursorRef={cursorRef} />}
      </div>
    </div>
  );
}
