import type { Dispatch, SetStateAction } from "react";
import type { Layout } from "./looks";
import {
  EMPTY,
  type Point,
  type Rect,
  type Target,
  nameOf,
  targetRectOf,
} from "./measure";
import { clamp, easeInOutCubic, hash, warn } from "./util";

// The script API: the act a demo's script is handed each run. It drives the
// scene state and the cursor, measures targets, and stops the moment its
// signal aborts (the stage left the screen, or the layout changed).

export interface Act<S> {
  /** Merge a patch into scene state. Resolves once it has painted, so rects are fresh. */
  set(patch: Partial<S> | ((s: S) => Partial<S>)): Promise<void>;
  /** Like set, without waiting. For per-frame updates. */
  put(patch: Partial<S> | ((s: S) => Partial<S>)): void;
  wait(ms: number): Promise<void>;
  /** Where a target is now, in stage pixels. */
  rect(name: string): Rect;
  /** Move the cursor in a hand-like arc. */
  move(to: Target, opts?: { duration?: number }): Promise<void>;
  /** Move (if given a target) and press. */
  click(to?: Target): Promise<void>;
  /** Apply a patch with transitions off. */
  snap(
    patch: Partial<S> | ((s: S) => Partial<S>),
    scope?: string,
  ): Promise<void>;
  /** Name the current beat. */
  mark(name: string): void;
  /** Type text into a string key of state, one character at a time. */
  type(key: keyof S, text: string, opts?: { interval?: number }): Promise<void>;
  readonly signal: AbortSignal;
  /** 'wide' or 'compact': which design is showing. */
  readonly layout: Layout;
}

export type Script<S> = (act: Act<S>) => Promise<void>;

export class Stopped extends Error {}

type Ref<T> = { current: T };

export interface ActEnv<S> {
  rootRef: { readonly current: HTMLDivElement | null };
  cursorRef: { readonly current: HTMLDivElement | null };
  pos: Ref<Point>;
  scaleRef: Ref<number>;
  layout: Layout;
  resolve: (t: Target) => Point;
  place: (p: Point) => void;
  remeasure: () => void;
  setState: Dispatch<SetStateAction<S>>;
}

export function createAct<S>(signal: AbortSignal, env: ActEnv<S>): Act<S> {
  const {
    rootRef,
    cursorRef,
    pos,
    scaleRef,
    layout,
    resolve,
    place,
    setState,
  } = env;

  const check = () => {
    if (signal.aborted) throw new Stopped();
  };

  const pause = <T>(
    schedule: (done: () => void) => T,
    cancel: (id: T) => void,
  ) =>
    new Promise<void>((res, rej) => {
      check();
      const abort = () => {
        cancel(id);
        signal.removeEventListener("abort", abort);
        rej(new Stopped());
      };
      const id = schedule(() => {
        signal.removeEventListener("abort", abort);
        if (signal.aborted) rej(new Stopped());
        else res();
      });
      signal.addEventListener("abort", abort, { once: true });
    });

  const frame = () =>
    pause((done) => requestAnimationFrame(done), cancelAnimationFrame);
  const wait = (ms: number) =>
    pause((done) => setTimeout(done, ms), clearTimeout);

  const own = (release: () => void) => {
    let live = true;
    const done = () => {
      if (!live) return;
      live = false;
      signal.removeEventListener("abort", done);
      release();
    };
    signal.addEventListener("abort", done, { once: true });
    return done;
  };

  const tween = async (ms: number, step: (t: number) => void) => {
    const start = performance.now();
    const dur = Math.max(1, ms);
    for (;;) {
      check();
      const t = Math.min(1, (performance.now() - start) / dur);
      step(t);
      if (t === 1) return;
      await frame();
    }
  };

  const targetEl = (t: Target) => {
    const name = nameOf(t);
    return name === null
      ? null
      : rootRef.current?.querySelector(`[data-target="${name}"]`) ?? null;
  };

  const a: Act<S> = {
    get signal() {
      return signal;
    },
    put(patch) {
      if (!signal.aborted)
        setState((s) => ({
          ...s,
          ...(typeof patch === "function" ? patch(s) : patch),
        }));
    },
    async set(patch) {
      check();
      a.put(patch);
      await frame();
      await frame();
      check();
    },
    async wait(ms) {
      check();
      await wait(ms);
    },
    rect(name) {
      const root = rootRef.current;
      const el = root?.querySelector<HTMLElement>(`[data-target="${name}"]`);
      if (!root || !el) {
        warn(`no element with data-target="${name}"`);
        return EMPTY;
      }
      return targetRectOf(root, el, scaleRef.current);
    },
    async move(to, opts) {
      check();
      const from = { ...pos.current };
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
      check();
    },
    async click(to) {
      check();
      if (to !== undefined) {
        await a.move(to);
        await wait(120);
      }
      check();
      const el = to !== undefined ? targetEl(to) : null;
      const cursorEl = cursorRef.current;
      const release = own(() => {
        cursorEl?.removeAttribute("data-pressed");
        el?.removeAttribute("data-pressed");
      });
      try {
        cursorEl?.setAttribute("data-pressed", "true");
        el?.setAttribute("data-pressed", "");
        await wait(100);
        check();
        cursorEl?.removeAttribute("data-pressed");
        el?.removeAttribute("data-pressed");
      } finally {
        release();
      }
    },
    async snap(patch, scope) {
      check();
      const el = scope
        ? rootRef.current?.querySelector(`[data-target="${scope}"]`)
        : rootRef.current;
      el?.setAttribute("data-instant", "");
      const release = own(() => el?.removeAttribute("data-instant"));
      try {
        a.put(patch);
        await frame();
        await frame();
        check();
      } finally {
        release();
      }
    },
    mark(name) {
      if (!signal.aborted) rootRef.current?.setAttribute("data-mark", name);
    },
    async type(key, text, opts) {
      const interval = opts?.interval ?? 35;
      for (let i = 0; i <= text.length; i++) {
        check();
        setState((s) => ({ ...s, [key]: text.slice(0, i) }));
        await wait(interval * (0.7 + 0.6 * hash(i)));
      }
    },
    layout,
  };

  // A beat started without await rejects with Stopped when the stage stops;
  // that is expected, so it must not surface as an unhandled rejection.
  for (const k of Object.keys(a) as (keyof Act<S>)[]) {
    const fn = a[k];
    if (typeof fn !== "function") continue;
    (a as unknown as Record<string, unknown>)[k] = (...args: unknown[]) => {
      const out = (fn as (...x: unknown[]) => unknown).apply(a, args);
      if (out instanceof Promise)
        out.catch((e) => {
          if (!(e instanceof Stopped))
            console.error("[stageshow] script error", e);
        });
      return out;
    };
  }

  return a;
}

// A loop that doesn't end where it began jumps on every repeat.
export function checkSeam(
  end: object,
  initial: object,
  at: Point,
  rest: Point | null,
) {
  const changed = Object.keys(initial).filter(
    (k) =>
      JSON.stringify((end as Record<string, unknown>)[k]) !==
      JSON.stringify((initial as Record<string, unknown>)[k]),
  );
  if (changed.length)
    warn(
      `loop seam: state still differs from initial at the end of the script (${changed.join(", ")})`,
    );
  if (rest && Math.hypot(at.x - rest.x, at.y - rest.y) > 1)
    warn("loop seam: cursor does not end where it starts");
}
