import {
  type CSSProperties,
  Children,
  type ReactElement,
  type ReactNode,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";

// Message threads the way messaging apps draw them: runs of bubbles that glide
// up as new ones arrive, and a typing indicator that grows into the reply. This
// is a trimmed copy of the Stageshow kit's Thread and Bubble (see LICENSE).

// Whether the thread has finished its first render: bubbles there from the
// start are the opening picture and don't rise in; only arrivals do.
const Ready = createContext<{ current: boolean }>({ current: true });

// offsetTop rounds to whole pixels. Keep fractional positions through the FLIP,
// including inside a scaled phone, or a row steps before its glide starts.
function threadTops(root: HTMLElement) {
  const style = getComputedStyle(root);
  const extra =
    style.boxSizing === "border-box"
      ? 0
      : [
          style.paddingLeft,
          style.paddingRight,
          style.borderLeftWidth,
          style.borderRightWidth,
        ].reduce((sum, value) => sum + (Number.parseFloat(value) || 0), 0);
  const width = Number.parseFloat(style.width) + extra;
  const scale = (width && root.getBoundingClientRect().width / width) || 1;
  const parents = new Map<Element, number>();
  return new Map(
    Array.from(root.children, (el) => {
      const parent = (el as HTMLElement).offsetParent;
      if (parent && !parents.has(parent))
        parents.set(parent, parent.getBoundingClientRect().top);
      return [
        el,
        (el.getBoundingClientRect().top -
          (parent ? parents.get(parent) ?? 0 : 0)) /
          scale,
      ];
    }),
  );
}

export interface ThreadProps {
  /** imessage: blue and gray bubbles. sms: green and gray, for a phone's messages app. chat: quiet gray for the person, plain text for the reply. */
  app?: "imessage" | "sms" | "chat";
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * A column of messages pinned to its bottom, as a conversation is. Messages
 * already on screen glide up when one arrives instead of jumping; the thread
 * clips what scrolls off its top.
 */
export function Thread({
  app = "imessage",
  className,
  style,
  children,
}: ThreadProps) {
  const ref = useRef<HTMLDivElement>(null);
  const ready = useRef(false);
  // Where each message is right before this update. Read fresh every time, not
  // remembered from the last update: CSS motion in between moves messages
  // without a render, and a stale position would glide them from somewhere
  // they no longer are.
  const tops = ref.current
    ? threadTops(ref.current)
    : new Map<Element, number>();
  useEffect(() => {
    ready.current = true;
  }, []);
  // Glide: every message that moved since the last render starts where it was
  // and eases to where it is (FLIP), so an arrival pushes the rest up.
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const next = threadTops(root);
    for (const [node, top] of Array.from(next)) {
      const el = node as HTMLElement;
      const was = tops.get(el);
      if (was === undefined || Math.abs(was - top) < 0.001) continue;
      // Start from where it is on screen: a glide still under way continues
      // from its current offset instead of jumping back.
      const now = Number.parseFloat(getComputedStyle(el).top) || 0;
      el.style.transition = "none";
      el.style.top = `${was + now - top}px`;
      void el.offsetWidth;
      el.style.transition = "";
      el.style.top = "";
    }
  });
  const list = Children.toArray(children).filter(
    isValidElement,
  ) as ReactElement<BubbleProps>[];
  return (
    <Ready.Provider value={ready}>
      <div
        ref={ref}
        className={`ss-thread${className ? ` ${className}` : ""}`}
        data-app={app}
        style={style}
      >
        {list}
      </div>
    </Ready.Provider>
  );
}

export interface BubbleProps {
  /** me sits on the right in the accent bubble; them on the left. */
  from: "me" | "them";
  /** Three bouncing dots in place of the text. Turning it off grows the bubble into the message. */
  typing?: boolean;
  /**
   * Where the message comes from, as iMessage sends: a target name for the
   * composer's text. The bubble forms out of it, the words lifting from the
   * field into place while the bubble fills in around them. Clear the field in
   * the same update that adds the bubble.
   */
  source?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  /** data-target and other data attributes land on the bubble itself. */
  [data: `data-${string}`]: unknown;
}

/**
 * One message. Bubbles in the thread on its first render are the opening
 * picture and don't animate; only later arrivals rise in.
 */
export function Bubble({
  from,
  typing = false,
  source,
  className,
  style,
  children,
  ...data
}: BubbleProps) {
  const arrived = useRef(useContext(Ready).current).current;
  const ref = useRef<HTMLDivElement>(null);
  const size = useRef<{ w: number; h: number } | null>(null);
  // Whether this bubble grew out of the typing dots (its words fade in as it grows).
  const wasTyping = useRef(typing);
  const grew = useRef(false);
  if (wasTyping.current && !typing) grew.current = true;
  wasTyping.current = typing;
  // Morph: measure the bubble before and after the content changes, then ease
  // its box from the old size to the new.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const was = size.current;
    el.style.width = "";
    el.style.height = "";
    // Resolved CSS dimensions retain the fractions offsetWidth/Height round
    // away, so releasing the measured box doesn't resize it at the endpoint.
    const measured = getComputedStyle(el);
    const now = {
      w: Number.parseFloat(measured.width),
      h: Number.parseFloat(measured.height),
    };
    size.current = now;
    if (!was || (was.w === now.w && was.h === now.h)) return;
    // The words keep their final line breaks while the box grows around them.
    const text = el.querySelector<HTMLElement>(".ss-bubble__text");
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
  // Form out of the composer: start where the field's words were, in the
  // field's color with no fill, and travel into place as the fill comes in.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !arrived || !source) return;
    const stage = el.closest(".ss-stage") ?? document;
    const src =
      stage.querySelector<HTMLElement>(`[data-target="${source}"]`) ??
      stage.querySelector<HTMLElement>(source);
    const text = el.querySelector<HTMLElement>(".ss-bubble__text");
    if (!src || !text) return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      el.closest("[data-still]")
    )
      return;
    // Measure where it rests, not where an earlier run already moved it.
    el.style.transition = "none";
    el.style.left = el.style.top = "0px";
    const k = el.getBoundingClientRect().width / el.offsetWidth || 1;
    const o = src.getBoundingClientRect();
    const t = text.getBoundingClientRect();
    const dx = (o.left - t.left) / k;
    const dy = (o.top + o.height / 2 - (t.top + t.height / 2)) / k;
    const ease = "cubic-bezier(0.22, 1, 0.36, 1)";
    // Travels by left and top, so the words land without a sub-pixel hop.
    el.style.transition = "none";
    el.style.left = `${dx}px`;
    el.style.top = `${dy}px`;
    el.setAttribute("data-flying", "");
    el.style.color = getComputedStyle(src).color;
    void el.offsetWidth;
    el.style.transition = `left 0.5s ${ease}, top 0.5s ${ease}, color 0.3s ease 0.06s`;
    el.style.left = el.style.top = "";
    el.removeAttribute("data-flying");
    el.style.color = "";
    const end = (e: TransitionEvent) => {
      if (e.target !== el || e.propertyName !== "top") return;
      el.style.transition = "";
      el.removeEventListener("transitionend", end);
    };
    el.addEventListener("transitionend", end);
    return () => el.removeEventListener("transitionend", end);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div
      className={`ss-bubble-row${className ? ` ${className}` : ""}`}
      data-from={from}
      style={style}
    >
      <div
        {...data}
        ref={ref}
        className="ss-bubble"
        data-arrived={arrived || undefined}
        data-source={source ? "" : undefined}
        data-typing={typing || undefined}
        data-grew={grew.current || undefined}
      >
        {typing ? (
          <span className="ss-bubble__dots" aria-label="typing">
            <i />
            <i />
            <i />
          </span>
        ) : (
          <span className="ss-bubble__text">{children}</span>
        )}
      </div>
    </div>
  );
}
