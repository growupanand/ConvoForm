// The hero scene: one study-abroad enquiry form whose Submit fails on an
// empty Budget, breaks apart and re-forms as a conversation. The sheet
// becomes the chat panel, the title its header, the fields the record the
// counsellor sees and Submit the Send button. Pure, so the server draws the
// static frames with it and the live stage draws every state with it.

import type { CSSProperties } from "react";

import type { Layout, Point } from "@/components/common/stageshow/act";
import type { ThreadParts } from "@/components/common/stageshow/parts";
import type { StageSizes } from "@/components/common/stageshow/stageFrame";

import styles from "./hero.module.css";

export type HeroPhase = "form" | "shatter" | "chat";

export type HeroState = {
  phase: HeroPhase;
  /** False only for the instant before a fresh form rises in. */
  formIn: boolean;
  /** The finished enquiry is leaving. */
  exit: boolean;
  /** Submit was pressed with Budget empty. */
  error: boolean;
  /** Messages shown; with `typing`, the next one is typing dots. */
  msgs: number;
  typing: boolean;
  /** The reply being typed in the composer. */
  draft: string;
  country: boolean;
  budget: boolean;
};

export const HERO_MESSAGES: {
  from: "me" | "them";
  text: string;
  followUp?: boolean;
}[] = [
  { from: "them", text: "Hi! Which country are you planning to study in?" },
  { from: "me", text: "Canada" },
  { from: "them", text: "Great. What's your budget?" },
  { from: "me", text: "Around 20 lakh" },
  {
    from: "them",
    text: "Is that ₹20 lakh per year, or for the whole course?",
    followUp: true,
  },
  { from: "me", text: "Per year, including living costs" },
];

const FIELDS = ["Full name", "Preferred country", "Budget", "Intake"] as const;
const COUNTRY = 1;
const BUDGET = 2;
/** What the student had already typed into the form before pressing Submit. */
const TYPED: Record<number, string> = { 0: "Priya S.", 3: "Sep 2027" };
/** What the conversation saves into the two fields the form left empty. */
const SAVED: Record<number, string> = {
  [COUNTRY]: "Canada",
  [BUDGET]: "₹20 lakh / year",
};
const SELECTS = new Set([COUNTRY, 3]);

export const HERO_INITIAL: HeroState = {
  phase: "form",
  formIn: true,
  exit: false,
  error: false,
  msgs: 0,
  typing: false,
  draft: "",
  country: false,
  budget: false,
};

export const HERO_POSTER: HeroState = {
  ...HERO_INITIAL,
  phase: "chat",
  msgs: HERO_MESSAGES.length,
  country: true,
  budget: true,
};

export const HERO_SIZES: StageSizes = {
  wide: { width: 1040, height: 440 },
  compact: { width: 358, height: 580 },
};

export const HERO_REST: Record<Layout, Point> = {
  wide: { x: 820, y: 412 },
  compact: { x: 318, y: 554 },
};

export const HERO_LABEL =
  "Illustrative example: a study abroad enquiry form is submitted with Budget empty and shows Required. The form breaks apart and becomes a chat. The assistant asks which country the student plans to study in and saves Canada, then asks the budget. The student answers around 20 lakh, and the assistant follows up: per year, or for the whole course? The answer per year, including living costs, is saved as ₹20 lakh / year, so the counsellor sees a complete record: Priya S., Canada, ₹20 lakh / year, Sep 2027.";

// Geometry, in stage pixels, for each layout and phase
type Box = { x: number; y: number; w: number; h: number; r?: number };
type Pair = { form: Box; chat: Box };
type Geo = {
  card: Pair;
  title: Pair;
  label: (i: number) => Pair;
  input: (i: number) => Pair;
  submit: Pair;
  record: Box;
  thread: Box;
  composer: Box;
};

const WIDE: Geo = {
  card: {
    form: { x: 340, y: 34, w: 360, h: 384, r: 14 },
    chat: { x: 112, y: 28, w: 500, h: 400, r: 20 },
  },
  title: {
    form: { x: 364, y: 56, w: 300, h: 22 },
    chat: { x: 136, y: 44, w: 300, h: 22 },
  },
  label: (i) => ({
    form: { x: 364, y: 94 + i * 64, w: 220, h: 16 },
    chat: { x: 620, y: 128 + i * 52, w: 116, h: 16 },
  }),
  input: (i) => ({
    form: { x: 364, y: 114 + i * 64, w: 312, h: 34, r: 4 },
    chat: { x: 744, y: 122 + i * 52, w: 164, h: 28, r: 14 },
  }),
  submit: {
    form: { x: 364, y: 366, w: 100, h: 36, r: 4 },
    chat: { x: 554, y: 372, w: 32, h: 32, r: 16 },
  },
  record: { x: 596, y: 72, w: 332, h: 268 },
  thread: { x: 132, y: 96, w: 460, h: 262 },
  composer: { x: 132, y: 368, w: 460, h: 40 },
};

const COMPACT: Geo = {
  card: {
    form: { x: 20, y: 86, w: 318, h: 388, r: 14 },
    chat: { x: 16, y: 196, w: 326, h: 360, r: 20 },
  },
  title: {
    form: { x: 40, y: 108, w: 260, h: 22 },
    chat: { x: 39, y: 210, w: 260, h: 22 },
  },
  label: (i) => ({
    form: { x: 40, y: 146 + i * 64, w: 220, h: 16 },
    chat: {
      x: 32 + (i % 2) * 152,
      y: 60 + Math.floor(i / 2) * 58,
      w: 140,
      h: 16,
    },
  }),
  input: (i) => ({
    form: { x: 40, y: 166 + i * 64, w: 278, h: 34, r: 4 },
    chat: {
      x: 32 + (i % 2) * 152,
      y: 78 + Math.floor(i / 2) * 58,
      w: 142,
      h: 28,
      r: 14,
    },
  }),
  submit: {
    form: { x: 40, y: 422, w: 100, h: 36, r: 4 },
    chat: { x: 294, y: 504, w: 32, h: 32, r: 16 },
  },
  record: { x: 16, y: 14, w: 326, h: 168 },
  thread: { x: 32, y: 262, w: 294, h: 228 },
  composer: { x: 28, y: 500, w: 304, h: 40 },
};

// Where each loose piece drifts while the form breaks: an offset and a tilt
// from its place in the form, fixed so every loop breaks the same way. Order:
// title, four labels, four inputs, submit.
type Drift = { dx: number; dy: number; rot: number };
const DRIFT: Record<Layout, Drift[]> = {
  wide: [
    { dx: -170, dy: -6, rot: -6 },
    { dx: -230, dy: 24, rot: 5 },
    { dx: 250, dy: 6, rot: -4 },
    { dx: -260, dy: 48, rot: -5 },
    { dx: 238, dy: 70, rot: 6 },
    { dx: -120, dy: -14, rot: -7 },
    { dx: 150, dy: -8, rot: 5 },
    { dx: -150, dy: 26, rot: 6 },
    { dx: 120, dy: 34, rot: -5 },
    { dx: 200, dy: -8, rot: 8 },
  ],
  compact: [
    { dx: -10, dy: -60, rot: -6 },
    { dx: -16, dy: -40, rot: 5 },
    { dx: 70, dy: -30, rot: -6 },
    { dx: -14, dy: 6, rot: -5 },
    { dx: 90, dy: 24, rot: 6 },
    { dx: -10, dy: -22, rot: -7 },
    { dx: 24, dy: -6, rot: 5 },
    { dx: -20, dy: 20, rot: 6 },
    { dx: 18, dy: 30, rot: -5 },
    { dx: 120, dy: 40, rot: 8 },
  ],
};

function place(b: Box, drift?: Drift, scale = 1): CSSProperties {
  const x = b.x + (drift?.dx ?? 0);
  const y = b.y + (drift?.dy ?? 0);
  return {
    width: b.w,
    height: b.h,
    borderRadius: b.r,
    transform: `translate(${x}px, ${y}px) rotate(${drift?.rot ?? 0}deg) scale(${scale})`,
  };
}

const frame = (b: Box): CSSProperties => ({
  width: b.w,
  height: b.h,
  transform: `translate(${b.x}px, ${b.y}px)`,
});

function Tick() {
  return (
    <svg
      className={styles.tick}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      aria-hidden="true"
    >
      <path
        d="M2.5 6.4 5 8.8l4.6-5.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Chevron() {
  return (
    <svg
      className={styles.chevron}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      aria-hidden="true"
    >
      <path
        d="m3 4.5 3 3 3-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M8 13V3.5M3.5 7.5 8 3l4.5 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HeroScene({
  state: s,
  layout,
  parts: { Thread, Bubble },
}: {
  state: HeroState;
  layout: Layout;
  parts: ThreadParts;
}) {
  const g = layout === "compact" ? COMPACT : WIDE;
  const drift = DRIFT[layout];
  const ph = s.phase;
  const shown = s.formIn && !s.exit;
  // A piece's box for the phase: form place, form place plus drift, chat place
  const at = (pair: Pair, k: number, loose = 1) =>
    ph === "chat"
      ? place(pair.chat)
      : ph === "shatter"
        ? place(pair.form, drift[k], loose)
        : place(pair.form);
  // The break and the arrivals stagger outward from the title
  const delay = (k: number): CSSProperties => ({
    transitionDelay: ph === "form" ? "0ms" : `${k * 45}ms`,
  });
  const vis: CSSProperties = { opacity: shown ? 1 : 0 };
  const typingNext =
    s.typing &&
    s.msgs < HERO_MESSAGES.length &&
    HERO_MESSAGES[s.msgs]?.from === "them";
  const thread = HERO_MESSAGES.slice(0, s.msgs + (typingNext ? 1 : 0));

  return (
    <div
      className={styles.scene}
      data-phase={ph}
      data-exit={s.exit || undefined}
      data-in={s.formIn || undefined}
    >
      <div className={styles.card} style={{ ...at(g.card, 0), ...vis }}>
        <div className={styles.cardChat}>
          <div className={styles.chatSub}>Admissions assistant</div>
          <div className={styles.chatRule} />
        </div>
      </div>

      <div className={styles.record} style={{ ...frame(g.record), ...vis }}>
        <div className={styles.recordTitle}>What your counsellor sees</div>
      </div>

      <div className={styles.threadBox} style={{ ...frame(g.thread), ...vis }}>
        <Thread className={styles.thread}>
          {/* One list keyed by index, so the typing bubble is the same
              element as the message it grows into */}
          {thread.map((m, i) => (
            <Bubble
              key={m.text}
              from={m.from}
              typing={i === s.msgs}
              source={m.from === "me" ? "draft" : undefined}
              className={m.followUp ? styles.followUp : undefined}
            >
              {m.followUp ? (
                <span className={styles.followUpTag}>Follow-up</span>
              ) : null}
              {m.text}
            </Bubble>
          ))}
        </Thread>
      </div>

      <div className={styles.composer} style={{ ...frame(g.composer), ...vis }}>
        <span className={styles.composerText} data-target="draft">
          {s.draft}
          {s.draft ? <i className={styles.caret} /> : null}
        </span>
        <span
          className={styles.composerPlaceholder}
          data-hide={s.draft ? "" : undefined}
        >
          Type your answer
        </span>
      </div>

      <div
        className={`${styles.piece} ${styles.title}`}
        style={{ ...at(g.title, 0), ...delay(0), ...vis }}
      >
        Study abroad enquiry
      </div>

      {FIELDS.map((field, i) => (
        <div
          key={field}
          className={`${styles.piece} ${styles.label}`}
          style={{ ...at(g.label(i), 1 + i), ...delay(1 + i), ...vis }}
        >
          {field}
          <span
            className={styles.required}
            data-on={(s.error && i === BUDGET) || undefined}
          >
            Required
          </span>
        </div>
      ))}

      {FIELDS.map((field, i) => {
        const typed = TYPED[i];
        const saved = SAVED[i];
        const filled =
          (i === COUNTRY && s.country) || (i === BUDGET && s.budget);
        return (
          <div
            key={field}
            className={`${styles.piece} ${styles.input}`}
            data-error={(s.error && i === BUDGET) || undefined}
            data-filled={filled || undefined}
            style={{ ...at(g.input(i), 5 + i, 0.86), ...delay(5 + i), ...vis }}
          >
            {typed ? (
              <span className={styles.value} data-on="">
                {typed}
              </span>
            ) : (
              <>
                <span
                  className={`${styles.value} ${styles.empty}`}
                  data-on={(ph === "chat" && !filled) || undefined}
                >
                  —
                </span>
                <span
                  className={`${styles.value} ${styles.saved}`}
                  data-on={filled || undefined}
                >
                  {saved}
                  <Tick />
                </span>
              </>
            )}
            {SELECTS.has(i) ? <Chevron /> : null}
          </div>
        );
      })}

      <div
        className={`${styles.piece} ${styles.submit}`}
        data-target="submit"
        style={{ ...at(g.submit, 9), ...delay(9), ...vis }}
      >
        <span className={styles.submitLabel}>Submit</span>
        <span className={styles.submitIcon}>
          <SendIcon />
        </span>
      </div>
    </div>
  );
}
