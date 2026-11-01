"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import type { TrustIconName } from "./trustIconName";
import { TrustIconStatic } from "./trustIconStatic";

const TrustIconsAnimation = dynamic(() => import("./trustIconsAnimation"), {
  ssr: false,
});

export function TrustArt({
  icon,
  label,
}: {
  icon: TrustIconName;
  label: string;
}) {
  const artRef = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updatePreference = () => {
      const shouldAnimate = !motionQuery.matches;
      setAnimate(shouldAnimate);
      if (!shouldAnimate) {
        setReady(false);
        setShouldLoad(false);
      }
    };

    updatePreference();
    motionQuery.addEventListener("change", updatePreference);

    return () => motionQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (!animate) return;

    const art = artRef.current;
    if (!art) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(art);
    return () => observer.disconnect();
  }, [animate]);

  return (
    <div
      ref={artRef}
      role="img"
      aria-label={label}
      className="relative h-20 w-40"
    >
      <div
        aria-hidden="true"
        className={cn(
          "transition-opacity duration-150",
          ready ? "opacity-0" : "opacity-100",
        )}
      >
        <TrustIconStatic icon={icon} />
      </div>

      {animate && shouldLoad ? (
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-0 transition-opacity duration-150",
            ready ? "opacity-100" : "opacity-0",
          )}
        >
          <TrustIconsAnimation icon={icon} onReady={() => setReady(true)} />
        </div>
      ) : null}
    </div>
  );
}
