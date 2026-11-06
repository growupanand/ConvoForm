"use client";

import type { RefObject } from "react";

import {
  type Act,
  Stage,
  type StageHandle,
  type StageStatus,
} from "@/components/common/stageshow";

import {
  HERO_COMPACT,
  HERO_INITIAL,
  HERO_POSTER,
  HERO_WIDE,
  HeroSceneBody,
  type HeroSceneState,
} from "./heroSceneBody";
import { HERO_MESSAGES } from "./heroStory";

// ConvoForm hero, built with the Stageshow kit.
// Beats: (1) a study-abroad enquiry form with a full name and intake already
// filled; Submit is pressed and Budget complains "Required". (2) The form
// empties: its pieces break loose and drift. (3) They re-form: the card becomes
// a conversation, the fields become the record a counsellor sees, Submit
// becomes Send. (4) The chat asks country and budget, a vague budget gets one
// clarifying follow-up, and each answer lands in its row. Payoff: the clean
// record. The script ends on HERO_POSTER and plays once; the Stage's replay
// control starts it again from HERO_INITIAL.

const HERO_CURSOR = {
  at: {
    wide: { x: 820, y: 430 },
    compact: { x: 300, y: 548 },
  },
  idle: 900,
};

async function say(a: Act<HeroSceneState>, i: number, typingMs: number) {
  a.put({ typing: true, msgs: i });
  await a.wait(typingMs);
  a.put({ typing: false, msgs: i + 1 });
}

async function answer(a: Act<HeroSceneState>, i: number, interval: number) {
  const message = HERO_MESSAGES[i];
  if (!message) return;
  await a.type("draft", message.text, { interval });
  await a.wait(260);
  // Clear the field in the same update that adds the bubble: the words lift out.
  await a.set({ draft: "", msgs: i + 1 });
}

async function script(a: Act<HeroSceneState>) {
  a.mark("form");
  await a.wait(700);
  await a.click({ at: "submit", x: 0.84, y: 0.78 });
  a.mark("error");
  a.put({ error: true });
  await a.wait(850);
  a.mark("shatter");
  a.put({ phase: "shatter", error: false });
  // The hand that pressed Submit drifts back to where it rested.
  void a.move(a.layout === "wide" ? { x: 820, y: 430 } : { x: 300, y: 548 }, {
    duration: 900,
  });
  await a.wait(850);
  a.mark("reform");
  a.put({ phase: "chat" });
  await a.wait(1050);
  a.mark("chat");
  await say(a, 0, 600);
  await a.wait(650);
  await answer(a, 1, 60);
  await a.wait(350);
  a.put({ country: true });
  await a.wait(250);
  await say(a, 2, 550);
  await a.wait(500);
  await answer(a, 3, 50);
  await a.wait(300);
  a.mark("followup");
  await say(a, 4, 700);
  await a.wait(1100);
  await answer(a, 5, 34);
  await a.wait(350);
  a.mark("payoff");
  a.put({ budget: true });
  await a.wait(2300);
}

export function HeroScene({
  onReady,
  onStatusChange,
  handleRef,
}: {
  onReady?: () => void;
  onStatusChange?: (status: StageStatus) => void;
  handleRef?: RefObject<StageHandle | null>;
}) {
  return (
    <Stage
      width={HERO_WIDE.W}
      height={HERO_WIDE.H}
      compact={{
        below: 700,
        width: HERO_COMPACT.W,
        height: HERO_COMPACT.H,
      }}
      initial={HERO_INITIAL}
      poster={HERO_POSTER}
      script={script}
      play="once"
      cursor={HERO_CURSOR}
      className="cf cf-hero"
      onReady={onReady}
      onStatusChange={onStatusChange}
      handleRef={handleRef}
    >
      {(s, _rect, layout) => <HeroSceneBody state={s} layout={layout} />}
    </Stage>
  );
}
