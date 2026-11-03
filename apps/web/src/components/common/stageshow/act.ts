// Ported from the Stageshow kit (MIT, see LICENSE in this folder).

import type { Dispatch, SetStateAction } from "react";

import { type SceneClock, Stopped } from "./clock";

export type Layout = "wide" | "compact";
export type Point = { x: number; y: number };
export type Rect = { x: number; y: number; width: number; height: number };
/**
 * A point in stage pixels, the name in an element's `data-target` (its
 * centre), or a named element with `x`/`y` as fractions of its box.
 */
export type Target = Point | string | { at: string; x?: number; y?: number };

type Patch<S> = Partial<S> | ((s: S) => Partial<S>);

/** The script API a scene's script is handed on every run. */
export interface Act<S> {
  readonly layout: Layout;
  readonly signal: AbortSignal;
  /** Merge a patch into scene state without waiting. */
  put(patch: Patch<S>): void;
  /** Merge a patch and resolve once it has painted, so rects are fresh. */
  set(patch: Patch<S>): Promise<void>;
  /** Apply a patch with transitions off, for resets nothing on screen explains. */
  snap(patch: Patch<S>): Promise<void>;
  wait(ms: number): Promise<void>;
  /** Type text into a string key of state, `interval` ms apart on average. */
  type(key: keyof S, text: string, opts?: { interval?: number }): Promise<void>;
  /** Move the cursor in a shallow, hand-like arc. */
  move(to: Target, opts?: { duration?: number }): Promise<void>;
  /** Move to a target (if given) and press it. */
  click(to?: Target): Promise<void>;
  /** Where a `data-target` element is now, in stage pixels. */
  rect(name: string): Rect;
  /** Name the current beat: sets `data-mark` and `data-mark-at` (ms into the loop). */
  mark(name: string): void;
}

export interface ActEnv<S> {
  clock: SceneClock;
  signal: AbortSignal;
  layout: Layout;
  /** The scene canvas: stage pixels are measured from its top left. */
  root: HTMLElement;
  cursor: HTMLElement | null;
  cursorAt: { current: Point };
  runStart: number;
  setState: Dispatch<SetStateAction<S>>;
}

const EMPTY: Rect = { x: 0, y: 0, width: 0, height: 0 };

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
/** Uneven but repeatable rhythm, so every loop types the same way. */
const hash = (i: number) => {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

export function placeCursor(cursor: HTMLElement | null, p: Point) {
  if (cursor) cursor.style.transform = `translate(${p.x}px, ${p.y}px)`;
}

export function createAct<S>(env: ActEnv<S>): Act<S> {
  const { clock, signal, layout, root, cursor, cursorAt, setState } = env;

  const check = () => {
    if (signal.aborted) throw new Stopped();
  };
  const frame = () => clock.frame(signal);
  const targetEl = (name: string) =>
    root.querySelector<HTMLElement>(`[data-target="${name}"]`);

  const rect = (name: string): Rect => {
    const el = targetEl(name);
    if (!el) return EMPTY;
    const box = root.getBoundingClientRect();
    const scale = box.width / root.offsetWidth || 1;
    const b = el.getBoundingClientRect();
    return {
      x: (b.left - box.left) / scale,
      y: (b.top - box.top) / scale,
      width: b.width / scale,
      height: b.height / scale,
    };
  };

  const resolve = (t: Target): Point => {
    if (typeof t !== "string" && "x" in t && !("at" in t)) return t;
    const name = typeof t === "string" ? t : t.at;
    const fx = typeof t === "string" ? 0.5 : t.x ?? 0.5;
    const fy = typeof t === "string" ? 0.5 : t.y ?? 0.5;
    const r = rect(name);
    return { x: r.x + r.width * fx, y: r.y + r.height * fy };
  };

  const place = (p: Point) => {
    cursorAt.current = p;
    placeCursor(cursor, p);
  };

  const tween = async (ms: number, step: (t: number) => void) => {
    const start = clock.time;
    for (;;) {
      check();
      const t = Math.min(1, (clock.time - start) / ms);
      step(t);
      if (t === 1) return;
      await frame();
    }
  };

  const act: Act<S> = {
    layout,
    signal,
    put(patch) {
      if (signal.aborted) return;
      setState((s) => ({
        ...s,
        ...(typeof patch === "function" ? patch(s) : patch),
      }));
    },
    async set(patch) {
      check();
      act.put(patch);
      await frame();
      await frame();
    },
    async snap(patch) {
      check();
      root.setAttribute("data-instant", "");
      try {
        act.put(patch);
        await frame();
        await frame();
      } finally {
        root.removeAttribute("data-instant");
      }
    },
    async wait(ms) {
      check();
      await clock.wait(ms, signal);
    },
    async type(key, text, opts) {
      const interval = opts?.interval ?? 35;
      for (let i = 0; i <= text.length; i++) {
        check();
        setState((s) => ({ ...s, [key]: text.slice(0, i) }));
        await clock.wait(interval * (0.7 + 0.6 * hash(i)), signal);
      }
    },
    async move(to, opts) {
      check();
      const from = { ...cursorAt.current };
      const end = resolve(to);
      const dist = Math.hypot(end.x - from.x, end.y - from.y);
      if (dist < 0.5) return;
      const ms = opts?.duration ?? clamp(260 + dist * 0.9, 300, 650);
      const bow = Math.min(dist * 0.08, 24);
      const nx = -(end.y - from.y) / dist;
      const ny = (end.x - from.x) / dist;
      await tween(ms, (t) => {
        const e = easeInOutCubic(t);
        const lift = Math.sin(Math.PI * e) * bow;
        place({
          x: from.x + (end.x - from.x) * e + nx * lift,
          y: from.y + (end.y - from.y) * e + ny * lift,
        });
      });
    },
    async click(to) {
      check();
      if (to !== undefined) {
        await act.move(to);
        await act.wait(120);
      }
      const name =
        to === undefined
          ? null
          : typeof to === "string"
            ? to
            : "at" in to
              ? to.at
              : null;
      const el = name ? targetEl(name) : null;
      cursor?.setAttribute("data-pressed", "");
      el?.setAttribute("data-pressed", "");
      try {
        await act.wait(100);
      } finally {
        cursor?.removeAttribute("data-pressed");
        el?.removeAttribute("data-pressed");
      }
    },
    rect,
    mark(name) {
      if (signal.aborted) return;
      root.setAttribute("data-mark", name);
      root.setAttribute(
        "data-mark-at",
        String(Math.round(clock.time - env.runStart)),
      );
    },
  };

  // A beat started without await (a move alongside other beats) rejects with
  // Stopped when the stage stops; that is expected and must not surface as an
  // unhandled rejection. Awaited calls still see the rejection.
  for (const key of Object.keys(act) as (keyof Act<S>)[]) {
    const fn = act[key];
    if (typeof fn !== "function") continue;
    (act as unknown as Record<string, unknown>)[key] = (...args: unknown[]) => {
      const out = (fn as (...x: unknown[]) => unknown).apply(act, args);
      if (out instanceof Promise) {
        out.catch((error) => {
          if (!(error instanceof Stopped)) {
            console.error("[stageshow] script error", error);
          }
        });
      }
      return out;
    };
  }
  return act;
}
