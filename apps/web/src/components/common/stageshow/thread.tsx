"use client";

// Ported from the Stageshow kit (MIT, see LICENSE in this folder): the kit's
// Thread and Bubble without tails, tapbacks, avatars or app looks.

import { createContext, use, useEffect, useLayoutEffect, useRef } from "react";

import {
  type BubbleProps,
  type ThreadParts,
  type ThreadProps,
  TypingDots,
} from "./parts";
import styles from "./stageshow.module.css";

// Whether the thread has finished its first render: bubbles there from the
// start are the opening picture and don't rise in; only arrivals do
const Ready = createContext<{ current: boolean }>({ current: true });

// offsetTop rounds to whole pixels. Keep fractional positions through the
// FLIP, including inside a scaled stage, or a row steps before its glide.
function threadTops(root: HTMLElement) {
  const width = Number.parseFloat(getComputedStyle(root).width);
  const scale = (width && root.getBoundingClientRect().width / width) || 1;
  const top = root.getBoundingClientRect().top;
  return new Map(
    Array.from(root.children, (el) => [
      el,
      (el.getBoundingClientRect().top - top) / scale,
    ]),
  );
}

/**
 * A column of messages pinned to its bottom. Messages already on screen glide
 * up when one arrives instead of jumping; what scrolls off the top is clipped.
 */
function Thread({ className, children }: ThreadProps) {
  const ref = useRef<HTMLDivElement>(null);
  const ready = useRef(false);
  // Where each message is right before this update, read fresh each time:
  // CSS motion in between (a bubble growing) moves messages without a render
  const tops = ref.current
    ? threadTops(ref.current)
    : new Map<Element, number>();
  useEffect(() => {
    ready.current = true;
  }, []);
  // Glide (FLIP): every message that moved starts where it was and eases to
  // where it is, so an arrival pushes the rest up
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    for (const [node, top] of Array.from(threadTops(root))) {
      const el = node as HTMLElement;
      const was = tops.get(el);
      if (was === undefined || Math.abs(was - top) < 0.001) continue;
      const now = Number.parseFloat(getComputedStyle(el).top) || 0;
      el.style.transition = "none";
      el.style.top = `${was + now - top}px`;
      void el.offsetWidth;
      el.style.transition = "";
      el.style.top = "";
    }
  });
  return (
    <Ready value={ready}>
      <div
        ref={ref}
        className={`${styles.thread}${className ? ` ${className}` : ""}`}
      >
        {children}
      </div>
    </Ready>
  );
}

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/**
 * One message. Bubbles in the thread on its first render don't animate; later
 * arrivals rise in, or form out of their `source` composer.
 */
function Bubble({
  from,
  typing = false,
  source,
  className,
  children,
}: BubbleProps) {
  const arrived = useRef(use(Ready).current).current;
  const ref = useRef<HTMLDivElement>(null);
  const size = useRef<{ w: number; h: number } | null>(null);
  const wasTyping = useRef(typing);
  const grew = useRef(false);
  if (wasTyping.current && !typing) grew.current = true;
  wasTyping.current = typing;

  // Morph: measure the box before and after the content changes, then ease
  // from the old size to the new
  // re-measure whenever the content changes
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const was = size.current;
    el.style.width = "";
    el.style.height = "";
    const measured = getComputedStyle(el);
    const now = {
      w: Number.parseFloat(measured.width),
      h: Number.parseFloat(measured.height),
    };
    size.current = now;
    if (!was || (was.w === now.w && was.h === now.h)) return;
    // The words keep their final line breaks while the box grows round them
    const text = el.querySelector<HTMLElement>("[data-bubble-text]");
    if (text) text.style.width = getComputedStyle(text).width;
    el.style.transition = "none";
    el.style.width = `${was.w}px`;
    el.style.height = `${was.h}px`;
    void el.offsetWidth;
    el.style.transition = "";
    el.style.width = `${now.w}px`;
    el.style.height = `${now.h}px`;
    const end = () => {
      el.style.width = "";
      el.style.height = "";
      if (text) text.style.width = "";
    };
    el.addEventListener("transitionend", end, { once: true });
    return () => el.removeEventListener("transitionend", end);
  }, [typing, children]);

  // Form out of the composer: start where its words were, in its colour with
  // no fill, and travel into place as the fill comes in
  // runs once, on arrival
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !arrived || !source) return;
    const stage = el.closest("[data-stage]") ?? document;
    const src = stage.querySelector<HTMLElement>(`[data-target="${source}"]`);
    const text = el.querySelector<HTMLElement>("[data-bubble-text]");
    if (!src || !text) return;
    el.style.transition = "none";
    el.style.left = "0px";
    el.style.top = "0px";
    const k = el.getBoundingClientRect().width / el.offsetWidth || 1;
    const o = src.getBoundingClientRect();
    const t = text.getBoundingClientRect();
    const dx = (o.left - t.left) / k;
    const dy = (o.top + o.height / 2 - (t.top + t.height / 2)) / k;
    el.style.left = `${dx}px`;
    el.style.top = `${dy}px`;
    el.setAttribute("data-flying", "");
    el.style.color = getComputedStyle(src).color;
    void el.offsetWidth;
    el.style.transition = `left 0.5s ${EASE}, top 0.5s ${EASE}, color 0.3s ease 0.06s`;
    el.style.left = "";
    el.style.top = "";
    el.removeAttribute("data-flying");
    el.style.color = "";
    const end = (e: TransitionEvent) => {
      if (e.target !== el || e.propertyName !== "top") return;
      el.style.transition = "";
      el.removeEventListener("transitionend", end);
    };
    el.addEventListener("transitionend", end);
    return () => el.removeEventListener("transitionend", end);
  }, []);

  return (
    <div
      className={`${styles.row}${className ? ` ${className}` : ""}`}
      data-from={from}
    >
      <div
        ref={ref}
        className={styles.bubble}
        data-arrived={arrived || undefined}
        data-source={source ? "" : undefined}
        data-typing={typing || undefined}
        data-grew={grew.current || undefined}
      >
        {typing ? (
          <TypingDots />
        ) : (
          <span className={styles.text} data-bubble-text="">
            {children}
          </span>
        )}
      </div>
    </div>
  );
}

export const liveThreadParts: ThreadParts = { Thread, Bubble };
