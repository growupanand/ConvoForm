// Ported from the Stageshow kit (MIT, see LICENSE in this folder). Pure parts:
// no hooks, so they render in the server-drawn static frames as well as in
// the live stage.

import type { CSSProperties, ReactNode } from "react";

import type { Rect } from "./act";
import styles from "./stageshow.module.css";

export interface ThreadProps {
  className?: string;
  children?: ReactNode;
}

export interface BubbleProps {
  /** `me` sits on the right in the sender's colour; `them` on the left. */
  from: "me" | "them";
  /** Typing dots in place of the words; turning it off grows the bubble into the message. */
  typing?: boolean;
  /**
   * The `data-target` of the composer text this message is sent from. The
   * bubble forms out of it instead of rising in. Clear the composer in the
   * same update that adds the bubble.
   */
  source?: string;
  className?: string;
  children?: ReactNode;
}

/** Thread and Bubble come in a live pair (thread.tsx) and this still pair. */
export type ThreadParts = {
  Thread: (props: ThreadProps) => ReactNode;
  Bubble: (props: BubbleProps) => ReactNode;
};

function StillThread({ className, children }: ThreadProps) {
  return (
    <div className={`${styles.thread}${className ? ` ${className}` : ""}`}>
      {children}
    </div>
  );
}

function StillBubble({ from, typing, className, children }: BubbleProps) {
  return (
    <div
      className={`${styles.row}${className ? ` ${className}` : ""}`}
      data-from={from}
    >
      <div className={styles.bubble} data-typing={typing || undefined}>
        {typing ? (
          <TypingDots />
        ) : (
          <span className={styles.text}>{children}</span>
        )}
      </div>
    </div>
  );
}

export const stillThreadParts: ThreadParts = {
  Thread: StillThread,
  Bubble: StillBubble,
};

export function TypingDots() {
  return (
    <span className={styles.dots}>
      <i />
      <i />
      <i />
    </span>
  );
}

/** A pending indicator: a thin arc turning, in the current colour. */
export function Spinner({
  size = 14,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={`${styles.spinner}${className ? ` ${className}` : ""}`}
      viewBox="0 0 16 16"
      width={size}
      height={size}
      aria-hidden="true"
    >
      <circle
        cx="8"
        cy="8"
        r="6.25"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="1.5"
      />
      <path
        d="M8 1.75a6.25 6.25 0 0 1 6.25 6.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** A small count whose new figure rises into place. */
export function Count({ value }: { value: number }) {
  return (
    <span className={styles.count}>
      <span key={value} className={styles.countDigit}>
        {value}
      </span>
    </span>
  );
}

export type FlyPhase = "off" | "held" | "go";

/**
 * Carries one element from `from` to `to` (stage-pixel rects measured with
 * `act.rect`). `held` shows it at `from` with no transition; `go` flies it,
 * scaling from the start box to the landing box; `off` hides it. Draw the
 * child at the start size.
 */
export function Fly({
  from,
  to,
  phase,
  duration = 700,
  className,
  children,
}: {
  from: Rect;
  to: Rect;
  phase: FlyPhase;
  duration?: number;
  className?: string;
  children: ReactNode;
}) {
  const at = phase === "go" ? to : from;
  const ms = phase === "go" ? duration : 0;
  const sx = at.width / (from.width || 1);
  return (
    <div
      className={`${styles.fly}${className ? ` ${className}` : ""}`}
      data-phase={phase}
      style={
        {
          visibility: phase === "off" ? "hidden" : undefined,
          left: from.x,
          top: from.y,
          width: from.width,
          height: from.height,
          transform: `translateX(${at.x - from.x}px)`,
          transition: `transform ${ms}ms cubic-bezier(0.35, 0, 0.2, 1)`,
          "--ss-fly-ms": `${duration}ms`,
        } as CSSProperties
      }
    >
      <div
        style={{
          transform: `translateY(${at.y - from.y}px) scale(${sx})`,
          transformOrigin: "0 0",
          transition: `transform ${ms}ms cubic-bezier(0.3, 0.6, 0.15, 1)`,
        }}
      >
        <div className={styles.flyBody}>{children}</div>
      </div>
    </div>
  );
}

/**
 * A line-drawn phone at true size, so the text inside it is real px. `height`
 * may run past the stage's bottom edge; the stage crops it.
 */
export function Phone({
  width,
  height,
  time = "9:41",
  className,
  children,
}: {
  width: number;
  height: number;
  time?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`${styles.phone}${className ? ` ${className}` : ""}`}
      style={{ width, height }}
    >
      <div className={styles.phoneScreen}>
        <div className={styles.phoneContent}>{children}</div>
        <div className={styles.phoneStatus}>
          <span>{time}</span>
          <span className={styles.phoneIsland} />
          <span className={styles.phoneGlyphs}>
            <svg width="17" height="11" viewBox="0 0 17 11" aria-hidden="true">
              <rect
                x="0"
                y="7"
                width="3"
                height="4"
                rx="1"
                fill="currentColor"
              />
              <rect
                x="4.6"
                y="5"
                width="3"
                height="6"
                rx="1"
                fill="currentColor"
              />
              <rect
                x="9.2"
                y="2.6"
                width="3"
                height="8.4"
                rx="1"
                fill="currentColor"
              />
              <rect
                x="13.8"
                y="0"
                width="3"
                height="11"
                rx="1"
                fill="currentColor"
              />
            </svg>
            <svg width="25" height="12" viewBox="0 0 25 12" aria-hidden="true">
              <rect
                x="0.6"
                y="0.6"
                width="21"
                height="10.8"
                rx="3.2"
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.4"
                strokeWidth="1.2"
              />
              <rect
                x="2.4"
                y="2.4"
                width="15"
                height="7.2"
                rx="1.8"
                fill="currentColor"
              />
              <path
                d="M23.2 4.2v3.6c.8-.3 1.3-1 1.3-1.8s-.5-1.5-1.3-1.8Z"
                fill="currentColor"
                fillOpacity="0.4"
              />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}
