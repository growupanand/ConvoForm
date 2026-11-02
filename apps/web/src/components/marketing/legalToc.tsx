"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type LegalTocSection = {
  id: string;
  title: string;
};

export function LegalToc({
  sections,
  variant,
}: {
  sections: LegalTocSection[];
  variant: "desktop" | "mobile";
}) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) return;

    const updateActive = () => {
      const offset = window.scrollY + 140;
      let current = elements[0]?.id ?? "";

      for (const element of elements) {
        if (element.getBoundingClientRect().top + window.scrollY <= offset) {
          current = element.id;
        } else {
          break;
        }
      }

      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;
      if (atBottom) {
        current = sections[sections.length - 1]?.id ?? current;
      }

      setActiveId(current);
    };

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);

    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [sections]);

  const activeTitle =
    sections.find((section) => section.id === activeId)?.title ??
    sections[0]?.title ??
    "";

  if (variant === "mobile") {
    return (
      <details
        ref={detailsRef}
        className="group sticky top-[72px] z-[5] mb-[22px] rounded-[14px] border-[1.25px] border-marketing-hair bg-marketing-surface/95 backdrop-blur-[8px] min-[900px]:hidden"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2.5 px-4 py-[13px] font-mono text-xs font-medium leading-[1.2] text-marketing-muted focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-marketing-blue-600 [&::-webkit-details-marker]:hidden">
          <span className="shrink-0">On this page</span>
          <span className="min-w-0 flex-1 truncate text-right text-marketing-blue-600">
            {activeTitle}
          </span>
          <ChevronDown
            aria-hidden="true"
            className="size-3.5 shrink-0 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
          />
        </summary>

        <ol className="max-h-[60vh] overflow-auto border-t-[1.25px] border-marketing-hair-soft py-1.5">
          {sections.map((section, index) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={section.id === activeId ? "true" : undefined}
                onClick={() => {
                  if (detailsRef.current) detailsRef.current.open = false;
                }}
                className={cn(
                  "flex gap-2.5 px-4 py-2.5 font-body text-[15px] leading-[1.4] text-marketing-muted transition-colors duration-150 hover:text-marketing-ink",
                  section.id === activeId && "text-marketing-blue-600",
                )}
              >
                <span className="font-mono text-[11px] leading-[1.9] text-marketing-label">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {section.title}
              </a>
            </li>
          ))}
        </ol>
      </details>
    );
  }

  return (
    <nav
      aria-label="On this page"
      className="sticky top-24 hidden max-h-[calc(100vh-120px)] self-start overflow-auto pt-1.5 min-[900px]:block"
    >
      <div className="mb-3.5 font-mono text-[11px] font-medium uppercase leading-none tracking-[0.1em] text-marketing-label">
        On this page
      </div>

      <ol className="border-l-[1.25px] border-marketing-hair">
        {sections.map((section, index) => {
          const active = section.id === activeId;
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "-ml-[1.25px] flex gap-2.5 border-l-[1.25px] border-transparent py-[7px] pl-4 font-body text-sm leading-[1.4] text-marketing-muted transition-colors duration-150 hover:text-marketing-ink",
                  active && "border-marketing-blue-600 text-marketing-blue-600",
                )}
              >
                <span
                  className={cn(
                    "font-mono text-[11px] leading-[1.9] text-marketing-label",
                    active && "text-marketing-blue-600",
                  )}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                {section.title}
              </a>
            </li>
          );
        })}
      </ol>

      <a
        href="#top"
        className="mt-5 inline-block font-mono text-xs leading-none text-marketing-label transition-colors duration-150 hover:text-marketing-ink"
      >
        ↑ Back to top
      </a>
    </nav>
  );
}
