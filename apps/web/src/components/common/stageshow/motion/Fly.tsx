import { type ReactNode, useEffect, useRef } from "react";
import type { Rect } from "../measure";
import { useReducedMotion } from "../reduced-motion";
import { warn } from "../util";

export interface FlyProps {
  /** Where it starts and where it lands, in stage pixels (from `rect()`). */
  from: Rect;
  to: Rect;
  /** False waits at `from`, hidden; true shows it there and flies to `to`. */
  go: boolean;
  /** Shown while it waits at `from`. */
  held?: boolean;
  /** ms for the flight. Default 750. */
  duration?: number;
  children: ReactNode;
  className?: string;
}

/**
 * Carries one element from one place to another along a soft arc. It lifts a
 * little on the way and is back to its final size before it lands. Hide the
 * source in the set that turns `go` on, and render the real element at `to`
 * only once it has landed.
 */
export function Fly({
  from: liveFrom,
  to: liveTo,
  go,
  held: shownAtRest = false,
  duration = 750,
  children,
  className,
}: FlyProps) {
  const reduced = useReducedMotion();
  // Both ends are fixed at take-off. Measured live, they move under the flight
  // and every change restarts the transition.
  const held = useRef<{ from: Rect; to: Rect } | null>(null);
  if (!go) held.current = null;
  else if (!held.current) held.current = { from: liveFrom, to: liveTo };
  const { from: start, to } = held.current ?? { from: liveFrom, to: liveTo };
  // An empty start (nothing measured yet) takes the landing size, so the flyer
  // never grows from a point.
  const from = start.width
    ? start
    : { ...start, width: to.width || 1, height: to.height || 1 };
  const at = go ? to : from;
  const ms = reduced ? 0 : duration;
  const sx = at.width / (from.width || 1);
  // A child that doesn't fill the start box takes off or lands at the wrong size.
  const body = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = body.current?.firstElementChild as HTMLElement | null;
    if (!el || !start.width) return;
    if (
      Math.abs(el.offsetWidth - from.width) > 1 ||
      Math.abs(el.offsetHeight - from.height) > 1
    )
      warn(
        `Fly: the child is ${el.offsetWidth}×${el.offsetHeight} but takes off from ${Math.round(from.width)}×${Math.round(from.height)}. Draw it at the start size, and pass the landing element's own rect as \`to\`.`,
      );
  }, [from.width, from.height, start.width]);
  return (
    <div
      className={`ss-fly${className ? ` ${className}` : ""}`}
      data-go={go || undefined}
      data-held={shownAtRest || undefined}
      style={{
        visibility: go || shownAtRest ? undefined : "hidden",
        left: from.x,
        top: from.y,
        width: from.width,
        height: from.height,
        transform: `translateX(${at.x - from.x}px)`,
        // Two tracks make the arc: x on a plain ease, y and scale on a softer
        // start and a long settle.
        transition: `transform ${ms}ms cubic-bezier(0.35, 0, 0.2, 1)`,
      }}
    >
      <div
        style={{
          transform: `translateY(${at.y - from.y}px) scale(${sx})`,
          transformOrigin: "0 0",
          transition: `transform ${ms}ms cubic-bezier(0.3, 0.6, 0.15, 1)`,
        }}
      >
        <div
          ref={body}
          className="ss-fly__lift"
          style={go ? { animationDuration: `${ms}ms` } : undefined}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
