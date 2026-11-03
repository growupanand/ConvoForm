// "How it works" as one story in three linked steps, each the cause of the
// next. 01: a description is typed, Draft is pressed and the fields drop in.
// 02: Share sends the link into a student's messenger; the student taps it
// and the ConvoForm chat opens. 03: every answer lands cleaned in its row.
// The rail only advances when those things happen. Pure, so the server draws
// the static frames with it and the live stage draws every state with it.

import type { Layout, Point, Rect } from "@/components/common/stageshow/act";
import {
  Count,
  Fly,
  type FlyPhase,
  Phone,
  Spinner,
  type ThreadParts,
} from "@/components/common/stageshow/parts";
import type { StageSizes } from "@/components/common/stageshow/stageFrame";

import styles from "./howItWorks.module.css";

export const HOW_PROMPT = "Enquiry form for students planning to study abroad";
const FIELDS = ["Full name", "Preferred country", "Intake", "Budget"] as const;
const KEYS = ["Name", "Country", "Intake", "Budget"] as const;
const SAVED = ["Priya S.", "Canada", "Sep 2027", "₹20 lakh / year"] as const;
const LINK = "convoform.com/view/enquiry";

/** The chat asks the drafted fields; `ask` lights a field, `save` lands an answer. */
export const HOW_CHAT: {
  from: "me" | "them";
  text: string;
  ask?: number;
  save?: number;
  followUp?: boolean;
}[] = [
  { from: "them", text: "What's your budget for studying abroad?", ask: 3 },
  { from: "me", text: "20" },
  {
    from: "them",
    text: "₹20 lakh per year, or in total?",
    ask: 3,
    followUp: true,
  },
  { from: "me", text: "per year", save: 3 },
  { from: "them", text: "Which country are you considering?", ask: 1 },
  { from: "me", text: "maybe canada", save: 1 },
  { from: "them", text: "When would you like to start?", ask: 2 },
  { from: "me", text: "sept next yr", save: 2 },
  { from: "them", text: "Lastly, your name?", ask: 0 },
  { from: "me", text: "priya s", save: 0 },
];

export type HowState = {
  /** False only for the instant before a fresh builder rises in. */
  in: boolean;
  exit: boolean;
  step: 1 | 2 | 3;
  prompt: string;
  busy: boolean;
  /** How many drafted fields have dropped in. */
  fields: number;
  linkReady: boolean;
  /** The link has left the builder: its pill there dims. */
  linkSent: boolean;
  fly: FlyPhase;
  flyFrom: Rect;
  flyTo: Rect;
  /** The admissions team's message is in the student's messenger. */
  sent: boolean;
  /** The link has landed in that message. */
  landed: boolean;
  tap: boolean;
  /** The ConvoForm chat has opened over the messenger. */
  open: boolean;
  msgs: number;
  typing: boolean;
  draft: string;
  asking: number;
  saved: number[];
};

const NO_RECT: Rect = { x: 0, y: 0, width: 0, height: 0 };

export const HOW_INITIAL: HowState = {
  in: true,
  exit: false,
  step: 1,
  prompt: "",
  busy: false,
  fields: 0,
  linkReady: false,
  linkSent: false,
  fly: "off",
  flyFrom: NO_RECT,
  flyTo: NO_RECT,
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

export const HOW_POSTER: HowState = {
  ...HOW_INITIAL,
  step: 3,
  prompt: HOW_PROMPT,
  fields: FIELDS.length,
  linkReady: true,
  linkSent: true,
  sent: true,
  landed: true,
  open: true,
  msgs: HOW_CHAT.length,
  saved: [3, 1, 2, 0],
};

export const HOW_SIZES: StageSizes = {
  wide: { width: 1040, height: 500 },
  compact: { width: 358, height: 708 },
};

export const HOW_REST: Record<Layout, Point> = {
  wide: { x: 330, y: 476 },
  compact: { x: 338, y: 364 },
};

const PHONE: Record<Layout, { width: number; height: number }> = {
  wide: { width: 340, height: 720 },
  compact: { width: 310, height: 680 },
};

export const HOW_LABEL =
  "Illustrative example in three steps. 01 Design: the description Enquiry form for students planning to study abroad is typed, Draft is pressed, and the fields Full name, Preferred country, Intake and Budget appear with the link convoform.com/view/enquiry. 02 Share: Share sends the link into a student's messenger chat with the admissions team, and the student taps it to open the ConvoForm chat. 03 Review: the chat asks each field; the vague budget answer 20 gets the follow-up ₹20 lakh per year, or in total?, and the answers land cleaned as Priya S., Canada, Sep 2027 and ₹20 lakh / year, a complete 4 of 4 response ready as a transcript, a CSV export or in Google Sheets.";

const RAIL: Record<Layout, readonly string[]> = {
  wide: ["Design your form", "Share the link", "Review clean answers"],
  compact: ["Design", "Share", "Review"],
};

function Tick({ size = 12 }: { size?: number }) {
  return (
    <svg
      className={styles.tick}
      width={size}
      height={size}
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

function LinkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
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

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
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

function BackIcon() {
  return (
    <svg width="10" height="18" viewBox="0 0 10 18" aria-hidden="true">
      <path
        d="M8.5 1.5 1.5 9l7 7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Rail({ step, layout }: { step: number; layout: Layout }) {
  return (
    <div className={styles.rail}>
      {RAIL[layout].map((title, i) => (
        <div
          key={title}
          className={styles.railItem}
          data-on={step === i + 1 || undefined}
          data-done={step > i + 1 || undefined}
        >
          <span className={styles.railNumber}>
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className={styles.railTitle}>{title}</span>
          {i < 2 ? (
            <span className={styles.railLine}>
              <i data-on={step > i + 1 || undefined} />
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function Counter({ done, on }: { done: number; on: boolean }) {
  return (
    <span
      className={styles.count}
      data-on={on || undefined}
      data-full={done === FIELDS.length || undefined}
    >
      <span className={styles.countFigure}>
        <Count value={done} />/{FIELDS.length}
      </span>
      {done === FIELDS.length ? <Tick size={11} /> : null}
    </span>
  );
}

function LinkPill() {
  return (
    <>
      <LinkIcon />
      <span>{LINK}</span>
    </>
  );
}

export function HowItWorksScene({
  state: s,
  layout,
  parts: { Thread, Bubble },
}: {
  state: HowState;
  layout: Layout;
  parts: ThreadParts;
}) {
  const compact = layout === "compact";
  const done = s.saved.length;
  const shown = s.in && !s.exit;
  const typingNext =
    s.typing && s.msgs < HOW_CHAT.length && HOW_CHAT[s.msgs]?.from === "them";
  const chat = HOW_CHAT.slice(0, s.msgs + (typingNext ? 1 : 0));

  return (
    <div
      className={styles.scene}
      data-layout={layout}
      data-shown={shown || undefined}
    >
      <Rail step={s.step} layout={layout} />

      {/* 01 · the builder. Compact: its fields also take the answers */}
      <div className={styles.builder}>
        <div className={styles.builderHead}>
          <span className={styles.formTitle}>
            <span className={styles.swap} data-on={s.fields === 0 || undefined}>
              Untitled form
            </span>
            <span className={styles.swap} data-on={s.fields > 0 || undefined}>
              Study abroad enquiry
            </span>
          </span>
          {compact ? <Counter done={done} on={s.step >= 2} /> : null}
        </div>
        <div className={`${styles.mono} ${styles.builderLabel}`}>
          Describe your form
        </div>
        <div className={styles.prompt}>
          <span
            className={styles.promptPlaceholder}
            data-hide={s.prompt.length > 0 || undefined}
          >
            What should your form ask?
          </span>
          <span className={styles.promptText} data-target="prompt">
            {s.prompt}
            {s.prompt && s.prompt.length < HOW_PROMPT.length ? (
              <i className={styles.caret} />
            ) : null}
          </span>
          <span
            className={styles.draft}
            data-target="generate"
            data-on={s.prompt.length === HOW_PROMPT.length || undefined}
            data-busy={s.busy || undefined}
          >
            <span className={styles.draftLabel}>Draft</span>
            <span className={styles.draftSpin}>
              <Spinner size={12} />
            </span>
          </span>
        </div>
        <div className={styles.fields}>
          {FIELDS.map((field, i) => {
            const filled = s.saved.includes(i);
            return (
              <div key={field} className={styles.slot}>
                <div
                  className={styles.field}
                  data-on={s.fields > i || undefined}
                  data-asking={s.asking === i || undefined}
                  data-filled={(compact && filled) || undefined}
                >
                  <span className={`${styles.mono} ${styles.fieldNumber}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={styles.fieldLabel}>{field}</span>
                  {compact ? (
                    <span className={styles.fieldValue}>
                      <span
                        className={`${styles.value} ${styles.empty}`}
                        data-on={(s.step >= 2 && !filled) || undefined}
                      >
                        —
                      </span>
                      <span
                        className={`${styles.value} ${styles.saved}`}
                        data-on={filled || undefined}
                      >
                        {SAVED[i]}
                      </span>
                    </span>
                  ) : (
                    <span className={styles.fieldKind} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className={styles.share} data-on={s.linkReady || undefined}>
          <span
            className={styles.link}
            data-target="link"
            data-sent={s.linkSent || undefined}
          >
            <LinkPill />
          </span>
          <span
            className={styles.shareButton}
            data-target="share"
            data-sent={s.step >= 2 || undefined}
          >
            <span className={styles.shareLabel}>Share</span>
            <span className={styles.sentLabel}>
              Sent <Tick size={11} />
            </span>
          </span>
        </div>
      </div>

      {/* 02 · the student's phone */}
      <div className={styles.phone}>
        <Phone width={PHONE[layout].width} height={PHONE[layout].height}>
          {/* A messenger chat with the admissions team */}
          <div className={styles.messenger}>
            <div className={styles.messengerHead}>
              <span className={styles.back}>
                <BackIcon />
              </span>
              <span className={styles.avatar}>A</span>
              <span className={styles.contact}>
                <span className={styles.contactName}>Admissions team</span>
                <span className={styles.contactStatus}>online</span>
              </span>
            </div>
            <div className={styles.messengerBody}>
              <Thread className={styles.messengerThread}>
                <Bubble from="me">
                  Hi! I'm planning to study abroad next year.
                </Bubble>
                {s.sent ? (
                  <Bubble from="them" className={styles.linkBubble}>
                    <span className={styles.linkMessage}>
                      Tell us about your plans here:
                    </span>
                    <span
                      className={styles.phoneLink}
                      data-target="phone-link"
                      data-on={s.landed || undefined}
                      data-tap={s.tap || undefined}
                    >
                      <LinkPill />
                    </span>
                  </Bubble>
                ) : null}
              </Thread>
            </div>
          </div>

          {/* The ConvoForm chat, in the phone's browser */}
          <div className={styles.chat} data-open={s.open || undefined}>
            <div className={styles.chatHead}>
              <span className={styles.chatTitle}>Study abroad enquiry</span>
              <span className={styles.chatSub}>Admissions assistant</span>
            </div>
            <div className={styles.chatBody}>
              <Thread className={styles.chatThread}>
                {chat.map((m, i) => (
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
            <div className={styles.composer}>
              <span
                className={styles.composerPlaceholder}
                data-hide={s.draft.length > 0 || undefined}
              >
                Type your answer
              </span>
              <span className={styles.composerText} data-target="draft">
                {s.draft}
                {s.draft ? <i className={styles.caret} /> : null}
              </span>
              <span className={styles.send}>
                <SendIcon />
              </span>
            </div>
          </div>
        </Phone>
      </div>

      {/* 03 · the response the owner sees (wide) */}
      {compact ? null : (
        <div className={styles.record}>
          <div className={styles.recordHead}>
            <span className={styles.mono}>New response</span>
            <Counter done={done} on={s.step >= 2} />
          </div>
          {KEYS.map((key, i) => {
            const filled = s.saved.includes(i);
            return (
              <div
                key={key}
                className={styles.recordRow}
                data-filled={filled || undefined}
              >
                <span className={`${styles.mono} ${styles.recordKey}`}>
                  {key}
                </span>
                <span className={styles.recordValue}>
                  <span
                    className={`${styles.value} ${styles.empty}`}
                    data-on={!filled || undefined}
                  >
                    —
                  </span>
                  <span
                    className={`${styles.value} ${styles.saved}`}
                    data-on={filled || undefined}
                  >
                    {SAVED[i]}
                  </span>
                </span>
                <span className={styles.recordOk} data-on={filled || undefined}>
                  <Tick size={10} />
                </span>
              </div>
            );
          })}
          <div className={styles.recordFoot}>
            <span className={styles.chip}>Transcript</span>
            <span className={styles.chip}>Export CSV</span>
            <span className={styles.chip}>Google Sheets</span>
          </div>
        </div>
      )}

      {/* The link, carried from the builder into the message */}
      <Fly
        from={s.flyFrom}
        to={s.flyTo}
        phase={s.fly}
        duration={700}
        className={styles.flyer}
      >
        <span className={styles.flyLink} data-phase={s.fly}>
          <LinkPill />
        </span>
      </Fly>
    </div>
  );
}
