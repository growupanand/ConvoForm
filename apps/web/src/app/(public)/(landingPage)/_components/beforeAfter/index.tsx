"use client";

import type { StageStatus } from "@/components/common/stageshow";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

import { type PlayOnceStageHandle, StageControl } from "../stageControl";
import styles from "./beforeAfter.module.css";
import type { BeforeAfterMessage, BeforeAfterScenario } from "./scenarios";

const PLAY_SECONDS = 6;
const MESSAGE_TIMES = [0.35, 1, 1.85, 2.6] as const;

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));
const progress = (start: number, end: number, time: number) =>
  clamp((time - start) / (end - start));
const easeOut = (value: number) => 1 - (1 - clamp(value)) ** 3;
const easeInOut = (value: number) => {
  const amount = clamp(value);
  return amount < 0.5 ? 4 * amount ** 3 : 1 - (-2 * amount + 2) ** 3 / 2;
};

function PanelLabel({
  children,
  highlighted = false,
}: {
  children: React.ReactNode;
  highlighted?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 font-mono text-[11px] uppercase leading-none tracking-[0.08em]",
        highlighted ? "text-marketing-blue-600" : "text-marketing-label",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "h-px w-2.5",
          highlighted ? "bg-marketing-blue-600" : "bg-marketing-slate",
        )}
      />
      {children}
    </div>
  );
}

function Message({
  message,
  final,
  index,
}: {
  message: BeforeAfterMessage;
  final: boolean;
  index: number;
}) {
  if (message.kind === "followUp") {
    return (
      <div
        data-ba="message"
        data-index={index}
        style={final ? undefined : { opacity: 0, transform: "translateY(8px)" }}
        className="w-fit max-w-[85%] self-start rounded-2xl rounded-bl-[5px] border-[1.25px] border-marketing-blue-300 bg-marketing-blue-50 px-3.5 py-2.5 font-body text-[14.5px] leading-[1.35] text-marketing-blue-700"
      >
        <span className="mb-1.5 block font-mono text-[11px] uppercase leading-none tracking-[0.08em] text-marketing-blue-600">
          ↳ Follow-up
        </span>
        <span data-ba="message-text">{message.text}</span>
      </div>
    );
  }

  const isUser = message.kind === "user";

  return (
    <div
      data-ba="message"
      data-index={index}
      style={final ? undefined : { opacity: 0, transform: "translateY(8px)" }}
      className={cn(
        "w-fit max-w-[82%] rounded-2xl border-[1.25px] px-3.5 py-2.5 font-body text-[14.5px] leading-[1.35]",
        isUser
          ? "self-end rounded-br-[5px] border-marketing-ink bg-marketing-surface font-medium text-marketing-ink"
          : "self-start rounded-bl-[5px] border-marketing-hair bg-marketing-surface text-marketing-ink",
      )}
    >
      <span
        data-ba="message-text"
        data-vague={message.vague ? "true" : undefined}
        className={cn(
          message.vague &&
            "bg-[linear-gradient(var(--marketing-blue-600),var(--marketing-blue-600))] bg-[length:0_1.25px] bg-bottom bg-no-repeat pb-px",
        )}
        style={
          final && message.vague ? { backgroundSize: "100% 1.25px" } : undefined
        }
      >
        {message.text}
      </span>
    </div>
  );
}

function SavedCheck({ final }: { final: boolean }) {
  return (
    <svg
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
      className="size-[22px] shrink-0"
    >
      <circle
        data-ba="ring"
        cx="11"
        cy="11"
        r="10"
        pathLength={1}
        strokeDasharray={final ? undefined : 1}
        strokeDashoffset={final ? undefined : 1}
        className="stroke-marketing-blue-200"
        strokeWidth="1.25"
      />
      <path
        data-ba="tick"
        d="M6 11.5 9.2 14.7 16 7.8"
        pathLength={1}
        strokeDasharray={final ? undefined : 1}
        strokeDashoffset={final ? undefined : 1}
        className="stroke-marketing-blue-600"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SceneMarkup({
  scenario,
  final,
  columns = 5,
  valuesLabel = "What your team sees",
}: {
  scenario: BeforeAfterScenario;
  final: boolean;
  columns?: 5 | 6;
  valuesLabel?: string;
}) {
  return (
    <>
      <div className="mt-7 grid grid-cols-1 gap-6 min-[900px]:grid-cols-[1fr_1.25fr]">
        <div className="relative rounded-[22px] border-[1.25px] border-dashed border-marketing-hair bg-marketing-surface/60 p-6 min-[900px]:p-[26px]">
          <PanelLabel>Static form</PanelLabel>

          <div className="mt-5">
            <div className="font-body text-[13px] leading-none text-marketing-text">
              {scenario.fieldLabel}
            </div>
            <div className="mt-2 flex h-[42px] items-center rounded-[4px] border-[1.25px] border-marketing-hair bg-marketing-surface px-3 font-body text-[15px] text-marketing-text">
              <span data-ba="typed" className="whitespace-pre">
                {final ? scenario.typed : ""}
              </span>
              <span
                data-ba="caret"
                aria-hidden="true"
                style={final ? { opacity: 0 } : undefined}
                className="ml-px inline-block h-[18px] w-px shrink-0 bg-marketing-text"
              />
            </div>
            <div className="mt-3.5 inline-flex items-center rounded-[4px] border-[1.25px] border-marketing-hair px-4 py-[9px] font-body text-[12px] font-medium leading-none text-marketing-label">
              Submit
            </div>
          </div>

          <div
            data-ba="static-saved"
            style={final ? undefined : { opacity: 0 }}
            className="mt-5 flex flex-wrap items-center gap-3 border-t border-dashed border-marketing-hair pt-4"
          >
            <span className="font-mono text-[11px] uppercase leading-none tracking-[0.08em] text-marketing-label">
              Saved
            </span>
            <b className="font-display text-[20px] font-semibold leading-[1.1] text-marketing-label">
              {scenario.typed}
            </b>
          </div>
          <p
            data-ba="note"
            style={final ? undefined : { opacity: 0 }}
            className="mt-2.5 font-body text-[14px] leading-[1.5] text-marketing-text"
          >
            {scenario.staticNote}
          </p>
        </div>

        <div className="relative rounded-[22px] border-[1.25px] border-marketing-blue-200 bg-marketing-surface p-6 min-[900px]:p-[26px]">
          <PanelLabel highlighted>ConvoForm</PanelLabel>

          <div className="mt-4 flex min-h-[196px] flex-col justify-center gap-[9px]">
            {scenario.messages.map((message, index) => (
              <Message
                key={`${message.kind}-${index}`}
                message={message}
                final={final}
                index={index}
              />
            ))}
          </div>

          <div
            data-ba="convo-saved"
            style={
              final ? undefined : { opacity: 0, transform: "translateY(6px)" }
            }
            className="mt-4 flex flex-wrap items-center gap-3 border-t border-dashed border-marketing-hair pt-4"
          >
            <span className="font-mono text-[11px] uppercase leading-none tracking-[0.08em] text-marketing-label">
              Saved
            </span>
            <b className="font-display text-[20px] font-semibold leading-[1.1] text-marketing-blue-600">
              {scenario.saved}
            </b>
            <SavedCheck final={final} />
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-[18px] border-[1.25px] border-marketing-hair bg-marketing-surface/70">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-marketing-hair-soft px-[18px] py-[13px] font-mono text-[11px] uppercase leading-none tracking-[0.08em] text-marketing-text">
          <span>{valuesLabel}</span>
          <span className="rounded-full border border-dashed border-marketing-hair px-2 py-1 text-[11px] text-marketing-label">
            Illustrative data
          </span>
        </div>

        <div
          className={cn(
            "grid grid-cols-2",
            columns === 6
              ? "min-[900px]:grid-cols-6"
              : "min-[900px]:grid-cols-5",
          )}
        >
          {scenario.values.map((item, index) => {
            const lastOdd =
              scenario.values.length % 2 === 1 &&
              index === scenario.values.length - 1;

            return (
              <div
                key={item.key}
                data-ba="cell"
                data-index={index}
                style={
                  final
                    ? undefined
                    : { opacity: 0, transform: "translateY(5px)" }
                }
                className={cn(
                  "relative px-[18px] py-3.5",
                  index >= 2 && "border-t border-marketing-hair-soft",
                  index % 2 === 1 && "border-l border-marketing-hair-soft",
                  lastOdd && "col-span-2 min-[900px]:col-span-1",
                  "min-[900px]:border-l min-[900px]:border-t-0 min-[900px]:border-marketing-hair-soft min-[900px]:first:border-l-0",
                )}
              >
                {item.highlighted ? (
                  <span
                    data-ba="cell-bg"
                    aria-hidden="true"
                    style={{ opacity: final ? 0.5 : 0 }}
                    className="absolute inset-0 bg-marketing-blue-50"
                  />
                ) : null}
                <div className="relative">
                  <div
                    className={cn(
                      "font-mono text-[11px] uppercase leading-none tracking-[0.08em]",
                      item.highlighted
                        ? "text-marketing-blue-600"
                        : "text-marketing-label",
                    )}
                  >
                    {item.key}
                  </div>
                  <div
                    className={cn(
                      "mt-2 font-body text-[15px] font-medium leading-tight",
                      item.highlighted
                        ? "text-marketing-blue-600"
                        : "text-marketing-ink",
                    )}
                  >
                    {item.value}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function draw(element: SVGElement, amount: number) {
  element.style.strokeDasharray = "1";
  element.style.strokeDashoffset = String(1 - clamp(amount));
  element.style.opacity = amount <= 0 ? "0" : "1";
}

function sceneAriaLabel(scenario: BeforeAfterScenario) {
  return `Before and after: a static form saves “${scenario.typed}” exactly as typed, while ConvoForm asks a follow-up question and records “${scenario.saved}”.`;
}

export function BeforeAfterScene({
  scenario,
  active,
  columns,
  valuesLabel,
  ariaLabel,
}: {
  scenario: BeforeAfterScenario;
  active: boolean;
  columns?: 5 | 6;
  valuesLabel?: string;
  ariaLabel?: string;
}) {
  const animatedRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<PlayOnceStageHandle | null>(null);
  const [animate, setAnimate] = useState(false);
  const [status, setStatus] = useState<StageStatus>("paused");

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      const isStatic =
        new URLSearchParams(window.location.search).get("static") === "1";
      const shouldAnimate = !motionQuery.matches && !isStatic;
      setAnimate(shouldAnimate);
      if (!shouldAnimate) setStatus("paused");
    };

    update();
    motionQuery.addEventListener("change", update);
    return () => motionQuery.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!active || !animate) return;

    const root = animatedRef.current;
    if (!root) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) return;

    const typed = root.querySelector<HTMLElement>('[data-ba="typed"]');
    const caret = root.querySelector<HTMLElement>('[data-ba="caret"]');
    const staticSaved = root.querySelector<HTMLElement>(
      '[data-ba="static-saved"]',
    );
    const note = root.querySelector<HTMLElement>('[data-ba="note"]');
    const convoSaved = root.querySelector<HTMLElement>(
      '[data-ba="convo-saved"]',
    );
    const ring = root.querySelector<SVGElement>('[data-ba="ring"]');
    const tick = root.querySelector<SVGElement>('[data-ba="tick"]');
    const highlight = root.querySelector<HTMLElement>('[data-ba="cell-bg"]');

    const messages = Array.from(
      root.querySelectorAll<HTMLElement>('[data-ba="message"]'),
    ).map((element) => ({
      element,
      text: element.querySelector<HTMLElement>('[data-ba="message-text"]'),
      vague:
        element.querySelector<HTMLElement>('[data-ba="message-text"]')?.dataset
          .vague === "true",
    }));
    const cells = Array.from(
      root.querySelectorAll<HTMLElement>('[data-ba="cell"]'),
    );

    const render = (time: number) => {
      const typedCount = Math.round(
        scenario.typed.length * progress(0.15, 0.5, time),
      );
      if (typed) typed.textContent = scenario.typed.slice(0, typedCount);
      if (caret) {
        caret.style.opacity =
          time < 0.6 ? (Math.floor(time * 3) % 2 ? "0.2" : "1") : "0";
      }

      if (staticSaved) {
        staticSaved.style.opacity = String(easeOut(progress(0.7, 1, time)));
      }
      if (note)
        note.style.opacity = String(easeOut(progress(0.85, 1.15, time)));

      for (const [index, message] of messages.entries()) {
        const text = scenario.messages[index];
        if (!text) continue;

        const at = MESSAGE_TIMES[index] ?? PLAY_SECONDS;
        const shown = easeOut(progress(at, at + 0.3, time));
        message.element.style.opacity = String(shown);
        message.element.style.transform = `translateY(${((1 - shown) * 8).toFixed(1)}px)`;

        if (message.text) {
          if (text.kind === "user") {
            const typedAmount = progress(
              at + 0.05,
              at + 0.05 + Math.min(0.5, 0.1 + text.text.length * 0.04),
              time,
            );
            message.text.textContent = text.text.slice(
              0,
              Math.round(text.text.length * typedAmount),
            );
          } else {
            message.text.textContent = text.text;
          }

          if (message.vague) {
            message.text.style.backgroundSize = `${(easeInOut(progress(1.45, 1.8, time)) * 100).toFixed(1)}% 1.25px`;
          }
        }
      }

      if (convoSaved) {
        const shown = easeOut(progress(3.2, 3.5, time));
        convoSaved.style.opacity = String(shown);
        convoSaved.style.transform = `translateY(${((1 - shown) * 6).toFixed(1)}px)`;
      }
      if (ring) draw(ring, easeInOut(progress(3.25, 3.75, time)));
      if (tick) draw(tick, easeInOut(progress(3.6, 3.95, time)));

      for (const [index, cell] of cells.entries()) {
        const at = 3.9 + index * 0.1;
        const shown = easeOut(progress(at, at + 0.35, time));
        cell.style.opacity = String(shown);
        cell.style.transform = `translateY(${((1 - shown) * 5).toFixed(1)}px)`;
      }

      if (highlight) {
        const amount =
          0.9 * Math.sin(progress(4.3, 5.6, time) * Math.PI) +
          (time > 5.6 ? 0.5 : 0);
        highlight.style.opacity = amount.toFixed(3);
      }
    };

    render(0);

    let frame = 0;
    let last = 0;
    let clock = 0;
    let visible = false;
    let userPaused = false;
    let finished = false;

    setStatus("paused");

    const stop = (markPaused = true) => {
      if (frame !== 0) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
      if (markPaused && !finished) setStatus("paused");
    };

    const finish = () => {
      finished = true;
      if (frame !== 0) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
      clock = PLAY_SECONDS;
      render(PLAY_SECONDS);
      setStatus("done");
    };

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      const delta = Math.min(0.1, (now - last) / 1000);
      last = now;
      clock = Math.min(PLAY_SECONDS, clock + delta);
      render(clock);
      if (clock >= PLAY_SECONDS) finish();
    };

    const start = () => {
      if (
        frame !== 0 ||
        finished ||
        !visible ||
        document.hidden ||
        userPaused ||
        motionQuery.matches
      ) {
        return;
      }
      last = performance.now();
      frame = requestAnimationFrame(loop);
      setStatus("playing");
    };

    const pause = () => {
      userPaused = true;
      stop();
    };

    const play = () => {
      userPaused = false;
      start();
    };

    const replay = () => {
      userPaused = false;
      finished = false;
      stop(false);
      clock = 0;
      render(0);
      setStatus("paused");
      start();
    };

    const handle: PlayOnceStageHandle = { pause, play, replay };
    handleRef.current = handle;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visible = entry.isIntersecting;
          if (visible) start();
          else stop();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(root);

    const handleVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    const handleMotion = () => {
      if (motionQuery.matches) stop();
      else start();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    motionQuery.addEventListener("change", handleMotion);

    return () => {
      stop(false);
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      motionQuery.removeEventListener("change", handleMotion);
      if (handleRef.current === handle) handleRef.current = null;
    };
  }, [active, animate, scenario]);

  return (
    <div>
      <div
        role="img"
        aria-label={ariaLabel ?? sceneAriaLabel(scenario)}
        className={cn("grid", styles.stage)}
      >
        <div
          ref={animatedRef}
          aria-hidden="true"
          className={cn("col-start-1 row-start-1", styles.animated)}
        >
          <SceneMarkup
            scenario={scenario}
            final={false}
            columns={columns}
            valuesLabel={valuesLabel}
          />
        </div>
        <div
          aria-hidden="true"
          className={cn(
            "col-start-1 row-start-1 invisible",
            styles.staticFinal,
          )}
        >
          <SceneMarkup
            scenario={scenario}
            final
            columns={columns}
            valuesLabel={valuesLabel}
          />
        </div>
      </div>
      <div className="mt-3 flex min-h-11 items-center justify-between gap-3">
        <p className="font-mono text-[11px] leading-[1.4] tracking-[0.04em] text-marketing-label min-[900px]:text-xs">
          Illustrative example
        </p>
        <div className="flex size-8 items-center justify-center">
          {animate && active ? (
            <StageControl
              status={status}
              onPause={() => handleRef.current?.pause()}
              onPlay={() => handleRef.current?.play()}
              onReplay={() => handleRef.current?.replay()}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
