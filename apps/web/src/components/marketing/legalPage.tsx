import { cn } from "@/lib/utils";
import {
  Children,
  type ReactElement,
  type ReactNode,
  cloneElement,
  isValidElement,
} from "react";

import { LegalToc } from "./legalToc";

export const legalArticleClass = cn(
  "font-body text-[16px] leading-[1.75] text-marketing-muted min-[900px]:text-[16.5px]",
  "[&_p]:mt-3.5",
  "[&_ul]:mt-3.5 [&_ul]:grid [&_ul]:gap-2.5",
  "[&_li]:relative [&_li]:pl-[22px]",
  "[&_li]:before:absolute [&_li]:before:left-[3px] [&_li]:before:top-[0.85em] [&_li]:before:w-[9px] [&_li]:before:border-t-[1.25px] [&_li]:before:border-marketing-blue-300 [&_li]:before:content-['']",
  "[&_strong]:font-semibold [&_strong]:text-marketing-ink",
  "[&_a]:text-marketing-blue-600 [&_a]:underline [&_a]:decoration-marketing-blue-200 [&_a]:underline-offset-[3px] [&_a]:[overflow-wrap:anywhere]",
  "[&_h3]:mt-6 [&_h3]:font-display [&_h3]:text-[17px] [&_h3]:font-semibold [&_h3]:leading-[1.3] [&_h3]:text-marketing-ink",
);

export type LegalSectionProps = {
  id: string;
  title: string;
  index?: number;
  children: ReactNode;
};

export function LegalSection({
  id,
  title,
  index = 1,
  children,
}: LegalSectionProps) {
  return (
    <section
      id={id}
      className="scroll-mt-[88px] border-t-[1.25px] border-marketing-hair-soft py-7 first:border-t-0 first:pt-1.5 min-[900px]:py-[34px]"
    >
      <h2 className="flex items-baseline gap-3.5 font-display text-[clamp(22px,2.3vw,27px)] font-semibold leading-[1.25] tracking-[-0.015em] text-marketing-ink">
        <span
          aria-hidden="true"
          className="shrink-0 -translate-y-[3px] font-mono text-xs font-medium leading-none tracking-[0.06em] text-marketing-blue-600"
        >
          {String(index).padStart(2, "0")}
        </span>
        <a
          href={`#${id}`}
          className="rounded-sm transition-colors duration-150 hover:underline hover:decoration-marketing-blue-200 hover:underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketing-blue-600"
        >
          {title}
        </a>
      </h2>

      <div className="mt-2">{children}</div>
    </section>
  );
}

function isLegalSection(
  child: ReactNode,
): child is ReactElement<LegalSectionProps> {
  return isValidElement(child) && child.type === LegalSection;
}

type LegalPageProps = {
  title: string;
  lastUpdated: string;
  lastUpdatedLabel: string;
  children: ReactNode;
};

export function LegalPage({
  title,
  lastUpdated,
  lastUpdatedLabel,
  children,
}: LegalPageProps) {
  const items = Children.toArray(children);

  const sections = items
    .filter(isLegalSection)
    .map((section) => ({ id: section.props.id, title: section.props.title }));

  let sectionIndex = 0;
  const numberedChildren = Children.map(items, (child) => {
    if (!isLegalSection(child)) return child;
    sectionIndex += 1;
    return cloneElement(child, { index: sectionIndex });
  });

  return (
    <main className="min-w-0">
      <section className="relative isolate min-w-0 overflow-x-clip px-4 pb-6 pt-10 min-[900px]:pb-8 min-[900px]:pt-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-marketing-dot-grid bg-[length:22px_22px] [mask-image:linear-gradient(to_bottom,#000_20%,transparent_90%)]"
        />

        <div className="mx-auto w-full max-w-[1120px]">
          <span className="inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase leading-none tracking-[0.08em] text-marketing-blue-600">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-marketing-blue-600"
            />
            Legal
          </span>

          <h1 className="mt-1 font-display text-[clamp(36px,5vw,62px)] font-bold leading-[1.04] tracking-[-0.035em] text-marketing-ink">
            {title}
          </h1>

          <span className="mt-5 inline-flex items-center gap-2 rounded-full border-[1.25px] border-marketing-hair bg-marketing-surface px-3 py-2 font-mono text-xs font-medium leading-none text-marketing-muted">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-marketing-blue-600"
            />
            Last updated ·{" "}
            <time dateTime={lastUpdated}>{lastUpdatedLabel}</time>
          </span>
        </div>
      </section>

      <section className="min-w-0 px-4 pb-24 pt-4">
        <div className="mx-auto grid w-full max-w-[1120px] grid-cols-1 justify-center min-[900px]:grid-cols-[240px_minmax(0,68ch)] min-[900px]:gap-[72px]">
          <LegalToc sections={sections} variant="desktop" />

          <div className="min-w-0">
            <LegalToc sections={sections} variant="mobile" />
            <article className={legalArticleClass}>{numberedChildren}</article>
          </div>
        </div>
      </section>
    </main>
  );
}
