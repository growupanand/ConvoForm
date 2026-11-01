"use client";

import { useEffect, useRef } from "react";

const ITEMS = [
  {
    id: "decisions",
    text: "It doesn't make decisions for you. ConvoForm collects clear answers; your team decides what to do with them.",
    icon: (
      <>
        <path d="M2 9.5 12 5l10 4.5L12 14z" />
        <path d="M6 11.5V16c0 1.6 2.7 3 6 3s6-1.4 6-3v-4.5" />
      </>
    ),
  },
  {
    id: "ranking",
    text: "It doesn't rank or qualify people. It checks that each answer meets the field.",
    icon: (
      <>
        <path d="M9 6h11M9 12h11M9 18h11" />
        <circle cx="4.5" cy="6" r=".8" />
        <circle cx="4.5" cy="12" r=".8" />
        <circle cx="4.5" cy="18" r=".8" />
      </>
    ),
  },
  {
    id: "whatsapp",
    text: "It isn't a WhatsApp bot. People open your link and chat in the browser.",
    icon: <path d="M4 5h16v11H10l-5 4v-4H4z" />,
  },
  {
    id: "crm",
    text: "It doesn't replace your CRM, book calls or send follow-ups.",
    icon: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </>
    ),
  },
] as const;

export function DoesntDoPanel() {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) return;

    let animations: Animation[] = [];
    let observer: IntersectionObserver | null = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;

        const crosses = panel.querySelectorAll<SVGPathElement>("[data-cross]");
        animations = Array.from(crosses).map((cross, index) =>
          cross.animate(
            [{ strokeDashoffset: "1" }, { strokeDashoffset: "0" }],
            {
              duration: 500,
              delay: Math.floor(index / 2) * 120,
              easing: "cubic-bezier(0.65, 0, 0.35, 1)",
              fill: "forwards",
            },
          ),
        );

        observer?.disconnect();
        observer = null;
      },
      { threshold: 0.3 },
    );

    observer.observe(panel);

    const showStaticFinal = () => {
      observer?.disconnect();
      observer = null;
      for (const animation of animations) animation.cancel();
      animations = [];
    };

    const handleMotion = () => {
      if (motionQuery.matches) showStaticFinal();
    };

    motionQuery.addEventListener("change", handleMotion);

    return () => {
      showStaticFinal();
      motionQuery.removeEventListener("change", handleMotion);
    };
  }, []);

  return (
    <div
      ref={panelRef}
      className="mt-5 rounded-[20px] border-[1.25px] border-marketing-hair bg-marketing-surface/60 px-5 py-[22px] min-[900px]:px-7 min-[900px]:py-[26px]"
    >
      <h3 className="font-display text-[20px] font-semibold leading-[1.2] text-marketing-ink">
        What ConvoForm doesn&apos;t do
      </h3>

      <ul className="mt-[18px] grid list-none grid-cols-1 gap-x-8 gap-y-3.5 min-[900px]:grid-cols-2">
        {ITEMS.map((item) => (
          <li
            key={item.id}
            className="flex items-start gap-3 font-body text-[15px] leading-[1.5] text-marketing-muted"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--marketing-slate)"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="mt-px size-[22px] shrink-0 overflow-visible"
            >
              {item.icon}
              <path
                data-cross=""
                d="M3 21 21 3"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1}
                stroke="var(--marketing-paper)"
                strokeWidth="4"
                className="motion-reduce:[stroke-dashoffset:0] [html:not([data-js])_&]:[stroke-dashoffset:0]"
              />
              <path
                data-cross=""
                d="M3 21 21 3"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1}
                stroke="var(--marketing-text)"
                strokeWidth="1.25"
                className="motion-reduce:[stroke-dashoffset:0] [html:not([data-js])_&]:[stroke-dashoffset:0]"
              />
            </svg>
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
