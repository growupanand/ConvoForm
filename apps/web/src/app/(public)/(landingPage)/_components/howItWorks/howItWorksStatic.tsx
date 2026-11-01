import { cn } from "@/lib/utils";

import {
  type HowItWorksScenario,
  getScenario,
  savedValueForField,
} from "./scenarios";

const scenario = getScenario(0);

function StageLabel({
  number,
  children,
  active = false,
}: {
  number: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex items-center gap-2 font-mono text-[9px] uppercase leading-none tracking-[0.1em]",
        active ? "text-marketing-blue-600" : "text-marketing-slate",
      )}
    >
      <span
        className={cn(
          "h-px w-2.5",
          active ? "bg-marketing-blue-600" : "bg-marketing-hair",
        )}
      />
      {number} {children}
    </div>
  );
}

function SavedTick({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={cn("size-3.5 shrink-0", className)}
    >
      <circle
        cx="8"
        cy="8"
        r="6.5"
        className="stroke-marketing-blue-600"
        strokeWidth="1.25"
      />
      <path
        d="M5.2 8.2 6.9 9.9 10.8 6"
        className="stroke-marketing-blue-600"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StaticForm({
  data,
  filled,
}: {
  data: HowItWorksScenario;
  filled: boolean;
}) {
  return (
    <div className="flex h-full flex-col rounded-[4px] border border-marketing-hair bg-marketing-hair-soft p-4">
      <div className="flex items-center justify-between gap-2 border-b border-marketing-hair pb-3">
        <span className="truncate font-body text-[13px] font-semibold leading-none text-marketing-muted">
          {data.title}
        </span>
        <span className="font-mono text-[9px] uppercase leading-none tracking-[0.08em] text-marketing-slate">
          Static form
        </span>
      </div>

      <div className="mt-4 flex flex-1 flex-col justify-center gap-3">
        {data.fields.map(([key, label], index) => (
          <div key={key} className="flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <div className="truncate font-body text-[11px] leading-none text-marketing-text">
                {label} *
              </div>
              <div className="mt-1.5 h-[13px] truncate border-b border-marketing-hair pb-1 font-body text-[12px] font-medium leading-none text-marketing-ink">
                {filled ? savedValueForField(data, index) : null}
              </div>
            </div>
            {filled ? <SavedTick /> : <span className="size-3.5 shrink-0" />}
          </div>
        ))}
      </div>

      <div className="mt-4 inline-flex h-[22px] w-fit items-center rounded-[2px] border border-marketing-hair px-3 font-mono text-[9px] uppercase leading-none text-marketing-slate">
        Submit
      </div>
    </div>
  );
}

function StaticChat({
  data,
  filled,
}: {
  data: HowItWorksScenario;
  filled: boolean;
}) {
  const featured =
    data.conversation.find((step) => step.followUp) ?? data.conversation[0];
  if (!featured) return null;

  const chips = data.fields
    .map(([key], index) => ({
      key,
      value: savedValueForField(data, index),
    }))
    .filter((chip) => chip.value)
    .slice(0, 2);

  return (
    <div className="flex h-full flex-col rounded-[22px] border-[1.25px] border-marketing-blue-200 bg-white/90 p-3 shadow-[0_22px_50px_-30px_rgba(37,99,235,0.4)]">
      <div className="flex items-center gap-2 border-b border-slate-100 px-0.5 pb-2.5 pt-0.5">
        <span className="grid size-6 shrink-0 place-items-center rounded-full border-[1.25px] border-marketing-blue-600">
          <span className="size-1.5 rounded-full bg-marketing-blue-600" />
        </span>
        <span className="truncate font-body text-[13px] font-semibold leading-none text-marketing-ink">
          {data.chat}
        </span>
        <span className="ml-auto flex shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase leading-none tracking-[0.06em] text-marketing-blue-600">
          <span className="size-1.5 rounded-full bg-marketing-blue-600" />
          Live
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-[7px] py-2">
        {filled ? (
          <>
            <div className="w-fit max-w-[80%] self-start rounded-2xl rounded-bl-[5px] border-[1.25px] border-marketing-hair bg-white px-3 py-2 font-body text-[13px] leading-[1.35] text-marketing-ink">
              {featured.question}
            </div>
            <div className="w-fit max-w-[80%] self-end rounded-2xl rounded-br-[5px] border-[1.25px] border-marketing-ink bg-white px-3 py-2 font-body text-[13px] font-medium leading-[1.35] text-marketing-ink">
              <span className="underline decoration-marketing-blue-600 decoration-[1.25px] underline-offset-[3px]">
                {featured.answer}
              </span>
            </div>
            <div className="w-fit max-w-[85%] self-start rounded-2xl rounded-bl-[5px] border-[1.25px] border-marketing-blue-300 bg-marketing-blue-50 px-3 py-2 font-body text-[13px] leading-[1.35] text-marketing-blue-700">
              <span className="mb-1 block font-mono text-[9px] uppercase leading-none tracking-[0.08em] text-marketing-blue-600">
                ↳ Follow-up
              </span>
              {featured.followUp}
            </div>
            <div className="w-fit max-w-[80%] self-end rounded-2xl rounded-br-[5px] border-[1.25px] border-marketing-ink bg-white px-3 py-2 font-body text-[13px] font-medium leading-[1.35] text-marketing-ink">
              {featured.followUpAnswer}
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="h-[42px] w-full rounded-[4px] border-[1.25px] border-dashed border-marketing-hair" />
            <div className="h-[38px] w-2/3 rounded-[4px] border-[1.25px] border-dashed border-marketing-hair" />
          </div>
        )}
      </div>

      <div className="flex min-h-9 flex-wrap gap-1.5 border-t border-dashed border-marketing-hair-soft pt-2.5">
        {filled ? (
          chips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1.5 rounded-full border border-marketing-hair-soft bg-marketing-surface px-2.5 py-1.5 font-body text-[11px] font-medium leading-none text-marketing-muted"
            >
              {chip.key}:{" "}
              <b className="font-semibold text-marketing-ink">{chip.value}</b>
              <SavedTick className="size-2.5" />
            </span>
          ))
        ) : (
          <span className="inline-flex items-center gap-1.5 self-center font-mono text-[9.5px] uppercase leading-none tracking-[0.06em] text-marketing-slate">
            <span className="h-3 w-px bg-marketing-ink" />
            Waiting for an answer
          </span>
        )}
      </div>
    </div>
  );
}

function StaticTable({
  data,
  filled,
}: {
  data: HowItWorksScenario;
  filled: boolean;
}) {
  const featuredField = data.conversation.find((step) => step.followUp)?.field;

  return (
    <div className="h-full overflow-hidden rounded-[4px] border border-marketing-hair bg-white">
      <div className="flex items-center justify-between gap-2 border-b border-marketing-hair px-3 py-2 font-mono text-[9px] uppercase leading-none tracking-[0.08em]">
        <span className="text-marketing-text">New response</span>
        <span
          className={cn(
            filled ? "text-marketing-blue-600" : "text-marketing-slate",
          )}
        >
          {filled
            ? `${data.fields.length}/${data.fields.length} ✓`
            : `0/${data.fields.length}`}
        </span>
      </div>

      {data.fields.map(([key], index) => {
        const isFeatured = filled && index === featuredField;
        return (
          <div
            key={key}
            className="flex items-center gap-2 border-b border-marketing-hair-soft px-3 py-[7px] last:border-b-0"
          >
            <div className="min-w-0 flex-1">
              <div
                className={cn(
                  "font-mono text-[9px] uppercase leading-none tracking-[0.08em]",
                  isFeatured
                    ? "text-marketing-blue-600"
                    : "text-marketing-slate",
                )}
              >
                {key}
              </div>
              <div
                className={cn(
                  "mt-1.5 h-[13px] truncate font-body text-[13px] font-medium leading-none",
                  isFeatured ? "text-marketing-blue-600" : "text-marketing-ink",
                )}
              >
                {filled ? savedValueForField(data, index) : "—"}
              </div>
            </div>
            {filled ? (
              <SavedTick />
            ) : (
              <span className="size-3.5 shrink-0 rounded-full border border-marketing-hair-soft" />
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * The How-it-works stage. The `start` variant matches the first frame of the
 * animation; the default `final` variant is the fully informative frame used
 * for reduced motion.
 */
export function HowItWorksStatic({
  variant = "final",
}: {
  variant?: "start" | "final";
}) {
  const filled = variant === "final";

  return (
    <div aria-hidden="true" className="absolute inset-0">
      {/* Desktop: form -> conversation -> clean data */}
      <div className="hidden h-full items-center min-[900px]:flex">
        <div className="grid h-full w-full grid-cols-[minmax(0,236fr)_24px_minmax(0,440fr)_24px_minmax(0,280fr)] items-center gap-3">
          <div className="flex min-w-0 flex-col gap-2">
            <StageLabel number="01">Static form</StageLabel>
            <div className="h-[300px] min-w-0">
              <StaticForm data={scenario} filled={filled} />
            </div>
          </div>

          <FlowArrow />

          <div className="flex min-w-0 flex-col gap-2">
            <StageLabel number="02">Conversation</StageLabel>
            <div className="h-[300px] min-w-0">
              <StaticChat data={scenario} filled={filled} />
            </div>
          </div>

          <FlowArrow />

          <div className="flex min-w-0 flex-col gap-2">
            <StageLabel number="03" active={filled}>
              Clean data
            </StageLabel>
            <div className="min-w-0">
              <StaticTable data={scenario} filled={filled} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: the form retracts, leaving the conversation and the saved row */}
      <div className="flex h-full flex-col gap-4 pt-6 min-[900px]:hidden">
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <StageLabel number="02" active>
            Conversation
          </StageLabel>
          <div className="min-h-0 flex-1">
            <StaticChat data={scenario} filled={filled} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <StageLabel number="03" active={filled}>
            Clean data
          </StageLabel>
          <StaticTable data={scenario} filled={filled} />
        </div>
      </div>
    </div>
  );
}

function FlowArrow() {
  return (
    <div aria-hidden="true" className="flex items-center justify-center">
      <svg
        viewBox="0 0 24 12"
        fill="none"
        className="h-3 w-6 stroke-marketing-hair"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1 6h21M18 2l4 4-4 4" />
      </svg>
    </div>
  );
}
