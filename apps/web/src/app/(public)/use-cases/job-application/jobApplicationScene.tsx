"use client";

import type { RefObject } from "react";

import {
  type Act,
  Stage,
  type StageHandle,
  type StageStatus,
} from "@/components/common/stageshow";

import {
  JOB_INITIAL,
  JOB_POSTER,
  JobApplicationSceneBody,
  type JobApplicationState,
} from "./jobApplicationSceneBody";
import { JOB_MESSAGES, JOB_PROFILE } from "./jobApplicationStory";

// ConvoForm job-application hero, built with the Stageshow kit.
// Rahul Mehta answers one question at a time. The AI asks for current and
// expected CTC; "6" is too vague, so one follow-up pins it down. The
// conversation then settles into the candidate profile a recruiter reviews.
// The script ends on JOB_POSTER and plays once; the Stage's replay control
// starts it again from JOB_INITIAL.

async function say(a: Act<JobApplicationState>, i: number, typingMs: number) {
  a.put({ typing: true, msgs: i });
  await a.wait(typingMs);
  a.put({ typing: false, msgs: i + 1 });
}

async function answer(
  a: Act<JobApplicationState>,
  i: number,
  interval: number,
) {
  const message = JOB_MESSAGES[i];
  if (!message) return;
  await a.type("draft", message.text, { interval });
  await a.wait(260);
  // Clear the field in the same update that adds the bubble: the words lift out.
  await a.set({ draft: "", msgs: i + 1 });
}

async function script(a: Act<JobApplicationState>) {
  a.mark("chat");
  await a.wait(900);
  await answer(a, 1, 120);
  await a.wait(600);
  await say(a, 2, 800);
  await a.wait(1400);
  await answer(a, 3, 40);
  await a.wait(500);
  a.mark("payoff");
  await a.set({ phase: "profile" });
  for (let i = 1; i <= JOB_PROFILE.length; i++) {
    a.put({ saved: i });
    await a.wait(110);
  }
  await a.wait(2200);
}

export function JobApplicationScene({
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
      width={358}
      height={560}
      initial={JOB_INITIAL}
      poster={JOB_POSTER}
      script={script}
      play="once"
      className="job"
      onReady={onReady}
      onStatusChange={onStatusChange}
      handleRef={handleRef}
    >
      {(s) => <JobApplicationSceneBody state={s} />}
    </Stage>
  );
}
