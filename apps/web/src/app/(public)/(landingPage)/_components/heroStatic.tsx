import { cn } from "@/lib/utils";

const messages = [
  { kind: "ai", text: "Hi! What should I call you?" },
  { kind: "user", text: "Priya" },
  { kind: "ai", text: "What's your budget for studying abroad?" },
  { kind: "user", text: "around 20" },
  { kind: "followUp", text: "₹20 lakh per year, or in total?" },
  { kind: "user", text: "per year" },
] as const;

const chips = [
  { label: "Name", value: "Priya" },
  { label: "Budget", value: "₹20 lakh / year" },
] as const;

export function HeroStatic() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex items-center justify-center px-3.5"
    >
      <div className="w-full max-w-[440px] rounded-[22px] border-[1.25px] border-marketing-blue-200 bg-white/86 p-3 text-left shadow-[0_22px_50px_-30px_rgba(37,99,235,0.4)] backdrop-blur-[14px]">
        <div className="flex items-center gap-2 border-b border-slate-100 px-0.5 pb-2.5 pt-0.5">
          <span className="grid size-6 place-items-center rounded-full bg-gradient-to-br from-marketing-blue-500 to-marketing-blue-700 font-body text-[10px] font-bold leading-none text-white">
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
          {messages.map((message, index) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: static illustration
              key={index}
              className={cn(
                "max-w-[80%] whitespace-nowrap rounded-2xl px-3 py-2 font-body text-[13.5px] leading-[1.35]",
                message.kind === "user"
                  ? "self-end rounded-br-[5px] bg-marketing-blue-600 text-white"
                  : message.kind === "followUp"
                    ? "self-start rounded-bl-[5px] bg-marketing-blue-50 text-marketing-blue-700 shadow-[inset_0_0_0_1.25px_#93c5fd]"
                    : "self-start rounded-bl-[5px] bg-slate-100 text-marketing-ink",
              )}
            >
              {message.text}
            </div>
          ))}
        </div>

        <div className="mt-1.5 flex min-h-9 flex-wrap gap-1.5 border-t border-dashed border-marketing-hair-soft pt-2.5">
          {chips.map((chip) => (
            <span
              key={chip.label}
              className="inline-flex items-center gap-1.5 rounded-full border border-marketing-hair-soft bg-marketing-surface px-2.5 py-1.5 font-body text-[11.5px] font-medium leading-none text-marketing-muted"
            >
              {chip.label}:{" "}
              <b className="font-semibold text-marketing-ink">{chip.value}</b>
              <svg
                viewBox="0 0 12 12"
                className="size-2.5"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                color="#2563eb"
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
