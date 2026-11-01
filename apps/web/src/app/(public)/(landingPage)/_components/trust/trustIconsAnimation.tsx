"use client";

import { useEffect, useRef } from "react";

import { registerTrustIcon } from "./trustIconLoop";
import type { TrustIconName } from "./trustIconName";

export default function TrustIconsAnimation({
  icon,
  onReady,
}: {
  icon: TrustIconName;
  onReady?: () => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    return registerTrustIcon({
      svg,
      icon,
      onReady: () => onReadyRef.current?.(),
    });
  }, [icon]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 160 80"
      aria-hidden="true"
      className="h-full w-full overflow-visible"
    />
  );
}
