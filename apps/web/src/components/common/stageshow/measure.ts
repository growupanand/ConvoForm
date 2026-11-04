// Measuring: where things are, in stage pixels. A trimmed copy of the
// Stageshow kit's measure helpers (see LICENSE in this folder).

export type Point = { x: number; y: number };
export type Rect = { x: number; y: number; width: number; height: number };
/**
 * A target is the name in an element's data-target (aimed at its center), a
 * named element with x and y as fractions of its box, or a point in stage
 * pixels.
 */
export type Target =
  | string
  | Point
  | { at: string; x: number; y: number }
  | { wide: Target; compact: Target };

export const EMPTY: Rect = { x: 0, y: 0, width: 0, height: 0 };

export const nameOf = (t: Target) =>
  typeof t === "string" ? t : "at" in t ? t.at : null;

export function stageSpace(root: HTMLElement, fallback: number) {
  const bounds = root.getBoundingClientRect();
  return {
    left: bounds.left,
    top: bounds.top,
    scale:
      (root.offsetWidth && bounds.width / root.offsetWidth) || fallback || 1,
    borderX: root.clientLeft,
    borderY: root.clientTop,
  };
}

export function rectOf(
  root: HTMLElement,
  el: HTMLElement,
  fallback: number,
  space = stageSpace(root, fallback),
): Rect {
  const b = el.getBoundingClientRect();
  const { scale } = space;
  return {
    x: (b.left - space.left) / scale - space.borderX,
    y: (b.top - space.top) / scale - space.borderY,
    width: b.width / scale,
    height: b.height / scale,
  };
}

// A target's box without the scale of its own press or hover lift.
export function targetRectOf(
  root: HTMLElement,
  el: HTMLElement,
  fallback: number,
  space = stageSpace(root, fallback),
): Rect {
  const r = rectOf(root, el, fallback, space);
  const style = getComputedStyle(el);
  const t = style.transform;
  const m = t && t !== "none" ? t.match(/^matrix\(([^)]+)\)$/) : null;
  if (!m) return r;
  const [a, b, c, d, e, f] = (m[1] ?? "").split(",").map(Number);
  if (b || c || e || f || !a || !d) return r;
  const w = r.width / a;
  const h = r.height / d;
  const [ox = 0, oy = 0] = style.transformOrigin
    .split(" ")
    .map(Number.parseFloat);
  return {
    x: r.x - ox * (1 - a),
    y: r.y - oy * (1 - d),
    width: w,
    height: h,
  };
}

export function sameRects(a: Record<string, Rect>, b: Record<string, Rect>) {
  const ka = Object.keys(a);
  if (ka.length !== Object.keys(b).length) return false;
  return ka.every((k) => {
    const x = a[k];
    const y = b[k];
    if (!x || !y) return false;
    return (
      Math.abs(x.x - y.x) < 0.5 &&
      Math.abs(x.y - y.y) < 0.5 &&
      Math.abs(x.width - y.width) < 0.5 &&
      Math.abs(x.height - y.height) < 0.5
    );
  });
}
