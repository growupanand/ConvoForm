import type { CSSProperties } from "react";

import { Bubble, type Layout, Thread } from "@/components/common/stageshow";

import {
  HERO_BUDGET,
  HERO_FIELDS,
  HERO_MESSAGES,
  HERO_VALUES,
} from "./heroStory";
import "./heroScene.css";

// The hero's one scene, rendered from any state. The live Stage drives it with
// a script; the still frames render the same body from a fixed state, so the
// first paint, the poster and the loop can never drift apart.

export type Phase = "form" | "shatter" | "chat";

export type HeroSceneState = {
  phase: Phase;
  formIn: boolean;
  exit: boolean;
  error: boolean;
  msgs: number;
  typing: boolean;
  draft: string;
  country: boolean;
  budget: boolean;
};

export const HERO_INITIAL: HeroSceneState = {
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

export const HERO_POSTER: HeroSceneState = {
  ...HERO_INITIAL,
  phase: "chat",
  msgs: HERO_MESSAGES.length,
  country: true,
  budget: true,
};

// One design pixel. The live Stage is already design-sized, so this stays 1px;
// a still frame sets it to a container-relative unit instead.
const u = (n: number) => `calc(${n} * var(--u))`;

// Geometry, in stage pixels, for each layout and phase.
type Box = {
  x: number;
  y: number;
  w: number;
  h: number;
  r?: number;
  rot?: number;
  s?: number;
};

type Geo = {
  W: number;
  H: number;
  card: { form: Box; chat: Box };
  title: { form: Box; chat: Box };
  label: (i: number) => { form: Box; chat: Box };
  input: (i: number) => { form: Box; chat: Box };
  submit: { form: Box; chat: Box };
  record: Box;
  thread: Box;
  composer: Box;
};

export const HERO_WIDE: Geo = {
  W: 1040,
  H: 440,
  card: {
    form: { x: 340, y: 34, w: 360, h: 384, r: 10 },
    chat: { x: 112, y: 28, w: 500, h: 470, r: 18 },
  },
  title: {
    form: { x: 364, y: 56, w: 300, h: 20 },
    chat: { x: 136, y: 46, w: 300, h: 20 },
  },
  label: (i) => ({
    form: { x: 364, y: 94 + i * 64, w: 200, h: 16 },
    chat: { x: 620, y: 128 + i * 52, w: 110, h: 16 },
  }),
  input: (i) => ({
    form: { x: 364, y: 114 + i * 64, w: 312, h: 34, r: 7 },
    chat: { x: 744, y: 122 + i * 52, w: 164, h: 28, r: 7 },
  }),
  submit: {
    form: { x: 364, y: 366, w: 100, h: 36, r: 8 },
    chat: { x: 556, y: 372, w: 32, h: 32, r: 16 },
  },
  record: { x: 596, y: 72, w: 332, h: 268 },
  thread: { x: 132, y: 96, w: 460, h: 262 },
  composer: { x: 132, y: 368, w: 460, h: 40 },
};

export const HERO_COMPACT: Geo = {
  W: 358,
  H: 560,
  card: {
    form: { x: 20, y: 86, w: 318, h: 388, r: 10 },
    chat: { x: 16, y: 196, w: 326, h: 420, r: 18 },
  },
  title: {
    form: { x: 40, y: 108, w: 260, h: 20 },
    chat: { x: 34, y: 212, w: 260, h: 20 },
  },
  label: (i) => ({
    form: { x: 40, y: 146 + i * 64, w: 200, h: 16 },
    chat: {
      x: 34 + (i % 2) * 150,
      y: 60 + Math.floor(i / 2) * 58,
      w: 136,
      h: 16,
    },
  }),
  input: (i) => ({
    form: { x: 40, y: 166 + i * 64, w: 278, h: 34, r: 7 },
    chat: {
      x: 34 + (i % 2) * 150,
      y: 78 + Math.floor(i / 2) * 58,
      w: 144,
      h: 28,
      r: 7,
    },
  }),
  submit: {
    form: { x: 40, y: 422, w: 100, h: 36, r: 8 },
    chat: { x: 296, y: 504, w: 32, h: 32, r: 16 },
  },
  record: { x: 16, y: 16, w: 326, h: 166 },
  thread: { x: 32, y: 262, w: 294, h: 228 },
  composer: { x: 28, y: 500, w: 304, h: 40 },
};

// Where each loose piece drifts while the form breaks: an offset and a tilt
// from its place in the form, fixed so every loop breaks the same way.
const DRIFT: Record<Layout, { dx: number; dy: number; rot: number }[]> = {
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

function place(
  b: Box,
  extra?: { dx: number; dy: number; rot: number },
  scale = 1,
): CSSProperties {
  const x = b.x + (extra?.dx ?? 0);
  const y = b.y + (extra?.dy ?? 0);
  return {
    width: u(b.w),
    height: u(b.h),
    borderRadius: b.r === undefined ? undefined : u(b.r),
    transform: `translate(${u(x)}, ${u(y)}) rotate(${extra?.rot ?? 0}deg) scale(${scale})`,
  };
}

function Tick() {
  return (
    <svg
      className="cf-tick"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      aria-hidden
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

function Send() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
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

export function HeroSceneBody({
  state: s,
  layout,
}: {
  state: HeroSceneState;
  layout: Layout;
}) {
  const g = layout === "compact" ? HERO_COMPACT : HERO_WIDE;
  const drift = DRIFT[layout];
  const ph = s.phase;
  const shown = s.formIn && !s.exit;
  // A piece's box for the phase: form place, form place + drift, chat place.
  const at = (pair: { form: Box; chat: Box }, k: number, scaleLoose = 1) =>
    ph === "chat"
      ? place(pair.chat)
      : ph === "shatter"
        ? place(pair.form, drift[k], scaleLoose)
        : place(pair.form);
  // Arrivals stagger 50ms; the break staggers outward from the title.
  const delay = (k: number) => ({
    transitionDelay: ph === "form" ? "0ms" : `${k * 45}ms`,
  });
  const vis = { opacity: shown ? 1 : 0 };
  return (
    <div
      className="cf-scene"
      data-layout={layout}
      data-phase={ph}
      data-exit={s.exit || undefined}
      data-in={s.formIn || undefined}
    >
      <div className="cf-grid" aria-hidden />

      {/* The card: the form's sheet, then the conversation's panel. */}
      <div className="cf-card" style={{ ...at(g.card, 0), ...vis }}>
        <div className="cf-card__chat" aria-hidden>
          <div className="cf-chat-sub">Admissions assistant</div>
          <div className="cf-chat-rule" />
        </div>
      </div>

      {/* The record your counsellor sees: a frame the fields land in. */}
      <div
        className="cf-record"
        style={{
          transform: `translate(${u(g.record.x)}, ${u(g.record.y)})`,
          width: u(g.record.w),
          height: u(g.record.h),
          ...vis,
        }}
      >
        <div className="cf-mono cf-record__title">
          What your counsellor sees
        </div>
      </div>

      {/* The thread and composer live in the panel once it forms. */}
      <div
        className="cf-thread-box"
        style={{
          transform: `translate(${u(g.thread.x)}, ${u(g.thread.y)})`,
          width: u(g.thread.w),
          height: u(g.thread.h),
          ...vis,
        }}
      >
        <Thread className="cf-thread">
          {/* One keyed list, so the typing bubble is the same element as the
              message it becomes and grows into it. */}
          {HERO_MESSAGES.slice(
            0,
            s.msgs +
              (s.typing &&
              s.msgs < HERO_MESSAGES.length &&
              HERO_MESSAGES[s.msgs]?.from === "them"
                ? 1
                : 0),
          ).map((m, i) => (
            <Bubble
              key={m.text}
              from={m.from}
              typing={i === s.msgs}
              source={m.from === "me" ? "draft" : undefined}
              className={m.followUp ? "cf-followup" : undefined}
            >
              {m.text}
            </Bubble>
          ))}
        </Thread>
      </div>
      <div
        className="cf-composer"
        style={{
          transform: `translate(${u(g.composer.x)}, ${u(g.composer.y)})`,
          width: u(g.composer.w),
          height: u(g.composer.h),
          ...vis,
        }}
      >
        <span className="cf-composer__text" data-target="draft">
          {s.draft}
          {s.draft && <i className="cf-caret" />}
        </span>
        <span className="cf-composer__ph" data-hide={s.draft ? "" : undefined}>
          Type your answer
        </span>
      </div>

      {/* The pieces: one object each, one trip per phase. */}
      <div
        className="cf-p cf-p--title"
        style={{ ...at(g.title, 0), ...delay(0), ...vis }}
      >
        Study abroad enquiry
      </div>
      {HERO_FIELDS.map((f, i) => (
        <div
          key={f}
          className="cf-p cf-p--label"
          style={{ ...at(g.label(i), 1 + i), ...delay(1 + i), ...vis }}
        >
          {f}
          <span
            className="cf-req"
            data-on={(s.error && i === HERO_BUDGET) || undefined}
          >
            Required
          </span>
        </div>
      ))}
      {HERO_FIELDS.map((f, i) => {
        const filled =
          i === 0 ||
          i === 3 ||
          (i === 1 && s.country) ||
          (i === HERO_BUDGET && s.budget);
        return (
          <div
            key={f}
            className="cf-p cf-p--input"
            data-error={(s.error && i === HERO_BUDGET) || undefined}
            data-filled={filled || undefined}
            style={{
              ...at(g.input(i), 5 + i, 0.86),
              ...delay(5 + i),
              ...vis,
            }}
          >
            <span
              className="cf-val cf-val--empty"
              data-on={(ph === "chat" && !filled) || undefined}
            >
              —
            </span>
            <span className="cf-val cf-val--set" data-on={filled || undefined}>
              {HERO_VALUES[i]}
              <Tick />
            </span>
          </div>
        );
      })}
      <div
        className="cf-p cf-p--submit"
        data-target="submit"
        data-cursor="pointer"
        style={{ ...at(g.submit, 9), ...delay(9), ...vis }}
      >
        <span className="cf-submit__label">Submit</span>
        <span className="cf-submit__icon">
          <Send />
        </span>
      </div>
    </div>
  );
}
