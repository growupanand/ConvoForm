import { cn } from "@/lib/utils";
import { HERO_SCENARIOS } from "./heroScenarios";

const scenario = HERO_SCENARIOS[0];

// The final, fully informative frame. Only shown under
// `prefers-reduced-motion: reduce`.
export function HeroStatic() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex items-center justify-center px-3.5"
    >
      <div className="w-full max-w-[440px] rounded-[22px] border-[1.25px] border-marketing-blue-200 bg-marketing-surface/86 p-3 text-left backdrop-blur-[14px]">
        <div className="flex items-center gap-2 border-b border-slate-100 px-0.5 pb-2.5 pt-0.5">
          <span className="grid size-6 place-items-center rounded-full bg-marketing-blue-600 font-body text-[10px] font-bold leading-none text-white">
            CF
          </span>
          <span className="font-body text-[13px] font-semibold leading-none text-marketing-ink">
            ConvoForm
          </span>
          <span className="ml-auto flex items-center gap-1.5 font-mono text-[10.5px] uppercase leading-none tracking-[0.04em] text-marketing-blue-600">
            <span className="size-1.5 rounded-full bg-marketing-blue-600" />
            Live
          </span>
        </div>

        <div className="flex flex-col gap-[7px] pb-1 pt-2.5">
          {scenario.messages.map((message, index) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: static illustration
              key={index}
              className={cn(
                "w-fit max-w-[80%] whitespace-normal rounded-2xl px-3 py-2 font-body text-[13.5px] leading-[1.35]",
                message.kind === "user"
                  ? "self-end rounded-br-[5px] bg-marketing-blue-600 text-white"
                  : message.kind === "followUp"
                    ? "self-start rounded-bl-[5px] bg-marketing-blue-50 text-marketing-blue-700 shadow-[inset_0_0_0_1.25px_var(--marketing-blue-300)]"
                    : "self-start rounded-bl-[5px] bg-slate-100 text-marketing-ink",
              )}
            >
              {message.text}
            </div>
          ))}
        </div>

        <div className="mt-1.5 flex min-h-9 flex-wrap gap-1.5 border-t border-dashed border-marketing-hair-soft pt-2.5">
          {scenario.chips.map((chip) => (
            <span
              key={chip.label}
              className="inline-flex items-center gap-1.5 rounded-full border border-marketing-hair-soft bg-marketing-surface px-2.5 py-1.5 font-body text-[11.5px] font-medium leading-none text-marketing-muted"
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
