import { DoesntDoPanel } from "./doesntDoPanel";
import { TrustArt } from "./trustArt";
import type { TrustIconName } from "./trustIconName";

const CARDS: Array<{
  id: string;
  title: string;
  description: string;
  icon: TrustIconName;
  label: string;
}> = [
  {
    id: "open-source",
    title: "Open source",
    description:
      "All code is public on GitHub under Apache 2.0. Anyone can check how it works.",
    icon: "openSource",
    label:
      "Line drawing of code brackets with a star, representing open source",
  },
  {
    id: "self-host",
    title: "Self-host if you want",
    description:
      "Run it on your own server with Docker Compose and your own PostgreSQL, or use our cloud.",
    icon: "selfHost",
    label:
      "Line drawing of a server and a cloud joined by a dotted line, representing self-hosting",
  },
  {
    id: "no-data-selling",
    title: "We don't sell data",
    description: "Our privacy policy says we do not sell personal information.",
    icon: "noSell",
    label: "Line drawing of a shield with a tick, representing data privacy",
  },
  {
    id: "export",
    title: "Your data, your export",
    description: "Download responses as CSV or send them to Google Sheets.",
    icon: "export",
    label:
      "Line drawing of table rows moving into a CSV file and a spreadsheet, representing exports",
  },
];

export function TrustSection() {
  return (
    <section
      id="trust"
      aria-labelledby="trust-heading"
      className="relative isolate min-w-0 overflow-x-clip px-4 pb-[76px] pt-10 min-[900px]:pb-[112px]"
    >
      <div className="mx-auto min-w-0 max-w-[1160px]">
        <h2
          id="trust-heading"
          className="max-w-[900px] font-display text-[clamp(32px,4.2vw,50px)] font-bold leading-[1.06] tracking-[-0.03em] text-marketing-ink"
        >
          <span
            aria-hidden="true"
            className="mb-3 flex items-center gap-2 font-mono text-[11px] font-medium uppercase leading-none tracking-[0.08em] text-marketing-blue-600"
          >
            <span className="size-1.5 rounded-full bg-marketing-blue-600" />
            Trust &amp; privacy
          </span>
          Your respondents&apos; data,{" "}
          <span className="text-marketing-blue-600">handled plainly</span>
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-3 min-[900px]:grid-cols-2 min-[900px]:gap-4 min-[1100px]:grid-cols-4">
          {CARDS.map((card) => (
            <div
              key={card.id}
              className="rounded-[20px] border-[1.25px] border-marketing-hair bg-marketing-surface/60 p-5"
            >
              <div className="-mx-1 -mt-1 mb-[18px] flex h-24 items-center justify-center border-b border-dashed border-marketing-hair-soft">
                <TrustArt icon={card.icon} label={card.label} />
              </div>
              <h3 className="font-display text-[17px] font-semibold leading-[1.2] text-marketing-ink">
                {card.title}
              </h3>
              <p className="mt-2 font-body text-[14.5px] leading-[1.55] text-marketing-muted">
                {card.description}
              </p>
            </div>
          ))}
        </div>

        <DoesntDoPanel />
      </div>
    </section>
  );
}
