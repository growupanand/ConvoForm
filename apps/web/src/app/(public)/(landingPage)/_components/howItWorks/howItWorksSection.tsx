import { HowItWorksFrames } from "./howItWorksFrames";
import { HOW_LABEL } from "./howItWorksScene";
import { HowItWorksStage } from "./howItWorksStage";

const steps = [
  {
    number: "01",
    title: "Design your form",
    description:
      "Describe it and let AI draft the fields, or build from scratch.",
  },
  {
    number: "02",
    title: "Share the link",
    description:
      "Put it in your Instagram bio or send it in a WhatsApp reply. People chat in their phone browser, no app needed.",
  },
  {
    number: "03",
    title: "Review clean answers",
    description:
      "See each answer in a table with the full transcript. Export to CSV or send to Google Sheets.",
  },
] as const;

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="relative isolate min-w-0 overflow-x-clip px-4 py-[76px] min-[900px]:py-[112px]"
    >
      <div className="mx-auto min-w-0 max-w-[1160px]">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase leading-none tracking-[0.08em] text-marketing-blue-600">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-marketing-blue-600"
            />
            How it works
          </span>
          <h2
            id="how-it-works-heading"
            className="mx-auto mt-3 max-w-[760px] font-display text-[clamp(32px,4.2vw,50px)] font-bold leading-[1.06] tracking-[-0.03em] text-marketing-ink"
          >
            From a form to{" "}
            <span className="text-marketing-blue-600">clean answers</span>
          </h2>
          <p className="mx-auto mt-4 max-w-[620px] font-body text-[17px] leading-[1.6] text-marketing-muted">
            Fields become questions. Vague replies get a follow-up. Every answer
            lands in its column.
          </p>
        </div>

        <HowItWorksStage label={HOW_LABEL}>
          <HowItWorksFrames />
        </HowItWorksStage>

        <div className="mx-auto mt-12 grid max-w-[1080px] grid-cols-1 gap-7 min-[900px]:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="border-t-[1.25px] border-marketing-hair pt-[18px]"
            >
              <span className="font-mono text-[11px] font-medium leading-none tracking-[0.08em] text-marketing-blue-600">
                {step.number}
              </span>
              <h3 className="mt-3 font-display text-[20px] font-semibold leading-[1.2] tracking-[-0.01em] text-marketing-ink">
                {step.title}
              </h3>
              <p className="mt-2 font-body text-[15px] leading-[1.55] text-marketing-muted">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
