import {
  type HowItWorksScenario,
  getScenario,
  savedValueForField,
  scheduleScenario,
} from "./scenarios";

const BODY_FONT = "var(--font-inter), system-ui, sans-serif";
const MONO_FONT = "var(--font-jetbrains-mono), ui-monospace, monospace";
const SW = 1.25;

const scenario = getScenario(0);
const schedule = scheduleScenario(scenario);

type Rect = { x: number; y: number; w: number; h: number };
type TableRect = { x: number; y: number; w: number; rowH: number };
type Layout = {
  W: number;
  H: number;
  form: Rect;
  chat: Rect;
  table: TableRect;
  fieldGap: number;
  fs: number;
};

const DESKTOP: Layout = {
  W: 1080,
  H: 336,
  form: { x: 0, y: 30, w: 236, h: 300 },
  chat: { x: 300, y: 30, w: 440, h: 300 },
  table: { x: 800, y: 30, w: 280, rowH: 60 },
  fieldGap: 52,
  fs: 12.5,
};

const MOBILE: Layout = {
  W: 345,
  H: 664,
  form: { x: 0, y: 30, w: 345, h: 310 },
  chat: { x: 0, y: 30, w: 345, h: 310 },
  table: { x: 0, y: 398, w: 345, rowH: 54 },
  fieldGap: 54,
  fs: 12.5,
};

// The first frame of the animation: desktop holds the drawn form, mobile holds
// the conversation after the form has retracted. The reduced-motion frame is
// the fully informative end of the same hairline drawing. Keep these in sync
// with `HOW_IT_WORKS_START_CLOCK` in `scenarios.ts`.
const CLOCK = {
  desktopStart: {
    flow: [1, 0.148, 0.684, 0],
    input: 1,
    send: 1,
    live: 0.94,
    cursor: 0.875,
  },
  mobileStart: {
    flow: [1, 0.9815],
    input: 0.9606,
    send: 0.2109,
    live: 0.553,
    cursor: 0,
  },
} as const;

function estimateTextWidth(text: string, fontSize: number) {
  return text.length * fontSize * 0.58;
}

function estimateMonoTextWidth(text: string, fontSize: number) {
  return text.length * fontSize * 0.6;
}

function bubblePath(width: number, height: number, side: "ai" | "user") {
  const radius = 9;
  return side === "ai"
    ? `M0,${height} V${radius} Q0,0 ${radius},0 H${width - radius} Q${width},0 ${width},${radius} V${height - radius} Q${width},${height} ${width - radius},${height} Z`
    : `M${width},${height} V${radius} Q${width},0 ${width - radius},0 H${radius} Q0,0 0,${radius} V${height - radius} Q0,${height} ${radius},${height} Z`;
}

function estimatedDraw(progress: number) {
  return {
    pathLength: 1,
    strokeDasharray: 1,
    strokeDashoffset: 1 - progress,
    opacity: progress > 0 ? 1 : 0,
  };
}

function StageLabel({
  number,
  children,
  x,
  y,
  active,
}: {
  number: string;
  children: string;
  x: number;
  y: number;
  active: boolean;
}) {
  return (
    <g>
      <line
        x1={x}
        y1={y - 4}
        x2={x + 10}
        y2={y - 4}
        fill="none"
        stroke={active ? "var(--marketing-blue-600)" : "var(--marketing-hair)"}
        strokeWidth={SW}
      />
      <text
        x={x + 16}
        y={y}
        fill={active ? "var(--marketing-blue-600)" : "var(--marketing-label)"}
        fontFamily={MONO_FONT}
        fontSize={10}
        letterSpacing=".06em"
      >
        {`${number}  ${children}`}
      </text>
    </g>
  );
}

function FormFrame({
  layout,
  filled,
  dimmed,
}: {
  layout: Layout;
  filled: boolean;
  dimmed: boolean;
}) {
  const { form: F, fieldGap } = layout;
  const submitY = F.y + 70 + 4 * fieldGap - 6;

  return (
    <g opacity={dimmed ? 0.6 : 1}>
      <rect
        x={F.x + 0.5}
        y={F.y + 0.5}
        width={F.w - 1}
        height={F.h - 1}
        fill="none"
        stroke="var(--marketing-slate)"
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <text
        x={F.x + 18}
        y={F.y + 30}
        fill="var(--marketing-muted)"
        fontSize={12.5}
        fontWeight={600}
      >
        {scenario.title}
      </text>
      <line
        x1={F.x + 18}
        y1={F.y + 42}
        x2={F.x + F.w - 18}
        y2={F.y + 42}
        fill="none"
        stroke="var(--marketing-hair)"
        strokeWidth={SW}
        strokeLinecap="round"
      />

      {scenario.fields.map(([key, label], index) => {
        const labelY = F.y + 70 + index * fieldGap;
        return (
          <g key={key}>
            <text
              x={F.x + 18}
              y={labelY}
              fill="var(--marketing-text)"
              fontSize={11}
            >
              {`${label} *`}
            </text>
            <line
              x1={F.x + 18}
              y1={labelY + 22}
              x2={F.x + F.w - 18}
              y2={labelY + 22}
              fill="none"
              stroke={
                filled ? "var(--marketing-hair)" : "var(--marketing-slate)"
              }
              strokeWidth={SW}
              strokeLinecap="round"
              strokeDasharray={filled ? "2 4" : undefined}
            />
            {filled ? (
              <path
                d={`M${F.x + F.w - 30},${labelY - 4} l3,3 l6,-6`}
                fill="none"
                stroke="var(--marketing-blue-600)"
                strokeWidth={SW}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}
          </g>
        );
      })}

      <rect
        x={F.x + 18}
        y={submitY}
        width={72}
        height={22}
        rx={2}
        fill="none"
        stroke="var(--marketing-slate)"
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <text
        x={F.x + 54}
        y={submitY + 14.5}
        fill="var(--marketing-label)"
        fontFamily={MONO_FONT}
        fontSize={9.5}
        letterSpacing=".06em"
        textAnchor="middle"
      >
        SUBMIT
      </text>
    </g>
  );
}

function ChatFrame({
  layout,
  inputProgress,
  sendProgress,
  liveOpacity,
  cursorOpacity,
}: {
  layout: Layout;
  inputProgress: number;
  sendProgress: number;
  liveOpacity: number;
  cursorOpacity: number;
}) {
  const { chat: Ch } = layout;
  const X0 = Ch.x;
  const X1 = Ch.x + Ch.w;
  const Y0 = Ch.y;
  const Y1 = Ch.y + Ch.h;
  const cornerLength = 10;
  const inputY = Y1 - 14;

  return (
    <g>
      {[
        `M${X0},${Y0 + cornerLength} V${Y0} H${X0 + cornerLength}`,
        `M${X1 - cornerLength},${Y0} H${X1} V${Y0 + cornerLength}`,
        `M${X1},${Y1 - cornerLength} V${Y1} H${X1 - cornerLength}`,
        `M${X0 + cornerLength},${Y1} H${X0} V${Y1 - cornerLength}`,
      ].map((d) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke="var(--marketing-slate)"
          strokeWidth={SW}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      <circle
        cx={X0 + 22}
        cy={Y0 + 20}
        r={8}
        fill="none"
        stroke="var(--marketing-blue-600)"
        strokeWidth={SW}
      />
      <circle
        cx={X0 + 22}
        cy={Y0 + 20}
        r={2}
        fill="var(--marketing-blue-600)"
      />
      <text
        x={X0 + 38}
        y={Y0 + 24}
        fill="var(--marketing-ink)"
        fontSize={12}
        fontWeight={500}
      >
        {scenario.chat}
      </text>
      <text
        x={X1 - 14}
        y={Y0 + 24}
        fill="var(--marketing-blue-600)"
        fillOpacity={liveOpacity}
        fontFamily={MONO_FONT}
        fontSize={9.5}
        letterSpacing=".06em"
        textAnchor="end"
      >
        LIVE
      </text>
      <line
        x1={X0 + 14}
        y1={Y0 + 38}
        x2={X1 - 14}
        y2={Y0 + 38}
        fill="none"
        stroke="var(--marketing-hair)"
        strokeWidth={SW}
        strokeLinecap="round"
      />
      <line
        x1={X0 + 14}
        y1={inputY}
        x2={X1 - 40}
        y2={inputY}
        fill="none"
        stroke="var(--marketing-slate)"
        strokeWidth={SW}
        strokeLinecap="round"
        {...estimatedDraw(inputProgress)}
      />
      <path
        d={`M${X1 - 26},${inputY - 5} l6,-5 l-6,-5 M${X1 - 31},${inputY - 10} h11`}
        fill="none"
        stroke="var(--marketing-slate)"
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...estimatedDraw(sendProgress)}
      />
      <line
        x1={X0 + 16}
        y1={inputY - 15}
        x2={X0 + 16}
        y2={inputY - 4}
        fill="none"
        opacity={cursorOpacity}
        stroke="var(--marketing-ink)"
        strokeWidth={SW}
        strokeLinecap="round"
      />
    </g>
  );
}

function ChatMessages({
  layout,
  id,
}: {
  layout: Layout;
  id: string;
}) {
  const { chat: Ch } = layout;
  const areaTop = Ch.y + 46;
  const areaBottom = Ch.y + Ch.h - 44;
  const gap = 10;
  const areaHeight = areaBottom - areaTop - 4;
  const messageHeight = 28;
  const total = schedule.events.length;
  const scroll = Math.max(0, total * (messageHeight + gap) - gap - areaHeight);
  const maxWidth = Ch.w - 28;
  const fadeId = `${id}-fade`;
  const maskId = `${id}-mask`;

  return (
    <>
      <defs>
        <linearGradient
          id={fadeId}
          gradientUnits="userSpaceOnUse"
          x1={0}
          y1={areaTop}
          x2={0}
          y2={areaTop + 26}
        >
          <stop
            offset="0"
            stopColor="var(--marketing-surface)"
            stopOpacity="0"
          />
          <stop offset="1" stopColor="var(--marketing-surface)" />
        </linearGradient>
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x={Ch.x - 20}
          y={areaTop}
          width={Ch.w + 40}
          height={areaBottom - areaTop}
        >
          <rect
            x={Ch.x - 20}
            y={areaTop}
            width={Ch.w + 40}
            height={areaBottom - areaTop}
            fill={`url(#${fadeId})`}
          />
        </mask>
      </defs>

      <g mask={`url(#${maskId})`}>
        {schedule.events.map((event, index) => {
          const textWidth = estimateTextWidth(event.text, layout.fs);
          const width = Math.min(maxWidth, textWidth + 24);
          const x = event.kind === "ai" ? Ch.x + 14 : Ch.x + Ch.w - 14 - width;
          const y = areaTop + 2 + index * (messageHeight + gap) - scroll;
          const followUp = event.kind === "ai" && event.followUp;

          return (
            <g
              key={`${event.kind}-${index}`}
              transform={`translate(${x},${y})`}
            >
              <path
                d={bubblePath(width, messageHeight, event.kind)}
                fill="none"
                stroke={
                  followUp
                    ? "var(--marketing-blue-600)"
                    : event.kind === "ai"
                      ? "var(--marketing-slate)"
                      : "var(--marketing-ink)"
                }
                strokeWidth={SW}
                strokeLinejoin="round"
              />
              <text
                x={12}
                y={18.5}
                fill={
                  followUp
                    ? "var(--marketing-blue-600)"
                    : "var(--marketing-ink)"
                }
                fontSize={layout.fs}
                fontWeight={event.kind === "user" ? 500 : 400}
              >
                {event.text}
              </text>
              {event.kind === "user" && event.vagueAt !== undefined ? (
                <path
                  d={`M12,23 h${textWidth}`}
                  fill="none"
                  stroke="var(--marketing-blue-600)"
                  strokeWidth={SW}
                  strokeLinecap="round"
                />
              ) : null}
              {followUp ? (
                <text
                  x={width + 8}
                  y={18}
                  fill="var(--marketing-blue-600)"
                  fontFamily={MONO_FONT}
                  fontSize={9}
                  letterSpacing=".06em"
                >
                  ↳ FOLLOW-UP
                </text>
              ) : null}
            </g>
          );
        })}
      </g>
    </>
  );
}

function TableFrame({
  data,
  layout,
  filled,
  valueOpacity,
}: {
  data: HowItWorksScenario;
  layout: Layout;
  filled: boolean;
  valueOpacity?: readonly number[];
}) {
  const { table: Tb } = layout;
  const featureField = data.conversation.find((step) => step.followUp)?.field;
  const tableHeight = 30 + data.fields.length * Tb.rowH;

  return (
    <g>
      <rect
        x={Tb.x + 0.5}
        y={Tb.y + 0.5}
        width={Tb.w - 1}
        height={tableHeight - 1}
        fill="none"
        stroke="var(--marketing-slate)"
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <text
        x={Tb.x + 12}
        y={Tb.y + 19}
        fill="var(--marketing-text)"
        fontFamily={MONO_FONT}
        fontSize={9.5}
        letterSpacing=".06em"
      >
        NEW RESPONSE
      </text>
      <text
        x={Tb.x + Tb.w - 12}
        y={Tb.y + 19}
        fill={filled ? "var(--marketing-blue-600)" : "var(--marketing-label)"}
        fontFamily={MONO_FONT}
        fontSize={9.5}
        letterSpacing=".06em"
        textAnchor="end"
      >
        {filled
          ? `${data.fields.length}/${data.fields.length} ✓`
          : `0/${data.fields.length}`}
      </text>
      <line
        x1={Tb.x + Tb.w - 40}
        y1={Tb.y + 30}
        x2={Tb.x + Tb.w - 40}
        y2={Tb.y + tableHeight}
        fill="none"
        stroke="var(--marketing-hair)"
        strokeWidth={SW}
        strokeLinecap="round"
      />

      {data.fields.map(([key], index) => {
        const rowY = Tb.y + 30 + index * Tb.rowH;
        const cx = Tb.x + Tb.w - 20;
        const cy = rowY + Tb.rowH / 2;
        const isFeature = filled && index === featureField;

        return (
          <g key={key}>
            <line
              x1={Tb.x}
              y1={rowY}
              x2={Tb.x + Tb.w}
              y2={rowY}
              fill="none"
              stroke={
                index === 0 ? "var(--marketing-slate)" : "var(--marketing-hair)"
              }
              strokeWidth={SW}
              strokeLinecap="round"
            />
            <text
              x={Tb.x + 12}
              y={rowY + 21}
              fill={
                isFeature
                  ? "var(--marketing-blue-600)"
                  : "var(--marketing-label)"
              }
              fontFamily={MONO_FONT}
              fontSize={9.5}
              letterSpacing=".06em"
            >
              {key.toUpperCase()}
            </text>
            <text
              x={Tb.x + 12}
              y={rowY + Tb.rowH - 15}
              fill={
                filled
                  ? isFeature
                    ? "var(--marketing-blue-600)"
                    : "var(--marketing-ink)"
                  : "var(--marketing-hair)"
              }
              fillOpacity={valueOpacity?.[index] ?? 1}
              fontSize={13.5}
              fontWeight={500}
            >
              {filled ? savedValueForField(data, index) : "—"}
            </text>
            <circle
              cx={cx}
              cy={cy}
              r={7}
              fill="none"
              stroke={
                filled ? "var(--marketing-blue-600)" : "var(--marketing-hair)"
              }
              strokeWidth={SW}
            />
            {filled ? (
              <path
                d={`M${cx - 3.5},${cy} l2.5,2.6 l4.8,-5`}
                fill="none"
                stroke="var(--marketing-blue-600)"
                strokeWidth={SW}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}
          </g>
        );
      })}
    </g>
  );
}

function FlowLines({
  mobile,
  layout,
  progress: amounts,
}: {
  mobile: boolean;
  layout: Layout;
  progress: readonly number[];
}) {
  if (mobile) {
    const x = layout.W / 2;
    const y1 = layout.chat.y + layout.chat.h + 10;
    const y2 = layout.table.y - 30;
    return (
      <g>
        <path
          d={`M${x},${y1} V${y2}`}
          fill="none"
          stroke="var(--marketing-hair)"
          strokeWidth={SW}
          strokeLinecap="round"
          {...estimatedDraw(amounts[0] ?? 0)}
        />
        <path
          d={`M${x - 4},${y2 - 5} L${x},${y2} L${x + 4},${y2 - 5}`}
          fill="none"
          stroke="var(--marketing-hair)"
          strokeWidth={SW}
          strokeLinecap="round"
          strokeLinejoin="round"
          {...estimatedDraw(amounts[1] ?? 0)}
        />
      </g>
    );
  }

  const flowY = 10;
  const firstLabelEnd =
    layout.form.x + 16 + estimateMonoTextWidth("01  STATIC FORM", 10) + 18;
  const secondLabelEnd =
    layout.chat.x + 16 + estimateMonoTextWidth("02  CONVERSATION", 10) + 18;
  const firstEnd = layout.chat.x - 14;
  const secondEnd = layout.table.x - 14;

  return (
    <g>
      <path
        d={`M${firstLabelEnd},${flowY} H${firstEnd}`}
        fill="none"
        stroke="var(--marketing-hair)"
        strokeWidth={SW}
        strokeLinecap="round"
        {...estimatedDraw(amounts[0] ?? 0)}
      />
      <path
        d={`M${firstEnd - 5},${flowY - 4} L${firstEnd},${flowY} L${firstEnd - 5},${flowY + 4}`}
        fill="none"
        stroke="var(--marketing-hair)"
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...estimatedDraw(amounts[1] ?? 0)}
      />
      <path
        d={`M${secondLabelEnd},${flowY} H${secondEnd}`}
        fill="none"
        stroke="var(--marketing-hair)"
        strokeWidth={SW}
        strokeLinecap="round"
        {...estimatedDraw(amounts[2] ?? 0)}
      />
      <path
        d={`M${secondEnd - 5},${flowY - 4} L${secondEnd},${flowY} L${secondEnd - 5},${flowY + 4}`}
        fill="none"
        stroke="var(--marketing-hair)"
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...estimatedDraw(amounts[3] ?? 0)}
      />
    </g>
  );
}

function Scene({
  mobile,
  final,
}: {
  mobile: boolean;
  final: boolean;
}) {
  const layout = mobile ? MOBILE : DESKTOP;
  const clock = mobile
    ? final
      ? { flow: [1, 1], input: 1, send: 1, live: 1, cursor: 0.15 }
      : CLOCK.mobileStart
    : final
      ? { flow: [1, 1, 1, 1], input: 1, send: 1, live: 1, cursor: 0.15 }
      : CLOCK.desktopStart;
  const id = `how-it-works-${final ? "final" : "start"}-${mobile ? "mobile" : "desktop"}`;
  const valueOpacity =
    final || mobile
      ? undefined
      : scenario.fields.map((_, index) => {
          const appear = 0.42 + index * 0.05;
          const amount = Math.min(
            1,
            Math.max(0, (0.95 - (appear + 0.3)) / 0.25),
          );
          return 1 - (1 - amount) ** 3;
        });

  return (
    <svg
      viewBox={`0 0 ${layout.W} ${layout.H}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full overflow-visible"
      style={{ fontFamily: BODY_FONT }}
    >
      {mobile ? (
        <>
          <StageLabel number="02" x={layout.chat.x} y={14} active={!final}>
            CONVERSATION
          </StageLabel>
          <StageLabel
            number="03"
            x={layout.table.x}
            y={layout.table.y - 16}
            active={final}
          >
            CLEAN DATA
          </StageLabel>
        </>
      ) : (
        <>
          <StageLabel number="01" x={layout.form.x} y={14} active={!final}>
            STATIC FORM
          </StageLabel>
          <StageLabel number="02" x={layout.chat.x} y={14} active={false}>
            CONVERSATION
          </StageLabel>
          <StageLabel
            number="03"
            x={layout.table.x}
            y={layout.table.y - 16}
            active={final}
          >
            CLEAN DATA
          </StageLabel>
        </>
      )}

      {!mobile ? (
        <FormFrame layout={layout} filled={final} dimmed={final} />
      ) : null}

      <ChatFrame
        layout={layout}
        inputProgress={clock.input}
        sendProgress={clock.send}
        liveOpacity={clock.live}
        cursorOpacity={clock.cursor}
      />

      {final ? <ChatMessages layout={layout} id={id} /> : null}

      <TableFrame
        data={scenario}
        layout={layout}
        filled={final}
        valueOpacity={valueOpacity}
      />
      <FlowLines mobile={mobile} layout={layout} progress={clock.flow} />
    </svg>
  );
}

/**
 * The How-it-works stage. `start` matches the first frame of the animation at
 * each breakpoint; `final` is the fully informative hairline frame used for
 * reduced motion.
 */
export function HowItWorksStatic({
  variant = "final",
}: {
  variant?: "start" | "final";
}) {
  return (
    <div aria-hidden="true" className="absolute inset-0">
      <div className="hidden h-full min-[900px]:block">
        <Scene mobile={false} final={variant === "final"} />
      </div>
      <div className="h-full min-[900px]:hidden">
        <Scene mobile final={variant === "final"} />
      </div>
    </div>
  );
}
