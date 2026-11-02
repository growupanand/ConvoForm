"use client";

import { cn } from "@/lib/utils";
import { Fragment, useEffect, useRef, useState } from "react";

import {
  HERO_FORM_HOLD_SECONDS,
  HERO_LOOP_SECONDS,
  HERO_SCENARIOS,
} from "./heroScenarios";

// One loop per scenario. Timings follow the shared 8s hero loop token.
const LOOP = HERO_LOOP_SECONDS;
const TIMELINE = {
  assembleStart: 0,
  assembleEnd: HERO_FORM_HOLD_SECONDS,
  submit: 1.25,
  requiredStart: 1.35,
  requiredEnd: 2,
  breakStart: 2.1,
  breakEnd: 2.95,
  returnStart: 3.3,
  returnEnd: 4,
  dissolveStart: 7.35,
  dissolveEnd: 8,
};
const MESSAGE_TIMES: ReadonlyArray<readonly [number, number?]> = [
  [3.72, 4.3],
  [4.7],
  [4.95, 5.25],
  [5.65],
  [5.9, 6.25],
  [6.7],
];

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));
const progress = (start: number, end: number, time: number) =>
  clamp((time - start) / (end - start));
const easeOut = (time: number) => 1 - (1 - clamp(time)) ** 3;
const easeInOut = (time: number) => {
  const value = clamp(time);
  return value < 0.5
    ? 4 * value * value * value
    : 1 - (-2 * value + 2) ** 3 / 2;
};
const backOut = (time: number) => {
  const value = clamp(time);
  const c1 = 1.7;
  const c3 = c1 + 1;
  return 1 + c3 * (value - 1) ** 3 + c1 * (value - 1) ** 2;
};
const lerp = (from: number, to: number, amount: number) =>
  from + (to - from) * amount;

const makeRandom = (initialSeed: number) => {
  let seed = initialSeed;
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
};

type PieceKind = "title" | "label" | "input" | "submit";

type Piece = {
  element: HTMLDivElement;
  kind: PieceKind;
  required: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  phase: number;
  speed: number;
  scale: number;
  delay: number;
  scatterX: number;
  scatterY: number;
  requiredElement: HTMLElement | null;
};

type Dot = {
  homeX: number;
  homeY: number;
  formX: number;
  formY: number;
  chatX: number;
  chatY: number;
  phase: number;
  speed: number;
  radius: number;
  delay: number;
};

type Geometry = {
  width: number;
  height: number;
  formWidth: number;
  formHeight: number;
  formX: number;
  formY: number;
  chat: { x: number; y: number; width: number; height: number };
  pieces: Piece[];
  dots: Dot[];
};

const perimeter = (
  x: number,
  y: number,
  width: number,
  height: number,
  amount: number,
) => {
  const length = 2 * (width + height);
  let distance = amount * length;

  if (distance < width) return [x + distance, y] as const;
  distance -= width;
  if (distance < height) return [x + width, y + distance] as const;
  distance -= height;
  if (distance < width) return [x + width - distance, y + height] as const;
  distance -= width;
  return [x, y + height - distance] as const;
};

async function waitForFonts() {
  if (typeof document === "undefined" || !document.fonts) return;
  await document.fonts.ready;
}

type HeroAnimationProps = {
  initialTime?: number;
  onReady?: () => void;
};

export default function HeroAnimation({
  initialTime = 0,
  onReady,
}: HeroAnimationProps) {
  const initialScenarioIndex =
    Math.floor(initialTime / LOOP) % HERO_SCENARIOS.length;
  const [scenarioIndex, setScenarioIndex] = useState(initialScenarioIndex);
  const scenario = HERO_SCENARIOS[scenarioIndex] ?? HERO_SCENARIOS[0];

  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const formCardRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const pieceRefs = useRef<Array<HTMLDivElement | null>>([]);
  const messageRefs = useRef<Array<HTMLDivElement | null>>([]);
  const chipRefs = useRef<Array<HTMLSpanElement | null>>([]);

  const geometryRef = useRef<Geometry | null>(null);
  const clockRef = useRef(initialTime);
  const activeScenarioRef = useRef(initialScenarioIndex);
  const visibleRef = useRef(false);
  const readyRef = useRef(false);
  const onReadyRef = useRef(onReady);
  const dotColorRef = useRef("");

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  const renderFrameRef = useRef<(time: number, clock: number) => void>(
    () => undefined,
  );

  const pieceIndex = (fieldIndex: number, part: "label" | "input") =>
    1 + fieldIndex * 2 + (part === "input" ? 1 : 0);
  const submitIndex = 1 + scenario.fields.length * 2;

  const renderFrame = (time: number, clock: number) => {
    const geometry = geometryRef.current;
    if (!geometry) return;

    const stage = stageRef.current;
    const formCard = formCardRef.current;
    const chat = chatRef.current;
    const canvas = canvasRef.current;
    if (!stage || !formCard || !chat || !canvas) return;

    const { width, height, formX, formY } = geometry;

    const formOpacity =
      easeInOut(
        progress(TIMELINE.assembleStart + 0.45, TIMELINE.assembleEnd, time),
      ) *
      (1 -
        easeInOut(
          progress(TIMELINE.breakStart, TIMELINE.breakStart + 0.4, time),
        ));
    formCard.style.opacity = formOpacity.toFixed(3);
    formCard.style.transform = `translate(${formX}px, ${formY}px) scale(${
      1 + 0.04 * progress(TIMELINE.breakStart, TIMELINE.breakStart + 0.4, time)
    })`;
    formCard.style.filter =
      time > TIMELINE.breakStart
        ? `blur(${4 * progress(TIMELINE.breakStart, TIMELINE.breakStart + 0.4, time)}px)`
        : "";

    for (const [index, piece] of geometry.pieces.entries()) {
      const appear = easeInOut(
        progress(
          TIMELINE.assembleStart + 0.4 + index * 0.035,
          TIMELINE.assembleEnd,
          time,
        ),
      );
      const breakAmount = easeInOut(
        progress(
          TIMELINE.breakStart + piece.delay * 0.6,
          TIMELINE.breakEnd,
          time,
        ),
      );
      const returnAmount = easeInOut(
        progress(
          TIMELINE.returnStart + piece.delay,
          TIMELINE.returnEnd - 0.1,
          time,
        ),
      );

      const originX = piece.x + piece.width / 2;
      const originY = piece.y + piece.height / 2;
      const driftX =
        Math.sin(clock * piece.speed + piece.phase) * 7 * breakAmount;
      const driftY =
        Math.cos(clock * piece.speed * 0.8 + piece.phase) * 7 * breakAmount;

      let x = lerp(originX, piece.scatterX, breakAmount) + driftX;
      let y = lerp(originY, piece.scatterY, breakAmount) + driftY;

      x = lerp(x, width / 2, returnAmount * 0.85);
      y = lerp(y, height / 2, returnAmount * 0.85);

      const scale =
        lerp(1, piece.scale, breakAmount) * (1 - 0.8 * returnAmount);
      let opacity =
        appear *
        (time < TIMELINE.breakStart ? 1 : 0.92) *
        (1 -
          progress(
            TIMELINE.returnStart + piece.delay + 0.1,
            TIMELINE.returnEnd - 0.15,
            time,
          ));
      if (time >= TIMELINE.returnEnd) opacity = 0;

      piece.element.style.opacity = opacity.toFixed(3);
      piece.element.style.transform = `translate(${(x - piece.width / 2).toFixed(1)}px, ${(
        y -
        piece.height / 2
      ).toFixed(
        1,
      )}px) rotate(${(piece.rotation * breakAmount).toFixed(1)}deg) scale(${scale.toFixed(
        3,
      )}) translateY(${((1 - appear) * 6).toFixed(1)}px)`;
      piece.element.style.filter =
        returnAmount > 0 ? `blur(${(3 * returnAmount).toFixed(2)}px)` : "";

      if (piece.kind === "submit") {
        piece.element.style.background =
          time > TIMELINE.submit && time < TIMELINE.submit + 0.18
            ? "var(--marketing-text)"
            : "";
      }

      if (piece.required) {
        const blinking =
          (time > TIMELINE.requiredStart &&
            time < TIMELINE.requiredEnd &&
            Math.floor((time - TIMELINE.requiredStart) / 0.16) % 2 === 0) ||
          (time > TIMELINE.requiredStart + 0.5 && time < TIMELINE.requiredEnd);
        const invalid = blinking && time < TIMELINE.breakStart;

        if (piece.kind === "input") {
          piece.element.style.borderColor = invalid
            ? "var(--marketing-error)"
            : "var(--marketing-hair)";
          piece.element.style.boxShadow = invalid
            ? "0 0 0 2px var(--marketing-error-ring)"
            : "";
        } else if (piece.requiredElement) {
          piece.requiredElement.style.opacity =
            time > TIMELINE.requiredStart && time < TIMELINE.breakStart + 0.3
              ? "1"
              : "0";
        }
      }
    }

    const chatIn = easeInOut(
      progress(TIMELINE.returnEnd - 0.35, TIMELINE.returnEnd + 0.1, time),
    );
    const chatOut = easeInOut(
      progress(TIMELINE.dissolveStart, TIMELINE.dissolveStart + 0.45, time),
    );
    const chatOpacity = chatIn * (1 - chatOut);
    chat.style.opacity = chatOpacity.toFixed(3);
    chat.style.transform = `translate(-50%, -50%) scale(${
      (0.95 + 0.05 * chatIn) * (1 - 0.03 * chatOut)
    })`;
    chat.style.filter =
      chatOut > 0
        ? `blur(${(5 * chatOut).toFixed(2)}px)`
        : chatIn < 1
          ? `blur(${(4 * (1 - chatIn)).toFixed(2)}px)`
          : "";

    for (const [index] of scenario.messages.entries()) {
      const element = messageRefs.current[index];
      if (!element) continue;

      const [start, shown] = MESSAGE_TIMES[index] ?? [4, 4.3];
      const typingEnd = shown ?? start;
      const isTyping = shown !== undefined && time >= start && time < typingEnd;
      const visible = time >= start;
      const pop = backOut(progress(start, start + 0.28, time));

      element.style.opacity = visible
        ? clamp(progress(start, start + 0.15, time)).toFixed(3)
        : "0";
      element.style.transform = `scale(${visible ? 0.85 + 0.15 * pop : 0.85}) translateY(${
        visible ? (1 - clamp(pop)) * 6 : 6
      }px)`;

      const text = element.querySelector<HTMLElement>(".message-text");
      const dots = element.querySelector<HTMLElement>(".message-dots");
      if (text) text.style.display = isTyping ? "none" : "block";
      if (dots) dots.style.display = isTyping ? "flex" : "none";
    }

    for (const [index, chip] of scenario.chips.entries()) {
      const element = chipRefs.current[index];
      if (!element) continue;

      const start = (MESSAGE_TIMES[chip.messageIndex]?.[0] ?? 4) + 0.2;
      const amount = easeOut(progress(start, start + 0.3, time));
      element.style.opacity = amount.toFixed(3);
      element.style.transform = `translateY(${((1 - amount) * 4).toFixed(1)}px)`;
    }

    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, width, height);

    for (const dot of geometry.dots) {
      const homeX = dot.homeX + Math.sin(clock * dot.speed + dot.phase) * 22;
      const homeY =
        dot.homeY + Math.cos(clock * dot.speed * 0.9 + dot.phase) * 16;

      let x: number;
      let y: number;
      let alpha: number;

      const toForm = easeInOut(
        progress(
          TIMELINE.assembleStart + dot.delay,
          TIMELINE.assembleEnd,
          time,
        ),
      );
      const fromForm = easeInOut(
        progress(
          TIMELINE.breakStart + dot.delay * 0.5,
          TIMELINE.breakEnd,
          time,
        ),
      );
      const toChat = easeInOut(
        progress(TIMELINE.returnStart + dot.delay, TIMELINE.returnEnd, time),
      );
      const fromChat = easeInOut(
        progress(
          TIMELINE.dissolveStart + dot.delay * 0.5,
          TIMELINE.dissolveEnd - 0.05,
          time,
        ),
      );

      if (time < TIMELINE.breakStart) {
        x = lerp(homeX, dot.formX, toForm);
        y = lerp(homeY, dot.formY, toForm);
        alpha = lerp(0.4, 0.14, toForm);
      } else if (time < TIMELINE.returnStart) {
        const formX = dot.formX + (dot.formX - width / 2) * 0.15;
        x = lerp(formX, homeX, fromForm);
        y = lerp(dot.formY, homeY, fromForm);
        alpha = lerp(0.14, 0.5, fromForm);
      } else if (time < TIMELINE.dissolveStart) {
        const wobble = Math.sin(clock * 1.6 + dot.phase) * 2;
        x = lerp(homeX, dot.chatX + wobble, toChat);
        y = lerp(homeY, dot.chatY + wobble, toChat);
        alpha = lerp(0.5, 0.16, toChat);
      } else {
        x = lerp(dot.chatX, homeX, fromChat);
        y = lerp(dot.chatY, homeY, fromChat);
        alpha = lerp(0.16, 0.4, fromChat);
      }

      context.beginPath();
      context.arc(x, y, dot.radius, 0, Math.PI * 2);
      context.globalAlpha = alpha;
      context.fillStyle = dotColorRef.current;
      context.fill();
    }

    context.globalAlpha = 1;
  };

  renderFrameRef.current = renderFrame;

  useEffect(() => {
    let cancelled = false;

    const buildGeometry = () => {
      const stage = stageRef.current;
      const canvas = canvasRef.current;
      const chat = chatRef.current;
      const formCard = formCardRef.current;
      if (!stage || !canvas || !chat || !formCard) return;

      const width = stage.clientWidth;
      const height = stage.clientHeight;
      if (!width || !height) return;

      const stageStyles = getComputedStyle(stage);
      dotColorRef.current =
        stageStyles.getPropertyValue("--marketing-blue-600").trim() ||
        stageStyles.color;

      const mobile = width < 640;
      const formWidth = Math.min(360, width - 40);
      const formHeight = 350;
      const formX = (width - formWidth) / 2;
      const formY = (height - formHeight) / 2;

      formCard.style.width = `${formWidth}px`;
      formCard.style.height = `${formHeight}px`;

      const inputWidth = formWidth - 40;
      scenario.fields.forEach((_, index) => {
        const input = pieceRefs.current[pieceIndex(index, "input")];
        if (input) input.style.width = `${inputWidth}px`;
      });

      const definitions: Array<{
        index: number;
        kind: PieceKind;
        x: number;
        y: number;
        width: number;
        height: number;
        required: boolean;
      }> = [];

      const title = pieceRefs.current[0];
      if (title) {
        definitions.push({
          index: 0,
          kind: "title",
          x: formX + 20,
          y: formY + 20,
          width: title.offsetWidth,
          height: 14,
          required: false,
        });
      }

      scenario.fields.forEach((_, index) => {
        const label = pieceRefs.current[pieceIndex(index, "label")];
        const input = pieceRefs.current[pieceIndex(index, "input")];
        const labelY = formY + 52 + index * 58;

        if (label) {
          definitions.push({
            index: pieceIndex(index, "label"),
            kind: "label",
            x: formX + 20,
            y: labelY,
            width: label.offsetWidth,
            height: 12,
            required: index === scenario.requiredIndex,
          });
        }
        if (input) {
          definitions.push({
            index: pieceIndex(index, "input"),
            kind: "input",
            x: formX + 20,
            y: labelY + 17,
            width: inputWidth,
            height: input.offsetHeight,
            required: index === scenario.requiredIndex,
          });
        }
      });

      const submit = pieceRefs.current[submitIndex];
      if (submit) {
        definitions.push({
          index: submitIndex,
          kind: "submit",
          x: formX + 20,
          y: formY + 302,
          width: 84,
          height: 30,
          required: false,
        });
      }

      const random = makeRandom(41 + scenarioIndex * 7);
      const placed: Array<{
        x: number;
        y: number;
        width: number;
        height: number;
      }> = [];
      const amplitude = 7;

      const pieces = definitions.map((definition): Piece | null => {
        const element = pieceRefs.current[definition.index];
        if (!element) return null;

        const scale = definition.kind === "input" ? (mobile ? 0.44 : 0.58) : 1;
        const rotation = (random() - 0.5) * 26;
        const rotatedWidth = definition.width * scale;
        const rotatedHeight = definition.height * scale;
        const radians = (Math.abs(rotation) * Math.PI) / 180;
        const boundingWidth =
          rotatedWidth * Math.cos(radians) + rotatedHeight * Math.sin(radians);
        const boundingHeight =
          rotatedWidth * Math.sin(radians) + rotatedHeight * Math.cos(radians);

        let best = {
          x: 10 + amplitude,
          y: 10 + amplitude,
          width: boundingWidth,
          height: boundingHeight,
        };
        let bestDistance = -1;

        for (let attempt = 0; attempt < 2000; attempt += 1) {
          const candidate = {
            x:
              10 +
              amplitude +
              random() *
                Math.max(0, width - boundingWidth - 20 - amplitude * 2),
            y:
              10 +
              amplitude +
              random() *
                Math.max(0, height - boundingHeight - 20 - amplitude * 2),
            width: boundingWidth,
            height: boundingHeight,
          };

          let nearest = Number.POSITIVE_INFINITY;
          for (const previous of placed) {
            const dx = Math.max(
              previous.x - (candidate.x + candidate.width),
              candidate.x - (previous.x + previous.width),
              0,
            );
            const dy = Math.max(
              previous.y - (candidate.y + candidate.height),
              candidate.y - (previous.y + previous.height),
              0,
            );
            nearest = Math.min(nearest, Math.max(dx, dy));
          }

          if (nearest > amplitude * 2 + 10) {
            best = candidate;
            break;
          }
          if (nearest > bestDistance) {
            bestDistance = nearest;
            best = candidate;
          }
        }

        placed.push(best);

        return {
          element,
          kind: definition.kind,
          required: definition.required,
          x: definition.x,
          y: definition.y,
          width: definition.width,
          height: definition.height,
          rotation,
          phase: random() * Math.PI * 2,
          speed: 0.6 + random() * 0.6,
          scale,
          delay: random() * 0.25,
          scatterX: best.x + best.width / 2,
          scatterY: best.y + best.height / 2,
          requiredElement: element.querySelector<HTMLElement>(".required-mark"),
        } satisfies Piece;
      });

      const renderedPieces = pieces.filter(
        (piece): piece is Piece => piece !== null,
      );

      const stageRect = stage.getBoundingClientRect();
      const chatRect = chat.getBoundingClientRect();
      const chatGeometry = {
        x: chatRect.left - stageRect.left,
        y: chatRect.top - stageRect.top,
        width: chatRect.width,
        height: chatRect.height,
      };

      const randomDots = makeRandom(97);
      const dotCount = mobile ? 110 : 160;
      const inputPieces = renderedPieces.filter(
        (piece) => piece.kind === "input" || piece.kind === "submit",
      );

      const dots: Dot[] = Array.from({ length: dotCount }, (_, index) => {
        let formPoint: readonly [number, number];

        if (index % 5 < 2 && inputPieces.length > 0) {
          const piece = inputPieces[index % inputPieces.length];
          formPoint = piece
            ? perimeter(
                piece.x,
                piece.y,
                piece.width,
                piece.height,
                randomDots(),
              )
            : [formX, formY];
        } else {
          formPoint = perimeter(
            formX,
            formY,
            formWidth,
            formHeight,
            randomDots(),
          );
        }

        const chatPoint = perimeter(
          chatGeometry.x + 6,
          chatGeometry.y + 6,
          Math.max(0, chatGeometry.width - 12),
          Math.max(0, chatGeometry.height - 12),
          randomDots(),
        );

        return {
          homeX: randomDots() * width,
          homeY: randomDots() * height,
          formX: formPoint[0],
          formY: formPoint[1],
          chatX: chatPoint[0],
          chatY: chatPoint[1],
          phase: randomDots() * Math.PI * 2,
          speed: 0.4 + randomDots(),
          radius: 1 + randomDots() * 1.6,
          delay: randomDots() * 0.18,
        };
      });

      const devicePixelRatio =
        typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
      canvas.width = width * devicePixelRatio;
      canvas.height = height * devicePixelRatio;
      const context = canvas.getContext("2d");
      context?.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

      geometryRef.current = {
        width,
        height,
        formWidth,
        formHeight,
        formX,
        formY,
        chat: chatGeometry,
        pieces: renderedPieces,
        dots,
      };

      if (!cancelled) {
        renderFrameRef.current(clockRef.current % LOOP, clockRef.current);

        if (!readyRef.current) {
          readyRef.current = true;
          onReadyRef.current?.();
        }
      }
    };

    const start = async () => {
      await waitForFonts();
      if (cancelled) return;
      buildGeometry();
    };

    void start();

    const resizeObserver = new ResizeObserver(() => buildGeometry());
    if (stageRef.current) resizeObserver.observe(stageRef.current);

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
    };
  }, [scenarioIndex]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = 0;
    let last = 0;

    const stop = () => {
      if (animationFrame !== 0) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
    };

    const loop = (now: number) => {
      animationFrame = requestAnimationFrame(loop);

      if (!visibleRef.current || !geometryRef.current) {
        last = now;
        return;
      }

      const delta = Math.min(0.1, (now - last) / 1000);
      last = now;
      clockRef.current += delta;

      const nextScenario =
        Math.floor(clockRef.current / LOOP) % HERO_SCENARIOS.length;

      if (nextScenario !== activeScenarioRef.current) {
        activeScenarioRef.current = nextScenario;
        setScenarioIndex(nextScenario);
      }

      renderFrameRef.current(clockRef.current % LOOP, clockRef.current);
    };

    const start = () => {
      if (animationFrame !== 0 || motionQuery.matches || document.hidden)
        return;
      if (!visibleRef.current) return;

      last = performance.now();
      animationFrame = requestAnimationFrame(loop);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibleRef.current = entry.isIntersecting;
          if (entry.isIntersecting) start();
          else stop();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(stage);

    const handleVisibilityChange = () => {
      if (document.hidden) stop();
      else start();
    };

    const handleMotionChange = () => {
      if (motionQuery.matches) stop();
      else start();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    motionQuery.addEventListener("change", handleMotionChange);

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      motionQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  return (
    <div ref={stageRef} className="absolute inset-0">
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      <div
        ref={formCardRef}
        aria-hidden="true"
        className="absolute left-0 top-0 rounded-[4px] border border-marketing-hair bg-marketing-hair-soft"
      />

      <div
        ref={(element) => {
          pieceRefs.current[0] = element;
        }}
        aria-hidden="true"
        className="absolute left-0 top-0 whitespace-nowrap font-body text-[13.5px] font-semibold leading-none text-marketing-muted"
      >
        {scenario.title}
      </div>

      {scenario.fields.map((field, index) => (
        <Fragment key={field}>
          <div
            ref={(element) => {
              pieceRefs.current[pieceIndex(index, "label")] = element;
            }}
            aria-hidden="true"
            className="absolute left-0 top-0 whitespace-nowrap font-body text-xs leading-none text-marketing-text"
          >
            {field} *
            {index === scenario.requiredIndex && (
              <span className="required-mark ml-2 font-body text-[11px] text-red-600 opacity-0">
                Required
              </span>
            )}
          </div>
          <div
            ref={(element) => {
              pieceRefs.current[pieceIndex(index, "input")] = element;
            }}
            aria-hidden="true"
            className={cn(
              "absolute left-0 top-0 rounded-[2px] border border-marketing-hair bg-white",
              index === 3 ? "h-[44px]" : "h-[30px]",
            )}
          />
        </Fragment>
      ))}

      <div
        ref={(element) => {
          pieceRefs.current[submitIndex] = element;
        }}
        aria-hidden="true"
        className="absolute left-0 top-0 grid h-[30px] w-[84px] place-items-center rounded-[2px] bg-marketing-slate font-body text-xs font-medium leading-none text-white transition-colors duration-150"
      >
        Submit
      </div>

      <div
        ref={chatRef}
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 w-[min(440px,calc(100%-28px))] -translate-x-1/2 -translate-y-1/2 rounded-[22px] border-[1.25px] border-marketing-blue-200 bg-white/86 p-3 text-left opacity-0 backdrop-blur-[14px]"
      >
        <div className="flex items-center gap-2 border-b border-slate-100 px-0.5 pb-2.5 pt-0.5">
          <span className="grid size-6 place-items-center rounded-full bg-marketing-blue-600 font-body text-[10px] font-bold leading-none text-white">
            CF
          </span>
          <span className="font-body text-[13px] font-semibold leading-none text-marketing-ink">
            ConvoForm
          </span>
          <span className="ml-auto flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.04em] leading-none text-marketing-blue-600">
            <span className="size-1.5 rounded-full bg-marketing-blue-600" />
            Live
          </span>
        </div>

        <div className="flex flex-col gap-[7px] pb-1 pt-2.5">
          {scenario.messages.map((message, index) => (
            <div
              key={`${message.kind}-${index}`}
              ref={(element) => {
                messageRefs.current[index] = element;
              }}
              className={cn(
                "max-w-[80%] whitespace-nowrap rounded-2xl px-3 py-2 font-body text-[13.5px] leading-[1.35] opacity-0",
                message.kind === "user"
                  ? "self-end rounded-br-[5px] bg-marketing-blue-600 text-white"
                  : message.kind === "followUp"
                    ? "self-start rounded-bl-[5px] bg-marketing-blue-50 text-marketing-blue-700 shadow-[inset_0_0_0_1.25px_var(--marketing-blue-300)]"
                    : "self-start rounded-bl-[5px] bg-slate-100 text-marketing-ink",
              )}
            >
              <span className="message-text">{message.text}</span>
              {message.kind !== "user" && (
                <span className="message-dots hidden items-center gap-1">
                  <i className="size-1.5 rounded-full bg-marketing-slate" />
                  <i className="size-1.5 rounded-full bg-marketing-slate" />
                  <i className="size-1.5 rounded-full bg-marketing-slate" />
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-1.5 flex min-h-9 flex-wrap gap-1.5 border-t border-dashed border-marketing-hair-soft pt-2.5">
          {scenario.chips.map((chip, index) => (
            <span
              key={chip.label}
              ref={(element) => {
                chipRefs.current[index] = element;
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-marketing-hair-soft bg-marketing-surface px-2.5 py-1.5 font-body text-[11.5px] font-medium leading-none text-marketing-muted opacity-0"
            >
              {chip.label}:{" "}
              <b className="font-semibold text-marketing-ink">{chip.value}</b>
              <svg
                viewBox="0 0 12 12"
                className="size-2.5 stroke-marketing-blue-600"
                aria-hidden="true"
                fill="none"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2.2 6.3 4.6 8.7 9.8 3.3" />
              </svg>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
