// One hero loop, about 16.3s. Every change has a cause on screen: the press
// causes the error, the error causes the break, each reply causes its saved
// value. It ends in HERO_INITIAL with the cursor back at rest.

import type { Act } from "@/components/common/stageshow/act";

import {
  HERO_INITIAL,
  HERO_MESSAGES,
  HERO_REST,
  type HeroState,
} from "./heroScene";

async function say(a: Act<HeroState>, i: number, typingMs: number) {
  a.put({ typing: true, msgs: i });
  await a.wait(typingMs);
  a.put({ typing: false, msgs: i + 1 });
}

async function answer(a: Act<HeroState>, i: number, interval: number) {
  await a.type("draft", HERO_MESSAGES[i]?.text ?? "", { interval });
  await a.wait(260);
  // Clear the field in the same update that adds the bubble: the words lift out of it
  await a.set({ draft: "", msgs: i + 1 });
}

export async function heroScript(a: Act<HeroState>) {
  a.mark("form");
  await a.wait(700);
  // Aim at the button's lower right so the hand never covers its label
  await a.click({ at: "submit", x: 0.84, y: 0.78 });
  a.mark("error");
  a.put({ error: true });
  await a.wait(850);
  a.mark("shatter");
  a.put({ phase: "shatter", error: false });
  // The hand that pressed Submit drifts back to where it rests
  void a.move(HERO_REST[a.layout], { duration: 900 });
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
  // Reset: the finished enquiry leaves as one, then a fresh form rises in
  a.mark("reset");
  a.put({ exit: true });
  await a.wait(520);
  await a.snap({ ...HERO_INITIAL, formIn: false });
  a.put({ formIn: true });
  await a.wait(650);
}
