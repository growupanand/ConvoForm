// Small helpers shared by the stage and its script API.

export function isDev() {
  try {
    return process.env.NODE_ENV !== "production";
  } catch {
    return true;
  }
}

export function warn(msg: string) {
  if (isDev()) console.warn(`[stageshow] ${msg}`);
}

export const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

export const hash = (i: number) => {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

/** Structural equality for scene state (plain objects, arrays, primitives). */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (
    typeof a !== "object" ||
    typeof b !== "object" ||
    a === null ||
    b === null ||
    Array.isArray(a) !== Array.isArray(b)
  )
    return false;
  const left = a as Record<string, unknown>;
  const right = b as Record<string, unknown>;
  const keys = Object.keys(left);
  if (keys.length !== Object.keys(right).length) return false;
  return keys.every(
    (key) =>
      Object.prototype.hasOwnProperty.call(right, key) &&
      deepEqual(left[key], right[key]),
  );
}

declare const process: { env: { NODE_ENV?: string } };
