"use client";

import { cn } from "@/lib/utils";
import { useRef, useState } from "react";

import {
  BEFORE_AFTER_SCENARIOS,
  BEFORE_AFTER_TABS,
  type BeforeAfterId,
  type BeforeAfterMessage,
} from "./scenarios";

const tabClass =
  "flex-1 rounded-full border-[1.25px] px-4 py-[9px] font-mono text-[11px] uppercase leading-none tracking-[0.04em] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketing-blue-600 min-[900px]:flex-none";

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
        highlighted ? "text-marketing-blue-600" : "text-marketing-slate",
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

function Message({ message }: { message: BeforeAfterMessage }) {
  if (message.kind === "followUp") {
    return (
      <div className="w-fit max-w-[85%] self-start rounded-2xl rounded-bl-[5px] border-[1.25px] border-marketing-blue-300 bg-marketing-blue-50 px-3.5 py-2.5 font-body text-[14.5px] leading-[1.35] text-marketing-blue-700">
        <span className="mb-1.5 block font-mono text-[9.5px] uppercase leading-none tracking-[0.08em] text-marketing-blue-600">
          ↳ Follow-up
        </span>
        {message.text}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-fit max-w-[82%] rounded-2xl border-[1.25px] px-3.5 py-2.5 font-body text-[14.5px] leading-[1.35]",
        message.kind === "user"
          ? "self-end rounded-br-[5px] border-marketing-ink bg-white font-medium text-marketing-ink"
          : "self-start rounded-bl-[5px] border-marketing-hair bg-white text-marketing-ink",
      )}
    >
      {message.vague ? (
        <span className="underline decoration-marketing-blue-600 decoration-[1.25px] underline-offset-[3px]">
          {message.text}
        </span>
      ) : (
        message.text
      )}
    </div>
  );
}

function SavedCheck() {
  return (
    <svg
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
      className="size-[22px] shrink-0"
    >
      <circle
        cx="11"
        cy="11"
        r="10"
        className="stroke-marketing-blue-200"
        strokeWidth="1.25"
      />
      <path
        d="M6 11.5 9.2 14.7 16 7.8"
        className="stroke-marketing-blue-600"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BeforeAfterSection() {
  const [activeId, setActiveId] = useState<BeforeAfterId>("study");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const scenario = BEFORE_AFTER_SCENARIOS[activeId];

  const activate = (index: number) => {
    const tab = BEFORE_AFTER_TABS[index];
    if (!tab) return;
    setActiveId(tab.id);
    tabRefs.current[index]?.focus();
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let next = index;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        next = (index + 1) % BEFORE_AFTER_TABS.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        next =
          (index - 1 + BEFORE_AFTER_TABS.length) % BEFORE_AFTER_TABS.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = BEFORE_AFTER_TABS.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    activate(next);
  };

  return (
    <section
      id="why-a-conversation"
      aria-labelledby="why-a-conversation-heading"
      className="relative isolate min-w-0 overflow-x-clip px-4 pb-[76px] pt-10 min-[900px]:pb-[112px]"
    >
      <div className="mx-auto min-w-0 max-w-[1160px]">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase leading-none tracking-[0.08em] text-marketing-blue-600">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-marketing-blue-600"
            />
            Why a conversation
          </span>
          <h2
            id="why-a-conversation-heading"
            className="mx-auto mt-3 max-w-[760px] font-display text-[clamp(32px,4.2vw,50px)] font-bold leading-[1.06] tracking-[-0.03em] text-marketing-ink"
          >
            A vague answer{" "}
            <span className="text-marketing-blue-600">isn't an answer</span>
          </h2>
          <p className="mx-auto mt-4 max-w-[620px] font-body text-[17px] leading-[1.6] text-marketing-muted">
            A static form saves whatever was typed. ConvoForm notices when a
            reply is unclear and asks a follow-up.
          </p>

          <div
            role="tablist"
            aria-label="Before and after examples"
            className="mt-8 inline-flex w-full max-w-[340px] gap-1 rounded-full border-[1.25px] border-marketing-hair bg-white/60 p-1 min-[900px]:w-auto min-[900px]:max-w-none"
          >
            {BEFORE_AFTER_TABS.map((tab, index) => {
              const selected = tab.id === activeId;
              return (
                <button
                  key={tab.id}
                  ref={(element) => {
                    tabRefs.current[index] = element;
                  }}
                  type="button"
                  role="tab"
                  id={`before-after-tab-${tab.id}`}
                  aria-selected={selected}
                  aria-controls={`before-after-panel-${tab.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => activate(index)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  className={cn(
                    tabClass,
                    selected
                      ? "border-marketing-blue-300 bg-white text-marketing-blue-600"
                      : "border-transparent text-marketing-text hover:text-marketing-ink",
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div
          key={activeId}
          role="tabpanel"
          id={`before-after-panel-${activeId}`}
          aria-labelledby={`before-after-tab-${activeId}`}
          className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:duration-300"
        >
          <div className="mt-7 grid grid-cols-1 gap-6 min-[900px]:grid-cols-[1fr_1.25fr]">
            <div className="relative rounded-[22px] border-[1.25px] border-dashed border-marketing-hair bg-white/60 p-6 min-[900px]:p-[26px]">
              <PanelLabel>Static form</PanelLabel>

              <div className="mt-5">
                <div className="font-body text-[13px] leading-none text-marketing-text">
                  {scenario.fieldLabel}
                </div>
                <div className="mt-2 flex h-[42px] items-center rounded-[4px] border-[1.25px] border-marketing-hair bg-white px-3 font-body text-[15px] text-marketing-text">
                  {scenario.typed}
                </div>
                <div className="mt-3.5 inline-flex items-center rounded-[4px] border-[1.25px] border-marketing-hair px-4 py-[9px] font-body text-[12px] font-medium leading-none text-marketing-slate">
                  Submit
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-dashed border-marketing-hair pt-4">
                <span className="font-mono text-[10.5px] uppercase leading-none tracking-[0.08em] text-marketing-slate">
                  Saved
                </span>
                <b className="font-display text-[20px] font-semibold leading-[1.1] text-marketing-slate">
                  {scenario.typed}
                </b>
              </div>
              <p className="mt-2.5 font-body text-[14px] leading-[1.5] text-marketing-text">
                {scenario.staticNote}
              </p>
            </div>

            <div className="relative rounded-[22px] border-[1.25px] border-marketing-blue-200 bg-white p-6 min-[900px]:p-[26px]">
              <PanelLabel highlighted>ConvoForm</PanelLabel>

              <div className="mt-4 flex min-h-[196px] flex-col justify-center gap-[9px]">
                {scenario.messages.map((message, index) => (
                  <Message key={`${message.kind}-${index}`} message={message} />
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-dashed border-marketing-hair pt-4">
                <span className="font-mono text-[10.5px] uppercase leading-none tracking-[0.08em] text-marketing-slate">
                  Saved
                </span>
                <b className="font-display text-[20px] font-semibold leading-[1.1] text-marketing-blue-600">
                  {scenario.saved}
                </b>
                <SavedCheck />
              </div>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-[18px] border-[1.25px] border-marketing-hair bg-white/70">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-marketing-hair-soft px-[18px] py-[13px] font-mono text-[11px] uppercase leading-none tracking-[0.08em] text-marketing-text">
              <span>What your team sees</span>
              <span className="rounded-full border border-dashed border-marketing-hair px-2 py-1 text-[10px] text-marketing-slate">
                Illustrative data
              </span>
            </div>

            <div className="grid grid-cols-2 min-[900px]:grid-cols-5">
              {scenario.values.map((item, index) => (
                <div
                  key={item.key}
                  className={cn(
                    "px-[18px] py-3.5",
                    index >= 2 && "border-t border-marketing-hair-soft",
                    "min-[900px]:border-l min-[900px]:border-t-0 min-[900px]:border-marketing-hair-soft min-[900px]:first:border-l-0",
                    item.highlighted && "bg-marketing-blue-50/60",
                  )}
                >
                  <div
                    className={cn(
                      "font-mono text-[10px] uppercase leading-none tracking-[0.08em]",
                      item.highlighted
                        ? "text-marketing-blue-600"
                        : "text-marketing-slate",
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
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
