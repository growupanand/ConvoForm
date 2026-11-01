"use client";

import { useEffect, useRef } from "react";

import {
  type ConversationEvent,
  HOW_IT_WORKS_SCENARIOS,
  HOW_IT_WORKS_START_CLOCK,
  SCENARIO_SECONDS,
  type ScenarioSchedule,
  scheduleScenario,
} from "./scenarios";

const NS = "http://www.w3.org/2000/svg";
const T = SCENARIO_SECONDS;
const SCENARIOS = HOW_IT_WORKS_SCENARIOS;
const SCHEDULES: ScenarioSchedule[] = SCENARIOS.map(scheduleScenario);

const BODY_FONT = "var(--font-inter), system-ui, sans-serif";
const MONO_FONT = "var(--font-jetbrains-mono), ui-monospace, monospace";

const C = {
  ink: "var(--marketing-ink)",
  muted: "var(--marketing-muted)",
  line: "var(--marketing-slate)",
  faint: "var(--marketing-hair)",
  text: "var(--marketing-text)",
  label: "var(--marketing-label)",
  blue: "var(--marketing-blue-600)",
  blueFaint: "var(--marketing-blue-300)",
  surface: "var(--marketing-surface)",
} as const;

const SW = 1.25;

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));
const easeOut = (value: number) => 1 - (1 - clamp(value)) ** 3;
const easeInOut = (value: number) => {
  const amount = clamp(value);
  return amount < 0.5 ? 4 * amount ** 3 : 1 - (-2 * amount + 2) ** 3 / 2;
};
const progress = (start: number, end: number, time: number) =>
  clamp((time - start) / (end - start));

type Rect = { x: number; y: number; w: number; h: number };
type TableRect = { x: number; y: number; w: number; rowH: number };
type Layout = {
  mobile: boolean;
  W: number;
  H: number;
  form: Rect;
  chat: Rect;
  table: TableRect;
  fieldGap: number;
  fs: number;
};

type Drawable = SVGGeometryElement;

type LabelParts = {
  g: SVGGElement;
  ln: SVGLineElement;
  t: SVGTextElement;
};

type FieldParts = {
  t: SVGTextElement;
  line: SVGLineElement;
  tick: SVGPathElement;
  y: number;
  x0: number;
  x1: number;
};

type MessageParts = {
  event: ConversationEvent;
  g: SVGGElement;
  bubble: SVGPathElement;
  text: SVGTextElement;
  width: number;
  height: number;
  caret?: SVGLineElement;
  underline?: SVGPathElement;
  tag?: SVGTextElement;
  peel?: SVGPathElement;
};

type TableRowParts = {
  line: SVGLineElement;
  key: SVGTextElement;
  value: SVGTextElement;
  box: SVGCircleElement;
  tick: SVGPathElement;
  ring: SVGCircleElement;
  edge: SVGLineElement;
  y: number;
  cx: number;
  cy: number;
};

type TravelParts = {
  path: SVGPathElement;
  dot: SVGCircleElement;
  halo: SVGCircleElement;
};

type Built = {
  root: SVGGElement;
  labels: LabelParts[];
  form: SVGGElement;
  fOut: SVGRectElement;
  fTitle: SVGTextElement;
  fTitleLine: SVGLineElement;
  fields: FieldParts[];
  fSubmit: SVGRectElement;
  fSubmitText: SVGTextElement;
  chat: SVGGElement;
  corners: SVGPathElement[];
  avatar: SVGCircleElement;
  avatarDot: SVGCircleElement;
  chatName: SVGTextElement;
  chatLive: SVGTextElement;
  chatHeadingLine: SVGLineElement;
  inputLine: SVGLineElement;
  send: SVGPathElement;
  cursor: SVGLineElement;
  messageList: SVGGElement;
  peels: SVGGElement;
  messages: MessageParts[];
  table: SVGGElement;
  tableOut: SVGRectElement;
  tableHeader: SVGTextElement;
  tableCount: SVGTextElement;
  tableColumn: SVGLineElement;
  rows: TableRowParts[];
  tableHeight: number;
  flows: Array<[SVGPathElement, SVGPathElement]>;
  travels: TravelParts[];
  messageArea: { top: number; bottom: number };
  measurer: SVGTextElement;
};

type HowItWorksAnimationProps = {
  onScenarioChange?: (index: number) => void;
  onReady?: () => void;
};

export default function HowItWorksAnimation({
  onScenarioChange,
  onReady,
}: HowItWorksAnimationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const builtRef = useRef<Built | null>(null);
  const layoutRef = useRef<Layout | null>(null);
  const visibleRef = useRef(false);
  const readyRef = useRef(false);
  const clockRef = useRef<number>(HOW_IT_WORKS_START_CLOCK.desktop);
  const didInitialiseRef = useRef(false);
  const activeScenarioRef = useRef(0);
  const reportedScenarioRef = useRef(-1);
  const onReadyRef = useRef(onReady);
  const onScenarioChangeRef = useRef(onScenarioChange);

  useEffect(() => {
    onReadyRef.current = onReady;
    onScenarioChangeRef.current = onScenarioChange;
  }, [onReady, onScenarioChange]);

  const renderFrameRef = useRef<(clock: number) => void>(() => undefined);
  const renderFrame = (clock: number) => {
    const built = builtRef.current;
    const layout = layoutRef.current;
    const svg = svgRef.current;
    if (!built || !layout || !svg) return;

    const scenarioIndex = Math.floor(clock / T) % SCENARIOS.length;
    const time = clock % T;
    const schedule = SCHEDULES[scenarioIndex];
    const scenario = SCENARIOS[scenarioIndex];
    if (!schedule || !scenario) return;

    const { mobile: M, chat: Ch, table: Tb } = layout;
    const R = built;

    R.root.style.opacity = String(1 - progress(T - 0.55, T - 0.1, time));

    const chatOn = time >= 1.15;
    const dataOn = time >= (schedule.saves[0]?.fill ?? schedule.end);
    const activeStage = [!chatOn, chatOn && time < schedule.end, dataOn];

    for (const [index, label] of R.labels.entries()) {
      label.g.style.opacity = String(easeOut(progress(0, 0.3, time)));
      label.t.setAttribute("fill", activeStage[index] ? C.blue : C.label);
      label.ln.setAttribute("stroke", activeStage[index] ? C.blue : C.faint);
    }

    if (M) {
      const shift = progress(0.95, 1.2, time);
      const first = R.labels[0];
      const second = R.labels[1];
      if (first) {
        first.g.style.opacity = String(
          easeOut(progress(0, 0.3, time)) * (1 - shift),
        );
      }
      if (second) {
        second.g.style.opacity = String(shift);
      }
    }

    const retract = M ? 1 - easeInOut(progress(0.85, 1.15, time)) : 1;

    draw(R.fOut, easeInOut(progress(0, 0.55, time)) * retract);
    R.fTitle.style.opacity = String(
      easeOut(progress(0.15, 0.45, time)) * retract,
    );
    draw(R.fTitleLine, easeInOut(progress(0.2, 0.5, time)) * retract);

    let asking = -1;
    for (const ask of schedule.asks) {
      if (time >= ask.at) asking = ask.field;
    }
    if (time >= schedule.end) asking = -1;

    for (const [index, field] of R.fields.entries()) {
      const appear = 0.25 + index * 0.08;
      field.t.style.opacity = String(
        easeOut(progress(appear, appear + 0.25, time)) * retract,
      );
      draw(
        field.line,
        easeInOut(progress(appear, appear + 0.3, time)) * retract,
      );

      const saved = schedule.saves.find((save) => save.field === index);
      const isSaved = Boolean(saved && time >= saved.fill);
      const isAsking = index === asking && !isSaved;

      field.line.setAttribute("stroke", isAsking ? C.blue : C.line);
      field.t.setAttribute("fill", isAsking ? C.blue : C.text);

      if (isSaved && !M) {
        field.line.style.strokeDasharray = "2 4";
        field.line.style.strokeDashoffset = "0";
        field.line.setAttribute("stroke", C.faint);
      }

      draw(
        field.tick,
        M
          ? 0
          : saved
            ? easeInOut(progress(saved.fill, saved.fill + 0.3, time))
            : 0,
      );
    }

    draw(R.fSubmit, easeInOut(progress(0.55, 0.85, time)) * retract);
    R.fSubmitText.style.opacity = String(
      easeOut(progress(0.65, 0.9, time)) * retract,
    );
    R.form.style.opacity = String(
      M ? 1 : 1 - 0.4 * easeOut(progress(1.2, 1.6, time)),
    );

    const chatStart = M ? 0.95 : 0.35;
    for (const corner of R.corners) {
      draw(corner, easeInOut(progress(chatStart, chatStart + 0.35, time)));
    }
    draw(R.avatar, easeInOut(progress(chatStart + 0.1, chatStart + 0.4, time)));
    R.avatarDot.style.opacity = String(
      easeOut(progress(chatStart + 0.3, chatStart + 0.45, time)),
    );
    R.chatName.style.opacity = String(
      easeOut(progress(chatStart + 0.15, chatStart + 0.4, time)),
    );
    R.chatLive.style.opacity = String(
      easeOut(progress(chatStart + 0.15, chatStart + 0.4, time)) *
        (0.55 + 0.45 * Math.abs(Math.sin(time * 2.2))),
    );
    draw(
      R.chatHeadingLine,
      easeInOut(progress(chatStart + 0.1, chatStart + 0.45, time)),
    );
    draw(
      R.inputLine,
      easeInOut(progress(chatStart + 0.2, chatStart + 0.55, time)),
    );
    draw(R.send, easeInOut(progress(chatStart + 0.4, chatStart + 0.6, time)));

    const gap = 10;
    const areaHeight = R.messageArea.bottom - R.messageArea.top - 4;
    let accumulated = 0;
    const messageOffsets: number[] = [];
    for (const message of R.messages) {
      const start =
        message.event.kind === "ai" ? message.event.dotsAt : message.event.at;
      const reveal = easeOut(progress(start, start + 0.22, time));
      messageOffsets.push(accumulated);
      accumulated += (message.height + gap) * reveal;
    }
    const scroll = Math.max(0, accumulated - gap - areaHeight);

    for (const [index, message] of R.messages.entries()) {
      const event = message.event;
      const start = event.kind === "ai" ? event.dotsAt : event.at;

      if (time < start) {
        message.g.style.display = "none";
        if (message.peel) message.peel.style.opacity = "0";
        continue;
      }

      message.g.style.display = "";
      const bubbleX =
        event.kind === "ai" ? Ch.x + 14 : Ch.x + Ch.w - 14 - message.width;
      const bubbleY =
        R.messageArea.top + 2 + (messageOffsets[index] ?? 0) - scroll;
      message.g.setAttribute("transform", `translate(${bubbleX},${bubbleY})`);

      if (event.kind === "ai") {
        if (message.peel) {
          const field = R.fields[event.field];
          const peelDuration = (event.at - event.dotsAt) * 0.45;
          if (field) {
            const targetX = bubbleX;
            const targetY = bubbleY + message.height;
            message.peel.setAttribute(
              "d",
              `M${field.x0},${field.y} H${field.x1} C${field.x1 + 50},${field.y} ${targetX - 50},${targetY} ${targetX},${targetY}`,
            );
            resetLength(message.peel);
            draw(
              message.peel,
              easeInOut(
                progress(event.dotsAt, event.dotsAt + peelDuration, time),
              ),
            );
            message.peel.style.opacity = String(
              time < event.dotsAt
                ? 0
                : 1 - progress(event.at + 0.1, event.at + 0.55, time),
            );
          }
        }

        draw(
          message.bubble,
          easeInOut(
            progress(
              event.dotsAt + (event.at - event.dotsAt) * 0.45,
              event.at,
              time,
            ),
          ),
        );
        message.text.textContent = event.text;
        message.text.style.opacity = String(
          easeOut(progress(event.at - 0.05, event.at + 0.15, time)),
        );
        if (message.tag) {
          message.tag.style.opacity = String(
            easeOut(progress(event.at, event.at + 0.25, time)),
          );
        }
      } else {
        draw(
          message.bubble,
          easeInOut(progress(event.at, event.at + 0.16, time)),
        );
        const typed = progress(event.at + 0.06, event.end, time);
        const letters = Math.round(event.text.length * typed);
        const visibleText = event.text.slice(0, letters);
        message.text.textContent = visibleText;

        if (message.caret) {
          const width = visibleText
            ? measureText(R.measurer, visibleText, layout.fs, 500)
            : 0;
          message.caret.setAttribute("x1", String(12 + width + 1.5));
          message.caret.setAttribute("x2", String(12 + width + 1.5));
          message.caret.style.opacity = typed < 1 ? "1" : "0";
        }

        if (message.underline && event.vagueAt !== undefined) {
          draw(
            message.underline,
            easeInOut(progress(event.vagueAt, event.vagueAt + 0.35, time)),
          );
        }
      }
    }

    let lastAi = -1;
    let lastUser = -1;
    for (const event of schedule.events) {
      if (event.kind === "ai" && time >= event.at) {
        lastAi = Math.max(lastAi, event.at);
      }
      if (event.kind === "user" && time >= event.at) {
        lastUser = Math.max(lastUser, event.at);
      }
    }
    const idle =
      (time > chatStart + 0.5 && lastAi < 0) ||
      lastAi > lastUser ||
      time >= schedule.end;
    R.cursor.style.opacity = idle
      ? String(
          (Math.floor(time * 2.4) % 2 ? 0.15 : 1) *
            easeOut(progress(chatStart + 0.5, chatStart + 0.7, time)),
        )
      : "0";

    const tableStart = M ? 0.4 : 0.3;
    draw(R.tableOut, easeInOut(progress(tableStart, tableStart + 0.55, time)));
    R.tableHeader.style.opacity = String(
      easeOut(progress(tableStart + 0.2, tableStart + 0.45, time)),
    );
    draw(
      R.tableColumn,
      easeInOut(progress(tableStart + 0.3, tableStart + 0.65, time)),
    );

    let savedCount = 0;
    for (const [index, row] of R.rows.entries()) {
      const appear = tableStart + 0.12 + index * 0.05;
      draw(row.line, easeInOut(progress(appear, appear + 0.4, time)));
      row.key.style.opacity = String(
        easeOut(progress(appear + 0.2, appear + 0.45, time)),
      );
      draw(row.box, easeInOut(progress(appear + 0.2, appear + 0.45, time)));

      const saved = schedule.saves.find((save) => save.field === index);
      if (saved && time >= saved.fill) {
        savedCount += 1;
        const amount = easeOut(progress(saved.fill, saved.fill + 0.3, time));
        row.value.textContent = saved.value;
        row.value.setAttribute("fill", C.ink);
        row.value.style.opacity = String(amount);
        row.value.setAttribute(
          "transform",
          `translate(${(1 - amount) * -6},0)`,
        );
        draw(
          row.tick,
          easeInOut(progress(saved.fill + 0.08, saved.fill + 0.38, time)),
        );
        row.box.setAttribute("stroke", C.blue);
        const ringProgress = progress(
          saved.fill + 0.05,
          saved.fill + 0.8,
          time,
        );
        row.ring.setAttribute("r", String(7 + 11 * easeOut(ringProgress)));
        row.ring.style.opacity =
          ringProgress > 0 && ringProgress < 1
            ? String((1 - ringProgress) * 0.8)
            : "0";
        row.edge.style.opacity = String(
          Math.sin(progress(saved.fill, saved.fill + 1, time) * Math.PI),
        );
      } else {
        row.value.textContent = "—";
        row.value.setAttribute("fill", C.faint);
        row.value.style.opacity = String(
          easeOut(progress(appear + 0.3, appear + 0.55, time)),
        );
        row.value.removeAttribute("transform");
        draw(row.tick, 0);
        row.box.setAttribute("stroke", C.faint);
        row.ring.style.opacity = "0";
        row.edge.style.opacity = "0";
      }
    }

    R.tableCount.textContent = `${savedCount}/${R.rows.length}${
      savedCount === R.rows.length ? " ✓" : ""
    }`;
    R.tableCount.setAttribute("fill", savedCount ? C.blue : C.label);
    R.tableCount.style.opacity = String(
      easeOut(progress(tableStart + 0.2, tableStart + 0.45, time)),
    );

    for (const [index, [flowLine, arrow]] of R.flows.entries()) {
      const start = (M ? 1 : 0.6) + index * 0.15;
      draw(flowLine, easeInOut(progress(start, start + 0.35, time)));
      draw(arrow, easeInOut(progress(start + 0.3, start + 0.45, time)));
    }

    for (const [index, save] of schedule.saves.entries()) {
      const travel = R.travels[index];
      if (!travel) continue;
      const message = R.messages.find((item) => item.event === save.from);
      if (!message) {
        travel.path.style.opacity = "0";
        travel.dot.style.opacity = "0";
        travel.halo.style.opacity = "0";
        continue;
      }

      const fromIndex = R.messages.indexOf(message);
      const startAt = save.from.end + 0.05;
      if (time < startAt) {
        travel.path.style.opacity = "0";
        travel.dot.style.opacity = "0";
        travel.halo.style.opacity = "0";
        continue;
      }

      const bubbleY =
        R.messageArea.top + 2 + (messageOffsets[fromIndex] ?? 0) - scroll;
      const row = R.rows[save.field];
      if (!row) continue;

      let path: string;
      if (!M) {
        const startX = Ch.x + Ch.w - 10;
        const startY = bubbleY + message.height / 2;
        const endX = Tb.x - 3;
        const endY = row.y + Tb.rowH / 2;
        path = `M${startX},${startY} C${startX + 40},${startY} ${endX - 40},${endY} ${endX},${endY}`;
      } else {
        const startX = Ch.x + Ch.w - 6;
        const startY = bubbleY + message.height / 2;
        const endX = row.cx + 9;
        const endY = row.cy;
        path = `M${startX},${startY} C${startX + 4},${startY + 60} ${endX + 4},${endY - 80} ${endX},${endY}`;
      }

      travel.path.setAttribute("d", path);
      resetLength(travel.path);
      const amount = easeInOut(progress(startAt, save.fill, time));
      draw(travel.path, amount);
      travel.path.style.opacity = String(
        0.55 * (1 - progress(save.fill + 0.05, save.fill + 0.5, time)),
      );

      const point = travel.path.getPointAtLength(
        Math.max(0, (lengthOf(travel.path) - 1) * amount),
      );
      const visible = amount > 0 && time < save.fill + 0.08 ? "1" : "0";
      travel.dot.setAttribute("cx", String(point.x));
      travel.dot.setAttribute("cy", String(point.y));
      travel.dot.style.opacity = visible;
      travel.halo.setAttribute("cx", String(point.x));
      travel.halo.setAttribute("cy", String(point.y));
      travel.halo.style.opacity = String(Number(visible) * 0.7);
    }

    if (reportedScenarioRef.current !== scenarioIndex) {
      reportedScenarioRef.current = scenarioIndex;
      onScenarioChangeRef.current?.(scenarioIndex);
    }
  };

  renderFrameRef.current = renderFrame;

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;

    const build = () => {
      if (cancelled) return;
      const scenarioIndex = Math.floor(clockRef.current / T) % SCENARIOS.length;
      const schedule = SCHEDULES[scenarioIndex];
      if (!schedule) return;
      const mobile = !window.matchMedia("(min-width: 900px)").matches;
      const layout = getLayout(mobile);
      if (!didInitialiseRef.current) {
        clockRef.current = mobile
          ? HOW_IT_WORKS_START_CLOCK.mobile
          : HOW_IT_WORKS_START_CLOCK.desktop;
        didInitialiseRef.current = true;
      }
      const built = buildScene(svg, layout, scenarioIndex, schedule);
      layoutRef.current = layout;
      builtRef.current = built;
      activeScenarioRef.current = scenarioIndex;
      renderFrameRef.current(clockRef.current);

      if (!readyRef.current) {
        readyRef.current = true;
        onReadyRef.current?.();
      }
    };

    const start = async () => {
      if (document.fonts) await document.fonts.ready;
      if (cancelled) return;
      build();

      resizeObserver = new ResizeObserver(() => build());
      const stage = svg.parentElement;
      if (stage) resizeObserver.observe(stage);

      const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      const handleMotionChange = () => {
        if (motionQuery.matches) return;
        build();
      };
      motionQuery.addEventListener("change", handleMotionChange);
      cleanupMotion = () =>
        motionQuery.removeEventListener("change", handleMotionChange);
    };

    let cleanupMotion: (() => void) | undefined;
    void start();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      cleanupMotion?.();
      builtRef.current = null;
      layoutRef.current = null;
      svg.innerHTML = "";
    };
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

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
      if (!visibleRef.current || !builtRef.current) {
        last = now;
        return;
      }

      const delta = Math.min(0.1, (now - last) / 1000);
      last = now;
      clockRef.current += delta;
      renderFrameRef.current(clockRef.current);
    };

    const start = () => {
      if (animationFrame !== 0 || motionQuery.matches || document.hidden) {
        return;
      }
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
    observer.observe(svg);

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
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      motionQuery.removeEventListener("change", handleMotion);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 1080 336"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full overflow-visible"
      style={{ fontFamily: BODY_FONT }}
    />
  );
}

function getLayout(mobile: boolean): Layout {
  if (!mobile) {
    return {
      mobile,
      W: 1080,
      H: 336,
      form: { x: 0, y: 30, w: 236, h: 300 },
      chat: { x: 300, y: 30, w: 440, h: 300 },
      table: { x: 800, y: 30, w: 280, rowH: 60 },
      fieldGap: 52,
      fs: 12.5,
    };
  }

  return {
    mobile,
    W: 345,
    H: 664,
    form: { x: 0, y: 30, w: 345, h: 310 },
    chat: { x: 0, y: 30, w: 345, h: 310 },
    table: { x: 0, y: 398, w: 345, rowH: 54 },
    fieldGap: 54,
    fs: 12.5,
  };
}

function buildScene(
  svg: SVGSVGElement,
  layout: Layout,
  scenarioIndex: number,
  schedule: ScenarioSchedule,
): Built {
  const scenario = SCENARIOS[scenarioIndex];
  if (!scenario) throw new Error("Missing How-it-works scenario");

  svg.innerHTML = "";
  svg.setAttribute("viewBox", `0 0 ${layout.W} ${layout.H}`);

  const measurer = createEl(svg, "text", {
    x: -999,
    y: -999,
    "font-size": 12.5,
    opacity: 0,
    "font-family": BODY_FONT,
  });

  const root = createEl(svg, "g");
  const { form: F, chat: Ch, table: Tb } = layout;

  const defs = createEl(root, "defs");
  const areaTop = Ch.y + 46;
  const areaBottom = Ch.y + Ch.h - 44;
  defs.innerHTML = `<linearGradient id="howItWorksFade" gradientUnits="userSpaceOnUse" x1="0" y1="${areaTop}" x2="0" y2="${areaTop + 26}"><stop offset="0" stop-color="${C.surface}" stop-opacity="0"/><stop offset="1" stop-color="${C.surface}"/></linearGradient><mask id="howItWorksChatMask" maskUnits="userSpaceOnUse" x="${Ch.x - 20}" y="${areaTop}" width="${Ch.w + 40}" height="${areaBottom - areaTop}"><rect x="${Ch.x - 20}" y="${areaTop}" width="${Ch.w + 40}" height="${areaBottom - areaTop}" fill="url(#howItWorksFade)"/></mask>`;

  const label = (text: string, x: number, y: number): LabelParts => {
    const group = createEl(root, "g");
    const line = createEl(group, "line", {
      x1: x,
      y1: y - 4,
      x2: x + 10,
      y2: y - 4,
      fill: "none",
      stroke: C.faint,
      "stroke-width": SW,
    });
    const labelText = createEl(group, "text", {
      x: x + 16,
      y,
      "font-family": MONO_FONT,
      "font-size": 10,
      "letter-spacing": ".06em",
      fill: C.label,
    });
    labelText.textContent = text;
    return { g: group, ln: line, t: labelText };
  };

  const labels = [
    label("01  STATIC FORM", F.x, 14),
    label("02  CONVERSATION", Ch.x, 14),
    label("03  CLEAN DATA", Tb.x, Tb.y - 16),
  ];

  // Form
  const form = createEl(root, "g");
  const formOut = strokeRect(form, {
    x: F.x + 0.5,
    y: F.y + 0.5,
    width: F.w - 1,
    height: F.h - 1,
  });
  const formTitle = createEl(form, "text", {
    x: F.x + 18,
    y: F.y + 30,
    "font-size": 12.5,
    "font-weight": 600,
    fill: C.muted,
  });
  formTitle.textContent = scenario.title;
  const formTitleLine = strokeLine(form, {
    x1: F.x + 18,
    y1: F.y + 42,
    x2: F.x + F.w - 18,
    y2: F.y + 42,
    stroke: C.faint,
  });

  const fields: FieldParts[] = scenario.fields.map(
    ([key, fieldLabel], index) => {
      const labelY = F.y + 70 + index * layout.fieldGap;
      const fieldText = createEl(form, "text", {
        x: F.x + 18,
        y: labelY,
        "font-size": 11,
        fill: C.text,
      });
      fieldText.textContent = `${fieldLabel} *`;
      const line = strokeLine(form, {
        x1: F.x + 18,
        y1: labelY + 22,
        x2: F.x + F.w - 18,
        y2: labelY + 22,
      });
      const tick = strokePath(form, {
        d: `M${F.x + F.w - 30},${labelY - 4} l3,3 l6,-6`,
        stroke: C.blue,
      });
      void key;
      return {
        t: fieldText,
        line,
        tick,
        y: labelY + 22,
        x0: F.x + 18,
        x1: F.x + F.w - 18,
      };
    },
  );

  const submitY = F.y + 70 + 4 * layout.fieldGap - 6;
  const formSubmit = strokeRect(form, {
    x: F.x + 18,
    y: submitY,
    width: 72,
    height: 22,
    rx: 2,
  });
  const formSubmitText = createEl(form, "text", {
    x: F.x + 54,
    y: submitY + 14.5,
    "font-family": MONO_FONT,
    "font-size": 9.5,
    "letter-spacing": ".06em",
    fill: C.label,
    "text-anchor": "middle",
  });
  formSubmitText.textContent = "SUBMIT";

  // Chat frame
  const chat = createEl(root, "g");
  const cornerLength = 10;
  const X0 = Ch.x;
  const X1 = Ch.x + Ch.w;
  const Y0 = Ch.y;
  const Y1 = Ch.y + Ch.h;
  const corners = [
    `M${X0},${Y0 + cornerLength} V${Y0} H${X0 + cornerLength}`,
    `M${X1 - cornerLength},${Y0} H${X1} V${Y0 + cornerLength}`,
    `M${X1},${Y1 - cornerLength} V${Y1} H${X1 - cornerLength}`,
    `M${X0 + cornerLength},${Y1} H${X0} V${Y1 - cornerLength}`,
  ].map((d) => strokePath(chat, { d }));

  const avatar = createEl(chat, "circle", {
    cx: X0 + 22,
    cy: Y0 + 20,
    r: 8,
    fill: "none",
    stroke: C.blue,
    "stroke-width": SW,
  });
  const avatarDot = createEl(chat, "circle", {
    cx: X0 + 22,
    cy: Y0 + 20,
    r: 2,
    fill: C.blue,
  });
  const chatName = createEl(chat, "text", {
    x: X0 + 38,
    y: Y0 + 24,
    "font-size": 12,
    "font-weight": 500,
    fill: C.ink,
  });
  chatName.textContent = scenario.chat;
  const chatLive = createEl(chat, "text", {
    x: X1 - 14,
    y: Y0 + 24,
    "font-family": MONO_FONT,
    "font-size": 9.5,
    "letter-spacing": ".06em",
    fill: C.blue,
    "text-anchor": "end",
  });
  chatLive.textContent = "LIVE";
  const chatHeadingLine = strokeLine(chat, {
    x1: X0 + 14,
    y1: Y0 + 38,
    x2: X1 - 14,
    y2: Y0 + 38,
    stroke: C.faint,
  });

  const inputY = Y1 - 14;
  const inputLine = strokeLine(chat, {
    x1: X0 + 14,
    y1: inputY,
    x2: X1 - 40,
    y2: inputY,
  });
  const send = strokePath(chat, {
    d: `M${X1 - 26},${inputY - 5} l6,-5 l-6,-5 M${X1 - 31},${inputY - 10} h11`,
  });
  const cursor = strokeLine(
    chat,
    {
      x1: X0 + 16,
      y1: inputY - 15,
      x2: X0 + 16,
      y2: inputY - 4,
    },
    C.ink,
  );

  const messageList = createEl(chat, "g", {
    mask: "url(#howItWorksChatMask)",
  });
  const peels = createEl(root, "g");

  const bubbleFontSize = layout.fs;
  const bubbleHeight = 28;
  const bubblePadding = 12;
  const maxBubbleWidth = Ch.w - 28;

  const messages: MessageParts[] = schedule.events.map((event) => {
    const textWidth = measureText(
      measurer,
      event.text,
      bubbleFontSize,
      event.kind === "user" ? 500 : 400,
    );
    const width = Math.min(maxBubbleWidth, textWidth + bubblePadding * 2);
    const group = createEl(messageList, "g");
    const color = event.kind === "ai" ? C.line : C.ink;
    const bubble = strokePath(
      group,
      {
        d: bubblePath(width, bubbleHeight, event.kind),
      },
      event.kind === "ai" && "followUp" in event && event.followUp
        ? C.blue
        : color,
    );

    const text = createEl(group, "text", {
      x: bubblePadding,
      y: 18.5,
      "font-size": bubbleFontSize,
      "font-weight": event.kind === "user" ? 500 : 400,
      fill:
        event.kind === "ai" && "followUp" in event && event.followUp
          ? C.blue
          : C.ink,
    });
    text.textContent = "";

    const parts: MessageParts = {
      event,
      g: group,
      bubble,
      text,
      width,
      height: bubbleHeight,
    };

    if (event.kind === "user") {
      parts.caret = strokeLine(group, { x1: 0, y1: 8, x2: 0, y2: 20 }, C.ink);
      if (event.vagueAt !== undefined) {
        parts.underline = strokePath(
          group,
          { d: `M${bubblePadding},23 h${textWidth}` },
          C.blue,
        );
      }
    }

    if (event.kind === "ai" && event.followUp) {
      parts.tag = createEl(group, "text", {
        x: width + 8,
        y: 18,
        "font-family": MONO_FONT,
        "font-size": 9,
        "letter-spacing": ".06em",
        fill: C.blue,
      });
      parts.tag.textContent = "↳ FOLLOW-UP";
    }

    if (event.kind === "ai" && !layout.mobile) {
      parts.peel = strokePath(peels, { d: "" }, C.blue);
    }

    return parts;
  });

  // Data table
  const table = createEl(root, "g");
  const rowCount = scenario.fields.length;
  const tableHeight = 30 + rowCount * Tb.rowH;
  const tableOut = strokeRect(table, {
    x: Tb.x + 0.5,
    y: Tb.y + 0.5,
    width: Tb.w - 1,
    height: tableHeight - 1,
  });
  const tableHeader = createEl(table, "text", {
    x: Tb.x + 12,
    y: Tb.y + 19,
    "font-family": MONO_FONT,
    "font-size": 9.5,
    "letter-spacing": ".06em",
    fill: C.text,
  });
  tableHeader.textContent = "NEW RESPONSE";
  const tableCount = createEl(table, "text", {
    x: Tb.x + Tb.w - 12,
    y: Tb.y + 19,
    "font-family": MONO_FONT,
    "font-size": 9.5,
    "letter-spacing": ".06em",
    fill: C.label,
    "text-anchor": "end",
  });
  tableCount.textContent = `0/${rowCount}`;
  const tableColumn = strokeLine(
    table,
    {
      x1: Tb.x + Tb.w - 40,
      y1: Tb.y + 30,
      x2: Tb.x + Tb.w - 40,
      y2: Tb.y + tableHeight,
    },
    C.faint,
  );

  const rows: TableRowParts[] = scenario.fields.map(([key], index) => {
    const rowY = Tb.y + 30 + index * Tb.rowH;
    const line = strokeLine(
      table,
      {
        x1: Tb.x,
        y1: rowY,
        x2: Tb.x + Tb.w,
        y2: rowY,
      },
      index === 0 ? C.line : C.faint,
    );
    const keyText = createEl(table, "text", {
      x: Tb.x + 12,
      y: rowY + 21,
      "font-family": MONO_FONT,
      "font-size": 9.5,
      "letter-spacing": ".06em",
      fill: C.label,
    });
    keyText.textContent = key.toUpperCase();
    const value = createEl(table, "text", {
      x: Tb.x + 12,
      y: rowY + Tb.rowH - 15,
      "font-size": 13.5,
      "font-weight": 500,
      fill: C.faint,
    });
    value.textContent = "—";
    const cx = Tb.x + Tb.w - 20;
    const cy = rowY + Tb.rowH / 2;
    const box = createEl(table, "circle", {
      cx,
      cy,
      r: 7,
      fill: "none",
      stroke: C.faint,
      "stroke-width": SW,
    });
    const tick = strokePath(
      table,
      { d: `M${cx - 3.5},${cy} l2.5,2.6 l4.8,-5` },
      C.blue,
    );
    const ring = strokeCircle(table, { cx, cy, r: 7 }, C.blue);
    const edge = strokeLine(
      table,
      {
        x1: Tb.x,
        y1: rowY + 6,
        x2: Tb.x,
        y2: rowY + Tb.rowH - 6,
      },
      C.blue,
    );
    edge.setAttribute("stroke-width", "2");

    return {
      line,
      key: keyText,
      value,
      box,
      tick,
      ring,
      edge,
      y: rowY,
      cx,
      cy,
    };
  });

  // Flow lines
  const flow = createEl(root, "g");
  let flowDefinitions: Array<[string, string]>;
  const arrowRight = (x: number, y: number) =>
    `M${x - 5},${y - 4} L${x},${y} L${x - 5},${y + 4}`;
  const arrowDown = (x: number, y: number) =>
    `M${x - 4},${y - 5} L${x},${y} L${x + 4},${y - 5}`;

  if (!layout.mobile) {
    const flowY = 10;
    const firstLabelEnd =
      F.x + 16 + measureText(measurer, "01  STATIC FORM", 10, 400, true) + 18;
    const secondLabelEnd =
      Ch.x + 16 + measureText(measurer, "02  CONVERSATION", 10, 400, true) + 18;
    flowDefinitions = [
      [
        `M${firstLabelEnd},${flowY} H${Ch.x - 14}`,
        arrowRight(Ch.x - 14, flowY),
      ],
      [
        `M${secondLabelEnd},${flowY} H${Tb.x - 14}`,
        arrowRight(Tb.x - 14, flowY),
      ],
    ];
  } else {
    const center = layout.W / 2;
    flowDefinitions = [
      [`M${center},${Y1 + 10} V${Tb.y - 30}`, arrowDown(center, Tb.y - 30)],
    ];
  }

  const flows: Array<[SVGPathElement, SVGPathElement]> = flowDefinitions.map(
    ([line, arrow]) => [
      strokePath(flow, { d: line }, C.faint),
      strokePath(flow, { d: arrow }, C.faint),
    ],
  );

  const travelGroup = createEl(root, "g");
  const travels: TravelParts[] = schedule.saves.map(() => ({
    path: strokePath(travelGroup, { d: "" }, C.blue),
    dot: createEl(travelGroup, "circle", { r: 2.6, fill: C.blue }),
    halo: strokeCircle(travelGroup, { r: 6 }, C.blueFaint),
  }));

  return {
    root,
    labels,
    form,
    fOut: formOut,
    fTitle: formTitle,
    fTitleLine: formTitleLine,
    fields,
    fSubmit: formSubmit,
    fSubmitText: formSubmitText,
    chat,
    corners,
    avatar,
    avatarDot,
    chatName,
    chatLive,
    chatHeadingLine,
    inputLine,
    send,
    cursor,
    messageList,
    peels,
    messages,
    table,
    tableOut,
    tableHeader,
    tableCount,
    tableColumn,
    rows,
    tableHeight,
    flows,
    travels,
    messageArea: { top: areaTop, bottom: areaBottom },
    measurer,
  };
}

function measureText(
  measurer: SVGTextElement,
  value: string,
  size: number,
  weight = 400,
  mono = false,
) {
  measurer.setAttribute("font-size", String(size));
  measurer.setAttribute("font-weight", String(weight));
  measurer.setAttribute("font-family", mono ? MONO_FONT : BODY_FONT);
  measurer.textContent = value;
  return measurer.getComputedTextLength();
}

function bubblePath(width: number, height: number, side: "ai" | "user") {
  const radius = 9;
  return side === "ai"
    ? `M0,${height} V${radius} Q0,0 ${radius},0 H${width - radius} Q${width},0 ${width},${radius} V${height - radius} Q${width},${height} ${width - radius},${height} Z`
    : `M${width},${height} V${radius} Q${width},0 ${width - radius},0 H${radius} Q0,0 0,${radius} V${height - radius} Q0,${height} ${radius},${height} Z`;
}

const pathLengths = new WeakMap<SVGGeometryElement, number>();

function lengthOf(element: SVGGeometryElement) {
  const cached = pathLengths.get(element);
  if (cached != null) return cached;

  const length = element.getTotalLength() + 1;
  pathLengths.set(element, length);
  return length;
}

function resetLength(element: SVGGeometryElement) {
  pathLengths.delete(element);
}

function draw(element: Drawable, amount: number) {
  const length = lengthOf(element);
  element.style.strokeDasharray = String(length);
  element.style.strokeDashoffset = String(length * (1 - clamp(amount)));
  element.style.opacity = amount <= 0 ? "0" : "";
}

type SvgAttributes = Record<string, string | number>;

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

function strokeLine(
  parent: Element,
  attributes: SvgAttributes,
  color: string = C.line,
) {
  return createEl(parent, "line", {
    fill: "none",
    stroke: color,
    "stroke-width": SW,
    "stroke-linecap": "round",
    ...attributes,
  });
}

function strokeRect(
  parent: Element,
  attributes: SvgAttributes,
  color: string = C.line,
) {
  return createEl(parent, "rect", {
    fill: "none",
    stroke: color,
    "stroke-width": SW,
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    ...attributes,
  });
}

function strokePath(
  parent: Element,
  attributes: SvgAttributes,
  color: string = C.line,
) {
  return createEl(parent, "path", {
    fill: "none",
    stroke: color,
    "stroke-width": SW,
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    ...attributes,
  });
}

function strokeCircle(
  parent: Element,
  attributes: SvgAttributes,
  color: string = C.line,
) {
  return createEl(parent, "circle", {
    fill: "none",
    stroke: color,
    "stroke-width": SW,
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    ...attributes,
  });
}
