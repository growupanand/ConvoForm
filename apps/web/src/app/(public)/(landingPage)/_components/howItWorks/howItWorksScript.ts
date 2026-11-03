// One "How it works" loop, about 17.7s. The rail advances only on events:
// pressing Share lights 02, the first answer landing lights 03. It ends in
// HOW_INITIAL with the cursor back at rest.

import type { Act } from "@/components/common/stageshow/act";

import {
  HOW_CHAT,
  HOW_INITIAL,
  HOW_PROMPT,
  HOW_REST,
  type HowState,
} from "./howItWorksScene";

const FIELD_COUNT = 4;

async function ask(a: Act<HowState>, i: number, dots: number) {
  a.put({ typing: true, msgs: i, asking: HOW_CHAT[i]?.ask ?? -1 });
  await a.wait(dots);
  a.put({ typing: false, msgs: i + 1 });
}

async function reply(a: Act<HowState>, i: number, interval: number) {
  await a.type("draft", HOW_CHAT[i]?.text ?? "", { interval });
  await a.wait(160);
  // Clear the composer in the same update that adds the bubble: the words lift out of it
  await a.set({ draft: "", msgs: i + 1 });
  const save = HOW_CHAT[i]?.save;
  if (save !== undefined) {
    await a.wait(260);
    // The answer lands in its row; the first landing is what lights 03
    a.put((s) => ({ saved: [...s.saved, save], asking: -1, step: 3 }));
  }
}

export async function howItWorksScript(a: Act<HowState>) {
  a.mark("design");
  await a.wait(300);
  await a.type("prompt", HOW_PROMPT, { interval: 18 });
  await a.wait(200);
  await a.click({ at: "generate", x: 0.5, y: 0.55 });
  a.put({ busy: true });
  await a.wait(750);
  a.mark("drafted");
  a.put({ busy: false });
  for (let i = 1; i <= FIELD_COUNT; i++) {
    a.put({ fields: i });
    await a.wait(130);
  }
  await a.wait(220);
  a.put({ linkReady: true });
  await a.wait(450);
  await a.click({ at: "share", x: 0.5, y: 0.55 });
  // 02 lights because Share was pressed; the message forms on the phone
  a.mark("share");
  await a.set({ step: 2, sent: true });
  void a.move(HOW_REST[a.layout], { duration: 900 });
  // Measure once the message has finished rising in
  await a.wait(420);
  // The link lifts off the builder, whose copy dims, then flies into the message
  await a.set({
    fly: "held",
    flyFrom: a.rect("link"),
    flyTo: a.rect("phone-link"),
    linkSent: true,
  });
  await a.wait(120);
  a.mark("fly");
  a.put({ fly: "go" });
  await a.wait(720);
  a.put({ landed: true, fly: "off" });
  await a.wait(400);
  // The student taps the link and the chat opens over the messages
  a.put({ tap: true });
  await a.wait(240);
  a.mark("open");
  a.put({ tap: false, open: true });
  await a.wait(520);
  a.mark("chat");
  await ask(a, 0, 420);
  await a.wait(240);
  await reply(a, 1, 60);
  await a.wait(180);
  a.mark("followup");
  await ask(a, 2, 460);
  await a.wait(420);
  await reply(a, 3, 45);
  await a.wait(200);
  a.mark("fill");
  await ask(a, 4, 300);
  await a.wait(180);
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
  // Reset: the finished response leaves as one, then an empty builder rises in
  a.mark("reset");
  a.put({ exit: true });
  await a.wait(520);
  await a.snap({ ...HOW_INITIAL, in: false });
  a.put({ in: true });
  await a.wait(650);
}
