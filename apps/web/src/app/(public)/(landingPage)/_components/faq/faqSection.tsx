import { FAQ_ITEMS } from "./content";

export function FaqSection() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="min-w-0 px-4 pb-[76px] pt-10 min-[900px]:pb-[112px]"
    >
      <div className="mx-auto min-w-0 max-w-[1160px]">
        <div className="text-center">
          <h2
            id="faq-heading"
            className="mx-auto max-w-[760px] font-display text-[clamp(32px,4.2vw,50px)] font-bold leading-[1.06] tracking-[-0.03em] text-marketing-ink"
          >
            <span
              aria-hidden="true"
              className="mb-3 flex items-center justify-center gap-2 font-mono text-[11px] font-medium uppercase leading-none tracking-[0.08em] text-marketing-blue-600"
            >
              <span className="size-1.5 rounded-full bg-marketing-blue-600" />
              FAQ
            </span>
            Questions, answered
          </h2>
        </div>

        <div className="mx-auto mt-9 max-w-[820px] border-t-[1.25px] border-marketing-hair">
          {FAQ_ITEMS.map((item, index) => (
            <details
              key={item.id}
              id={item.id}
              open={index === 0}
              className="group border-b-[1.25px] border-marketing-hair"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-[18px] font-display text-[16.5px] font-semibold leading-[1.3] text-marketing-ink transition-colors duration-200 hover:text-marketing-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketing-blue-600 min-[900px]:py-[22px] min-[900px]:text-[18px] group-open:text-marketing-blue-700 [&::-webkit-details-marker]:hidden">
                <span className="flex items-baseline">
                  <span
                    aria-hidden="true"
                    className="mr-3.5 shrink-0 font-mono text-[11px] font-medium leading-none tracking-[0.06em] text-marketing-label"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {item.question}
                </span>

                <span
                  aria-hidden="true"
                  className="relative size-7 shrink-0 rounded-full border-[1.25px] border-marketing-hair transition-[transform,border-color] [transition-duration:250ms] [transition-timing-function:cubic-bezier(0.65,0,0.35,1)] group-open:rotate-45 group-open:border-marketing-blue-300 motion-reduce:transition-none"
                >
                  <span className="absolute left-1/2 top-1/2 h-0 w-[11px] -translate-x-1/2 -translate-y-1/2 border-t-[1.25px] border-marketing-ink" />
                  <span className="absolute left-1/2 top-1/2 h-0 w-[11px] -translate-x-1/2 -translate-y-1/2 rotate-90 border-t-[1.25px] border-marketing-ink" />
                </span>
              </summary>

              <div className="max-w-[620px] pb-5 font-body text-[15px] leading-[1.65] text-marketing-muted min-[900px]:pb-6 min-[900px]:pr-11 min-[900px]:text-[15.5px]">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
