"use client";

import { type Act, Stage } from "@/components/common/stageshow";

import {
  HOW_INITIAL,
  HOW_POSTER,
  HowItWorksSceneBody,
  type HowItWorksState,
} from "./howItWorksSceneBody";
import { HOW_CHAT, HOW_FIELDS, HOW_PROMPT } from "./howItWorksStory";

// ConvoForm "How it works", built the Stageshow way. One story in three linked
// steps, each one the cause of the next:
//  01 Design: a one-line description is typed, Draft is pressed, and the four
//     fields drop out of the prompt. The drafted form gets its link.
//  02 Share: Share is pressed. The link leaves the builder and lands in a
//     message on a student's phone; the student taps it and the ConvoForm chat
//     opens over the messages. The chat asks each drafted field in turn (the
//     field it is asking lights in the builder), and one vague answer gets a
//     follow-up.
//  03 Review: every answer lands in its row of the new response. The rail
//     advances only when these things happen: 02 lights as the link goes out,
//     03 as the first answer lands.
// Payoff: the clean response, 4/4. Reset: the scene leaves as one and a fresh,
// empty builder rises in.

async function ask(a: Act<HowItWorksState>, i: number, dots: number) {
  a.put({ typing: true, msgs: i, asking: HOW_CHAT[i]?.ask ?? -1 });
  await a.wait(dots);
  a.put({ typing: false, msgs: i + 1 });
}

async function reply(a: Act<HowItWorksState>, i: number, interval: number) {
  const message = HOW_CHAT[i];
  if (!message) return;
  await a.type("draft", message.text, { interval });
  await a.wait(160);
  // The words lift out of the composer in the same update that clears it
  await a.set({ draft: "", msgs: i + 1 });
  const save = message.save;
  if (save !== undefined) {
    await a.wait(260);
    // The answer lands in its row; the first landing is what lights 03
    a.put((s) => ({ saved: [...s.saved, save], asking: -1, step: 3 }));
  }
}

async function script(a: Act<HowItWorksState>) {
  const wide = a.layout === "wide";
  a.mark("design");
  await a.wait(300);
  await a.type("prompt", HOW_PROMPT, { interval: 18 });
  await a.wait(200);
  await a.click({ at: "draft", x: 0.5, y: 0.55 });
  a.put({ busy: true });
  await a.wait(750);
  a.mark("drafted");
  a.put({ busy: false });
  for (let i = 1; i <= HOW_FIELDS.length; i++) {
    a.put({ fields: i });
    await a.wait(130);
  }
  await a.wait(220);
  a.put({ linkReady: true });
  await a.wait(450);
  await a.click({ at: "share", x: 0.5, y: 0.55 });
  // 02 lights because Share was pressed; the message forms on the phone
  a.mark("share");
  a.put({ step: 2, sent: true });
  void a.move(wide ? { x: 330, y: 470 } : { x: 330, y: 380 }, {
    duration: 900,
  });
  await a.wait(320);
  a.put({ fly: true });
  await a.wait(720);
  a.put({ landed: true, fly: false });
  await a.wait(520);
  // The student taps the link and the chat opens over the messages
  await a.click({ at: "phone-link", x: 0.5, y: 0.5 });
  // The hand drifts back to where it rested, clear of the phone.
  void a.move(wide ? { x: 330, y: 470 } : { x: 330, y: 380 }, {
    duration: 900,
  });
  a.put({ tap: true });
  await a.wait(240);
  a.mark("open");
  a.put({ tap: false, open: true });
  await a.wait(620);
  a.mark("chat");
  await ask(a, 0, 420);
  await a.wait(320);
  await reply(a, 1, 60);
  await a.wait(220);
  a.mark("followup");
  await ask(a, 2, 460);
  await a.wait(520);
  await reply(a, 3, 45);
  await a.wait(240);
  await ask(a, 4, 300);
  await a.wait(220);
  await reply(a, 5, 30);
  await a.wait(140);
  await ask(a, 6, 280);
  await a.wait(140);
  await reply(a, 7, 30);
  await a.wait(140);
  await ask(a, 8, 280);
  await a.wait(140);
  await reply(a, 9, 34);
  await a.wait(140);
  a.mark("payoff");
  await a.wait(1800);
  a.put({ exit: true });
  await a.wait(520);
  await a.snap({ ...HOW_INITIAL, in: false });
  a.put({ in: true });
  await a.wait(650);
}

export function HowItWorksScene({ onReady }: { onReady?: () => void }) {
  return (
    <Stage
      width={1040}
      height={500}
      compact={{ below: 700, width: 360, height: 840 }}
      initial={HOW_INITIAL}
      poster={HOW_POSTER}
      script={script}
      play="loop"
      cursor={{
        at: {
          wide: { x: 330, y: 470 },
          compact: { x: 330, y: 380 },
        },
        idle: 900,
      }}
      className="hw"
      onReady={onReady}
    >
      {(s, rect, layout) => (
        <HowItWorksSceneBody state={s} layout={layout} rect={rect} />
      )}
    </Stage>
  );
}
