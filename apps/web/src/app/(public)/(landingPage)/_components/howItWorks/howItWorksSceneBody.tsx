import {
  Bubble,
  Count,
  Fly,
  type Layout,
  Phone,
  type Rect,
  Spinner,
  Thread,
} from "@/components/common/stageshow";

import {
  HOW_CHAT,
  HOW_FIELDS,
  HOW_KEYS,
  HOW_LINK,
  HOW_PROMPT,
  HOW_RAIL,
  HOW_SAVED,
} from "./howItWorksStory";
import "./howItWorksScene.css";

// The How it works scene, rendered from any state. The live Stage drives it
// with a script; the still frames render the same body from a fixed state, so
// the first paint, the poster and the loop can never drift apart.

export type HowItWorksState = {
  in: boolean;
  exit: boolean;
  step: 1 | 2 | 3;
  prompt: string;
  busy: boolean;
  fields: number;
  linkReady: boolean;
  fly: boolean;
  /** The agency's message is in the student's chat. */
  sent: boolean;
  /** The link pill has arrived in that message. */
  landed: boolean;
  tap: boolean;
  /** The ConvoForm chat has opened on the phone. */
  open: boolean;
  msgs: number;
  typing: boolean;
  draft: string;
  asking: number;
  saved: number[];
};

export const HOW_INITIAL: HowItWorksState = {
  in: true,
  exit: false,
  step: 1,
  prompt: "",
  busy: false,
  fields: 0,
  linkReady: false,
  fly: false,
  sent: false,
  landed: false,
  tap: false,
  open: false,
  msgs: 0,
  typing: false,
  draft: "",
  asking: -1,
  saved: [],
};

export const HOW_POSTER: HowItWorksState = {
  ...HOW_INITIAL,
  step: 3,
  prompt: HOW_PROMPT,
  fields: HOW_FIELDS.length,
  linkReady: true,
  sent: true,
  landed: true,
  open: true,
  msgs: HOW_CHAT.length,
  saved: [3, 1, 2, 0],
};

// One design pixel. The live Stage is already design-sized, so this stays 1px;
// a still frame sets it to a container-relative unit instead.
const u = (n: number) => `calc(${n} * var(--u))`;

function Tick({ size = 12 }: { size?: number }) {
  return (
    <svg
      className="hw-tick"
      width={size}
      height={size}
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

function SendIcon() {
  return (
    <svg
      className="hw-send-icon"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-hidden
    >
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

function LinkIcon() {
  return (
    <svg
      className="hw-link-icon"
      width="12"
      height="12"
      viewBox="0 0 16 16"
      aria-hidden
    >
      <path
        d="M6.5 9.5 9.5 6.5M7 4.2l1-1a3 3 0 0 1 4.2 4.2l-1 1M9 11.8l-1 1A3 3 0 0 1 3.8 8.6l1-1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Back() {
  return (
    <svg
      className="hw-back-icon"
      width="12"
      height="20"
      viewBox="0 0 12 20"
      aria-hidden
    >
      <path
        d="M10 2 2 10l8 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Rail({ s, layout }: { s: HowItWorksState; layout: Layout }) {
  return (
    <div className="hw-rail" aria-hidden>
      {HOW_RAIL[layout].map((t, i) => (
        <div
          key={t}
          className="hw-rail__item"
          data-on={s.step === i + 1 || undefined}
          data-done={s.step > i + 1 || undefined}
        >
          <span className="hw-rail__n">{String(i + 1).padStart(2, "0")}</span>
          <span className="hw-rail__t">{t}</span>
          {i < 2 && (
            <span className="hw-rail__line">
              <i data-on={s.step > i + 1 || undefined} />
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function Builder({ s }: { s: HowItWorksState }) {
  const done = s.saved.length;
  return (
    <div className="hw-builder">
      <div className="hw-b__head">
        <span className="hw-b__title">
          <span className="hw-swap" data-on={s.fields === 0 || undefined}>
            Untitled form
          </span>
          <span className="hw-swap" data-on={s.fields > 0 || undefined}>
            Study abroad enquiry
          </span>
        </span>
        <span
          className="hw-mono hw-count"
          data-on={s.step >= 2 || undefined}
          data-full={done === 4 || undefined}
        >
          <Count value={done} format={(n) => String(Math.round(n))} />
          /4
          {done === 4 && <Tick size={11} />}
        </span>
      </div>
      <div className="hw-mono hw-b__label">Describe your form</div>
      <div
        className="hw-prompt"
        data-busy={s.busy || undefined}
        data-done={s.fields > 0 || undefined}
      >
        <span
          className="hw-prompt__ph"
          data-hide={s.prompt.length > 0 || undefined}
        >
          What should your form ask?
        </span>
        <span className="hw-prompt__text" data-target="prompt">
          {s.prompt}
          {s.prompt && s.prompt.length < HOW_PROMPT.length && (
            <i className="hw-caret" />
          )}
        </span>
        <span
          className="hw-go"
          data-target="draft"
          data-cursor="pointer"
          data-on={s.prompt.length === HOW_PROMPT.length || undefined}
        >
          <span className="hw-go__label" data-hide={s.busy || undefined}>
            Draft
          </span>
          <Spinner
            size={12}
            className="hw-go__spin"
            data-show={s.busy || undefined}
          />
        </span>
      </div>
      <div className="hw-fields">
        {HOW_FIELDS.map((f, i) => {
          const filled = s.saved.includes(i);
          return (
            <div
              key={f}
              className="hw-field"
              data-on={s.fields > i || undefined}
              data-asking={s.asking === i || undefined}
              data-filled={filled || undefined}
            >
              <span className="hw-mono hw-field__n">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="hw-field__label">{f}</span>
              <span className="hw-field__val">
                <span
                  className="hw-v hw-v--empty"
                  data-on={(s.step >= 2 && !filled) || undefined}
                >
                  —
                </span>
                <span className="hw-v hw-v--set" data-on={filled || undefined}>
                  {HOW_SAVED[i]}
                </span>
              </span>
              <span className="hw-field__kind" aria-hidden />
            </div>
          );
        })}
      </div>
      <div className="hw-share" data-on={s.linkReady || undefined}>
        <span
          className="hw-link"
          data-target="link"
          data-hidden={s.fly || undefined}
        >
          <LinkIcon />
          <span>{HOW_LINK}</span>
        </span>
        <span
          className="hw-share__btn"
          data-target="share"
          data-cursor="pointer"
          data-sent={s.step >= 2 || undefined}
        >
          <span className="hw-share__a">Share</span>
          <span className="hw-share__b">
            Sent <Tick size={11} />
          </span>
        </span>
      </div>
      <div className="hw-chips" data-on={s.step >= 3 || undefined}>
        <span className="hw-chip">Transcript</span>
        <span className="hw-chip">Export CSV</span>
        <span className="hw-chip">Google Sheets</span>
      </div>
    </div>
  );
}

function PhoneScene({ s }: { s: HowItWorksState }) {
  return (
    <div className="hw-phone">
      <Phone
        width={340}
        height={690}
        time="9:41"
        style={{ width: u(340), height: u(690) }}
      >
        {/* The messages app the link arrives in */}
        <div className="hw-msgs">
          <div className="hw-msgs__head">
            <span className="hw-msgs__back">
              <Back />
            </span>
            <span className="hw-msgs__av">A</span>
            <span className="hw-msgs__name">Admissions team</span>
          </div>
          <div className="hw-msgs__body">
            <Thread app="sms" className="hw-thread hw-thread--msgs">
              <Bubble from="me">
                Hi! I&apos;m planning to study abroad next year.
              </Bubble>
              {s.sent && (
                <Bubble from="them" className="hw-lb-row">
                  <span className="hw-lb">
                    <span className="hw-lb__text">
                      Great! Tell us about your plans here:
                    </span>
                    <span className="hw-lb__card" data-tap={s.tap || undefined}>
                      <span className="hw-lb__title">Study abroad enquiry</span>
                      <span
                        className="hw-lb__pill"
                        data-target="phone-link"
                        data-on={s.landed || undefined}
                      >
                        <LinkIcon />
                        <span>{HOW_LINK}</span>
                      </span>
                    </span>
                  </span>
                </Bubble>
              )}
            </Thread>
          </div>
        </div>
        {/* The ConvoForm chat, in the phone's browser */}
        <div className="hw-chat" data-open={s.open || undefined}>
          <div className="hw-chat__head">
            <span className="hw-chat__title">Study abroad enquiry</span>
            <span className="hw-chat__sub">Admissions assistant</span>
          </div>
          <div className="hw-chat__body">
            <Thread className="hw-thread hw-thread--cf">
              {HOW_CHAT.slice(
                0,
                s.msgs +
                  (s.typing &&
                  s.msgs < HOW_CHAT.length &&
                  HOW_CHAT[s.msgs]?.from === "them"
                    ? 1
                    : 0),
              ).map((m, i) => (
                <Bubble
                  key={m.text}
                  from={m.from}
                  typing={i === s.msgs}
                  source={m.from === "me" ? "draft" : undefined}
                  className={m.followUp ? "hw-followup" : undefined}
                >
                  {m.text}
                </Bubble>
              ))}
            </Thread>
          </div>
          <div className="hw-composer">
            <span
              className="hw-composer__ph"
              data-hide={s.draft.length > 0 || undefined}
            >
              Type your answer…
            </span>
            <span className="hw-composer__text" data-target="draft">
              {s.draft}
              {s.draft && <i className="hw-caret" />}
            </span>
            <span className="hw-composer__send">
              <SendIcon />
            </span>
          </div>
        </div>
      </Phone>
    </div>
  );
}

function Record({ s }: { s: HowItWorksState }) {
  const done = s.saved.length;
  return (
    <div className="hw-record">
      <div className="hw-r__head">
        <span className="hw-mono">New response</span>
        <span
          className="hw-mono hw-count"
          data-on={s.step >= 2 || undefined}
          data-full={done === 4 || undefined}
        >
          <Count value={done} format={(n) => String(Math.round(n))} />
          /4
          {done === 4 && <Tick size={11} />}
        </span>
      </div>
      {HOW_KEYS.map((k, i) => {
        const filled = s.saved.includes(i);
        return (
          <div key={k} className="hw-r__row" data-filled={filled || undefined}>
            <span className="hw-mono hw-r__k">{k}</span>
            <span className="hw-r__v">
              <span className="hw-v hw-v--empty" data-on={!filled || undefined}>
                —
              </span>
              <span className="hw-v hw-v--set" data-on={filled || undefined}>
                {HOW_SAVED[i]}
              </span>
            </span>
            <span className="hw-r__ok" data-on={filled || undefined}>
              <Tick size={10} />
            </span>
          </div>
        );
      })}
      <div className="hw-r__foot">
        <span className="hw-chip">Transcript</span>
        <span className="hw-chip">Export CSV</span>
        <span className="hw-chip">Google Sheets</span>
      </div>
    </div>
  );
}

export function HowItWorksSceneBody({
  state: s,
  layout,
  rect,
}: {
  state: HowItWorksState;
  layout: Layout;
  rect?: (name: string) => Rect;
}) {
  const compact = layout === "compact";
  const shown = s.in && !s.exit;
  return (
    <div
      className="hw-scene"
      data-layout={layout}
      data-exit={s.exit || undefined}
      data-in={s.in || undefined}
      data-shown={shown || undefined}
    >
      <div className="hw-grid" aria-hidden />
      <Rail s={s} layout={layout} />
      <Builder s={s} />
      <PhoneScene s={s} />
      {!compact && <Record s={s} />}
      {rect && (
        <Fly
          from={rect("link")}
          to={rect("phone-link")}
          go={s.fly}
          duration={700}
          className="hw-fly"
        >
          <span className="hw-link hw-link--fly">
            <LinkIcon />
            <span>{HOW_LINK}</span>
          </span>
        </Fly>
      )}
    </div>
  );
}
