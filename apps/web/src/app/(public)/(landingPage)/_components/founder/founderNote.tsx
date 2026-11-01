import {
  FOUNDER_GITHUB_URL,
  FOUNDER_NAME,
  FOUNDER_NOTE_QUOTE,
  FOUNDER_SIGNATURE,
} from "./content";
import { FounderPhoto } from "./founderPhoto";

export function FounderNote() {
  return (
    <section
      id="founder"
      aria-label={`A note from ${FOUNDER_NAME}`}
      className="min-w-0 px-4 pb-[76px] pt-10 min-[900px]:pb-[112px]"
    >
      <figure className="relative mx-auto min-w-0 max-w-[820px] rounded-[22px] border-[1.25px] border-marketing-hair bg-marketing-surface/70 px-[22px] pb-[26px] pt-[34px] min-[900px]:rounded-[26px] min-[900px]:px-12 min-[900px]:pb-11 min-[900px]:pt-11">
        <span
          aria-hidden="true"
          className="absolute -top-3.5 left-5 bg-marketing-paper px-2.5 font-display text-[44px] font-bold leading-none text-marketing-blue-300 min-[900px]:left-10"
        >
          &ldquo;
        </span>

        <blockquote className="font-display text-[clamp(20px,2.2vw,26px)] font-medium leading-[1.4] tracking-[-0.01em] text-marketing-ink">
          {FOUNDER_NOTE_QUOTE}
        </blockquote>

        <figcaption className="mt-7 flex items-center gap-3.5 border-t border-dashed border-marketing-hair pt-[22px]">
          <FounderPhoto />
          <a
            href={FOUNDER_GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="rounded-sm font-body text-[15px] font-medium leading-[1.4] text-marketing-ink underline decoration-marketing-blue-200 underline-offset-4 transition-colors duration-200 hover:text-marketing-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketing-blue-600"
          >
            {FOUNDER_SIGNATURE}
            <span className="mt-1 block font-mono text-[11px] font-normal leading-none tracking-[0.02em] text-marketing-text no-underline">
              @growupanand on GitHub
            </span>
          </a>
        </figcaption>
      </figure>
    </section>
  );
}
