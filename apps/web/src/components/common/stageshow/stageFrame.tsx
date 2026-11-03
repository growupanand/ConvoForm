// Ported from the Stageshow kit (MIT, see LICENSE in this folder).
// The frame every stage is drawn in. Pure markup, so the static frames render
// on the server and match the live stage pixel for pixel.

import type { CSSProperties, ReactNode } from "react";

import type { Layout } from "./act";
import styles from "./stageshow.module.css";

/** Below this stage width the compact design shows (see `.box` in the CSS). */
export const COMPACT_BELOW = 700;

export type StageSize = { width: number; height: number };
export type StageSizes = Record<Layout, StageSize>;

export const layoutFor = (width: number): Layout =>
  width < COMPACT_BELOW ? "compact" : "wide";

/**
 * Reserves one layout's height (its aspect ratio at the stage's width) and
 * scales the scene drawn inside it. Static boxes show only for their layout;
 * the live stage renders one box for the layout it measured.
 */
export function StageBox({
  layout,
  size,
  live,
  children,
}: {
  layout: Layout;
  size: StageSize;
  live?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      aria-hidden="true"
      className={styles.box}
      data-layout={live ? undefined : layout}
      style={{
        maxWidth: size.width,
        aspectRatio: `${size.width} / ${size.height}`,
      }}
    >
      {live ? null : <div className={styles.grid} />}
      {children}
    </div>
  );
}

export function StageCanvas({
  size,
  children,
  ref,
  ...data
}: {
  size: StageSize;
  children: ReactNode;
  ref?: React.Ref<HTMLDivElement>;
} & Record<`data-${string}`, string | undefined>) {
  return (
    <div
      {...data}
      ref={ref}
      data-stage=""
      className={styles.canvas}
      style={
        {
          width: size.width,
          height: size.height,
          "--ss-w": `${size.width}px`,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}

/** The final, fully informative frame: no JS, reduced motion and ?static=1. */
export function StagePoster({ children }: { children: ReactNode }) {
  return (
    <div className={`${styles.layer} ${styles.poster}`} data-still="">
      {children}
    </div>
  );
}

/** The live scene's first frame, shown until the live scene has painted. */
export function StageStart({ children }: { children: ReactNode }) {
  return (
    <div className={`${styles.layer} ${styles.start}`} data-still="">
      {children}
    </div>
  );
}
