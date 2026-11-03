"use client";

// Ported from the Stageshow kit (MIT, see LICENSE in this folder).

import { createContext, useEffect, useMemo, useRef, useState } from "react";

import styles from "./stageshow.module.css";

export const StageGateContext = createContext<{ ready: () => void }>({
  ready: () => undefined,
});

const prefersStatic = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
  document.documentElement.dataset.static !== undefined;

/**
 * The stage's outer element. It holds the static frames (children) and
 * mounts the live scene only when motion is allowed and the stage first comes
 * into view, so the live scene's chunk loads lazily. The live scene calls
 * `ready` from `StageGateContext` once it has painted its first frame, and the
 * start frame fades out under it.
 */
export function StageGate({
  label,
  live,
  children,
}: {
  /** Tells the whole story; every part inside the stage is aria-hidden. */
  label: string;
  live: React.ReactNode;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      const allowed = !prefersStatic();
      setAnimate(allowed);
      if (!allowed) setReady(false);
    };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!animate || load) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setLoad(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [animate, load]);

  const gate = useMemo(() => ({ ready: () => setReady(true) }), []);

  return (
    <div
      ref={ref}
      role="img"
      aria-label={label}
      className={styles.shell}
      data-ready={ready || undefined}
    >
      {children}
      {animate && load ? (
        <div aria-hidden="true" className={styles.live}>
          <StageGateContext value={gate}>{live}</StageGateContext>
        </div>
      ) : null}
    </div>
  );
}
