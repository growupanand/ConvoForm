const NS = "http://www.w3.org/2000/svg";
const SW = 1.25;
const MONO_FONT = "var(--font-jetbrains-mono), ui-monospace, monospace";

const C = {
  slate: "var(--marketing-slate)",
  blue: "var(--marketing-blue-600)",
  ink: "var(--marketing-ink)",
  surface: "var(--marketing-surface)",
} as const;

const MESSAGE = "Hi! What should I call you?";
const LOOP_SECONDS = 6;
const IN0 = 0;
const IN1 = 1.3;
const M0 = 1.3;
const M1 = 2.1;
const TY0 = 2.2;
const TY1 = 3.6;
const R0 = 4;
const F0 = 5.35;
const F1 = 5.95;

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));
const progress = (start: number, end: number, time: number) =>
  clamp((time - start) / (end - start));
const easeOut = (value: number) => 1 - (1 - clamp(value)) ** 3;
const easeInOut = (value: number) => {
  const amount = clamp(value);
  return amount < 0.5 ? 4 * amount ** 3 : 1 - (-2 * amount + 2) ** 3 / 2;
};
const backOut = (value: number) => {
  const amount = clamp(value);
  const c1 = 1.6;
  const c3 = c1 + 1;
  return 1 + c3 * (amount - 1) ** 3 + c1 * (amount - 1) ** 2;
};
const lerp = (from: number, to: number, amount: number) =>
  from + (to - from) * amount;

type SvgAttributes = Record<string, string | number>;

type FinalCtaScene = {
  render: (time: number, elapsed: number) => void;
};

function createEl<K extends keyof SVGElementTagNameMap>(
  parent: Element,
  tag: K,
  attributes: SvgAttributes = {},
): SVGElementTagNameMap[K] {
  const element = document.createElementNS(NS, tag);
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, String(value));
  }
  parent.appendChild(element);
  return element as SVGElementTagNameMap[K];
}

function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 16807) % 2147483647;
    return state / 2147483647;
  };
}

export function buildFinalCtaScene(svg: SVGSVGElement): FinalCtaScene {
  svg.innerHTML = "";

  const inputGroup = createEl(svg, "g");
  const labelGroup = createEl(svg, "g");
  const submitGroup = createEl(svg, "g");

  const inputRect = createEl(inputGroup, "rect", {
    fill: C.surface,
    "fill-opacity": 0.6,
    stroke: C.slate,
    "stroke-width": SW,
  });
  const labelText = createEl(labelGroup, "text", {
    "font-family": MONO_FONT,
    "font-size": 9.5,
    fill: C.slate,
    x: 0,
    y: 0,
  });
  labelText.textContent = "FULL NAME *";
  createEl(labelGroup, "line", {
    x1: 0,
    y1: 8,
    x2: 74,
    y2: 8,
    stroke: C.slate,
    "stroke-width": SW,
  });
  createEl(submitGroup, "rect", {
    x: -36,
    y: -14,
    width: 72,
    height: 28,
    rx: 4,
    fill: "none",
    stroke: C.slate,
    "stroke-width": SW,
  });
  const submitText = createEl(submitGroup, "text", {
    "font-size": 11.5,
    fill: C.slate,
    "text-anchor": "middle",
    x: 0,
    y: 4,
    "font-weight": 500,
  });
  submitText.textContent = "Submit";

  const tag = createEl(svg, "text", {
    "font-family": MONO_FONT,
    "font-size": 9.5,
    fill: C.slate,
    x: 42,
    y: 112,
    "letter-spacing": ".06em",
  });
  tag.textContent = "CONVOFORM";
  const tagDot = createEl(svg, "circle", {
    cx: 34,
    cy: 109,
    r: 2.6,
    fill: C.blue,
  });
  const tail = createEl(svg, "path", {
    d: "",
    fill: C.surface,
    stroke: C.blue,
    "stroke-width": SW,
  });
  const messageText = createEl(svg, "text", {
    "font-size": 16,
    fill: C.ink,
    x: 48,
    y: 152,
    "font-weight": 500,
  });
  const cursor = createEl(svg, "line", {
    stroke: C.blue,
    "stroke-width": 1.5,
  });
  const replyGroup = createEl(svg, "g");
  const replyRect = createEl(replyGroup, "rect", {
    rx: 18,
    fill: C.blue,
    "fill-opacity": 0.06,
    stroke: C.blue,
    "stroke-width": SW,
  });
  const replyText = createEl(replyGroup, "text", {
    "font-size": 16,
    fill: C.blue,
    "font-weight": 600,
    "text-anchor": "middle",
  });
  replyText.textContent = "Priya";
  const replyTag = createEl(svg, "text", {
    "font-family": MONO_FONT,
    "font-size": 9.5,
    fill: C.slate,
    "text-anchor": "end",
    "letter-spacing": ".06em",
  });
  replyTag.textContent = "YOU";

  messageText.textContent = MESSAGE;
  const fullWidth = messageText.getComputedTextLength();
  messageText.textContent = "";

  const replyTextWidth = replyText.getComputedTextLength() + 40;
  const bubble = { x: 30, y: 124, w: fullWidth + 38, h: 46 };
  const reply = { x: 430 - replyTextWidth, y: 196, w: replyTextWidth, h: 40 };

  replyRect.setAttribute("x", String(reply.x));
  replyRect.setAttribute("y", String(reply.y));
  replyRect.setAttribute("width", String(reply.w));
  replyRect.setAttribute("height", String(reply.h));
  replyText.setAttribute("x", String(reply.x + reply.w / 2));
  replyText.setAttribute("y", String(reply.y + 26));
  replyTag.setAttribute("x", String(reply.x + reply.w - 4));
  replyTag.setAttribute("y", String(reply.y + reply.h + 16));

  const characterX = [0];
  for (let index = 1; index <= MESSAGE.length; index += 1) {
    messageText.textContent = MESSAGE.slice(0, index);
    characterX.push(messageText.getComputedTextLength());
  }
  messageText.textContent = "";

  const random = seededRandom(13);
  const dots = Array.from({ length: 16 }, (_, index) => {
    const side = index % 4;
    const position = random();
    const startX = side % 2 === 0 ? 470 + position * 20 : 120 + position * 340;
    const startY = side % 2 === 0 ? 90 + position * 190 : 300 + position * 20;

    const perimeter = 2 * (bubble.w + bubble.h);
    let distance = random() * perimeter;
    let targetX: number;
    let targetY: number;

    if (distance < bubble.w) {
      targetX = bubble.x + distance;
      targetY = bubble.y;
    } else {
      distance -= bubble.w;
      if (distance < bubble.h) {
        targetX = bubble.x + bubble.w;
        targetY = bubble.y + distance;
      } else {
        distance -= bubble.h;
        if (distance < bubble.w) {
          targetX = bubble.x + bubble.w - distance;
          targetY = bubble.y + bubble.h;
        } else {
          targetX = bubble.x;
          targetY = bubble.y + bubble.h - (distance - bubble.w);
        }
      }
    }

    return {
      element: createEl(svg, "circle", {
        r: 1.6 + random() * 1.4,
        fill: C.blue,
      }),
      startX,
      startY,
      midX: 60 + random() * 370,
      midY: 96 + random() * 170,
      targetX,
      targetY,
      phase: random() * 6.28,
      delay: random() * 0.4,
    };
  });

  svg.appendChild(replyTag);

  const fragments = {
    input: {
      startX: 150,
      startY: 300,
      startRotation: -14,
      midX: 46,
      midY: 196,
      midRotation: -6,
      width: 190,
      height: 30,
    },
    label: {
      startX: 470,
      startY: 110,
      startRotation: 10,
      midX: 318,
      midY: 102,
      midRotation: 5,
    },
    submit: {
      startX: 480,
      startY: 280,
      startRotation: 16,
      midX: 360,
      midY: 240,
      midRotation: 7,
    },
  };

  const render = (time: number, elapsed: number) => {
    const fade = 1 - easeInOut(progress(F0, F1, time));
    const drift = easeInOut(progress(IN0, IN1, time));
    const morph = easeInOut(progress(M0, M1, time));
    const float = (phase: number, amount = 3) =>
      Math.sin(elapsed * 1.3 + phase) * amount * (1 - morph);

    {
      const fragment = fragments.input;
      const x =
        lerp(lerp(fragment.startX, fragment.midX, drift), bubble.x, morph) +
        float(0);
      const y =
        lerp(lerp(fragment.startY, fragment.midY, drift), bubble.y, morph) +
        float(1.7);
      const width = lerp(fragment.width, bubble.w, morph);
      const height = lerp(fragment.height, bubble.h, morph);
      const rotation = lerp(
        lerp(fragment.startRotation, fragment.midRotation, drift),
        0,
        morph,
      );

      inputRect.setAttribute("x", "0");
      inputRect.setAttribute("y", "0");
      inputRect.setAttribute("width", String(width));
      inputRect.setAttribute("height", String(height));
      inputRect.setAttribute("rx", String(lerp(3, 20, morph)));
      inputRect.setAttribute("stroke", morph > 0.5 ? C.blue : C.slate);
      inputRect.setAttribute(
        "stroke-opacity",
        morph > 0.5 ? String(lerp(0.4, 0.9, (morph - 0.5) * 2)) : "1",
      );
      inputGroup.setAttribute(
        "transform",
        `translate(${x.toFixed(2)},${y.toFixed(2)}) rotate(${rotation.toFixed(2)} ${width / 2} ${height / 2})`,
      );
      inputGroup.setAttribute(
        "opacity",
        (progress(IN0, IN0 + 0.6, time) * fade).toFixed(3),
      );
    }

    const absorb = (
      group: SVGGElement,
      fragment: typeof fragments.label,
      phase: number,
      centerX: number,
      centerY: number,
    ) => {
      const amount = easeInOut(progress(M0 - 0.05, M1 - 0.15, time));
      const x =
        lerp(lerp(fragment.startX, fragment.midX, drift), centerX, amount) +
        float(phase);
      const y =
        lerp(lerp(fragment.startY, fragment.midY, drift), centerY, amount) +
        float(phase + 1);
      const rotation = lerp(
        lerp(fragment.startRotation, fragment.midRotation, drift),
        0,
        amount,
      );
      const scale = 1 - 0.75 * amount;
      group.setAttribute(
        "transform",
        `translate(${x.toFixed(2)},${y.toFixed(2)}) rotate(${rotation.toFixed(2)}) scale(${scale.toFixed(3)})`,
      );
      group.setAttribute(
        "opacity",
        (
          progress(IN0 + 0.15, IN0 + 0.8, time) *
          (1 - progress(M0 + 0.2, M1 - 0.1, time)) *
          fade
        ).toFixed(3),
      );
    };

    absorb(labelGroup, fragments.label, 2.3, bubble.x + 40, bubble.y + 18);
    absorb(
      submitGroup,
      fragments.submit,
      4.1,
      bubble.x + bubble.w - 30,
      bubble.y + bubble.h / 2,
    );

    const conversationOn = easeOut(progress(M1 - 0.2, M1 + 0.3, time)) * fade;
    tag.setAttribute("opacity", String(conversationOn));
    tagDot.setAttribute("opacity", String(conversationOn));
    tail.setAttribute(
      "opacity",
      (easeOut(progress(M1 - 0.1, M1 + 0.25, time)) * 0.9 * fade).toFixed(3),
    );
    tail.setAttribute(
      "d",
      `M${bubble.x + 26} ${bubble.y + bubble.h - 0.6} L${bubble.x + 6} ${bubble.y + bubble.h + 9} L${bubble.x + 13} ${bubble.y + bubble.h - 3}`,
    );

    const typed = Math.round(MESSAGE.length * progress(TY0, TY1, time));
    messageText.textContent = MESSAGE.slice(0, typed);
    messageText.setAttribute("opacity", String(fade));
    messageText.setAttribute("x", String(bubble.x + 19));
    messageText.setAttribute("y", String(bubble.y + 28.5));

    const cursorX = bubble.x + 19 + (characterX[typed] ?? 0) + 2;
    cursor.setAttribute("x1", String(cursorX));
    cursor.setAttribute("x2", String(cursorX));
    cursor.setAttribute("y1", String(bubble.y + 13));
    cursor.setAttribute("y2", String(bubble.y + 31));

    const typing = time >= TY0 && time < TY1;
    const blink = typing ? 1 : Math.floor(elapsed / 0.5) % 2 === 0 ? 1 : 0;
    const cursorOn = time >= TY0 - 0.3 && time < R0 + 0.1 ? blink : 0;
    cursor.setAttribute("opacity", (cursorOn * fade).toFixed(2));

    const replyProgress = progress(R0, R0 + 0.35, time);
    const replyScale = 0.85 + 0.15 * backOut(replyProgress);
    replyGroup.setAttribute(
      "opacity",
      (clamp(replyProgress * 2) * fade).toFixed(3),
    );
    replyGroup.setAttribute(
      "transform",
      `translate(${reply.x + reply.w} ${reply.y + reply.h}) scale(${replyScale.toFixed(3)}) translate(${-(reply.x + reply.w)} ${-(reply.y + reply.h)})`,
    );
    replyTag.setAttribute(
      "opacity",
      (easeOut(progress(R0 + 0.3, R0 + 0.7, time)) * fade).toFixed(3),
    );

    for (const dot of dots) {
      const arrive = easeInOut(
        progress(IN0 + dot.delay * 0.5, IN1 + dot.delay * 0.3, time),
      );
      const merge = easeInOut(progress(M0 + dot.delay * 0.3, M1 + 0.1, time));
      const x =
        lerp(lerp(dot.startX, dot.midX, arrive), dot.targetX, merge) +
        Math.sin(elapsed * 1.1 + dot.phase) * 4 * (1 - merge);
      const y =
        lerp(lerp(dot.startY, dot.midY, arrive), dot.targetY, merge) +
        Math.cos(elapsed * 0.9 + dot.phase) * 4 * (1 - merge);
      dot.element.setAttribute("cx", x.toFixed(2));
      dot.element.setAttribute("cy", y.toFixed(2));
      dot.element.setAttribute(
        "opacity",
        (
          lerp(0.55, 0, progress(M1 - 0.15, M1 + 0.35, time)) *
          progress(0, 0.5, time) *
          fade
        ).toFixed(3),
      );
    }
  };

  return { render };
}

export { LOOP_SECONDS };
