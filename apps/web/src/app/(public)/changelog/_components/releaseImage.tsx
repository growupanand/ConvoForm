"use client";

import { useEffect, useRef, useState } from "react";

type ReleaseImageProps = {
  src?: string;
  alt?: string;
};

type Dimensions = { width: number; height: number };

// Intrinsic sizes for the screenshots in the release notes. They are kept here,
// not in the MDX, because markdown images cannot carry width/height attributes.
// An unknown attachment falls back to a lazy image without dimensions, so a
// future release still renders without a code change.
const DIMENSIONS: Record<string, Dimensions> = {
  "2176728a-27e8-4b52-8b92-29b0bf74e7da": { width: 2636, height: 1576 },
  "2f71af1a-6016-43f2-b930-0aacce98ffc7": { width: 490, height: 666 },
  "6261cbdb-b6d3-4c70-b28e-ae92a96b7e2f": { width: 2074, height: 668 },
  "66d90c32-2d6a-4fcb-9bdd-88e58f3300a0": { width: 974, height: 488 },
  "791dada1-db36-4c53-917a-bfa21f80846a": { width: 661, height: 372 },
  "800c41a7-b3aa-43d5-99fa-96cde33ef5e5": { width: 666, height: 394 },
  "978aed30-8be7-4157-bd15-b3c034a1531e": { width: 1700, height: 1588 },
  "a5386019-7edd-4c58-b1d4-2d22fd6904fb": { width: 1294, height: 1900 },
  "c0cd51d0-0d83-411d-acd2-45bb86deb01d": { width: 1912, height: 953 },
  "c219ff5f-204f-4be7-99f6-4a9240b51064": { width: 1836, height: 1720 },
  "c983304f-a0e2-473e-ad1d-efc37158bc0a": { width: 664, height: 421 },
  "cf6f1707-f2c0-47fd-9224-fddb6e00c6d9": { width: 1452, height: 925 },
  "d3dad741-2581-47f1-9631-fc785786939b": { width: 1280, height: 720 },
  "dc8826b6-0c0e-4ea3-a9ed-0e94aa415912": { width: 1913, height: 950 },
  "dfe18580-f0d8-48cd-835b-9f19d107c359": { width: 547, height: 393 },
  "f5afde25-a2b1-4c54-ad7a-6777e023da8b": { width: 2856, height: 1580 },
};

// The first screenshot inside the first visible release is served from this
// site (rather than GitHub's attachment CDN) so it makes one short, cacheable
// request instead of following a cross-origin redirect chain when it loads.
const LOCAL_IMAGES: Record<string, string> = {
  "66d90c32-2d6a-4fcb-9bdd-88e58f3300a0":
    "/images/changelog/response-insights.png",
};

const attachmentId = (src: string) => src.split("/").filter(Boolean).at(-1);

// Chrome can still fetch `loading="lazy"` images well outside the viewport,
// especially in headless runs, and a single 3 MB GIF then delays the page's LCP.
// Observing the real viewport keeps every offscreen screenshot off the network
// (and out of the page's LCP candidates) until it is about to be seen.
export function ReleaseImage({ src, alt = "" }: ReleaseImageProps) {
  const id = src ? attachmentId(src) : undefined;
  const dimensions = id ? DIMENSIONS[id] : undefined;
  const resolvedSrc = id ? LOCAL_IMAGES[id] ?? src : src;

  const elementRef = useRef<HTMLElement | null>(null);
  const setElement = (element: HTMLElement | null) => {
    elementRef.current = element;
  };

  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!src) return;
    const element = elementRef.current;
    if (!element) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      // Load a screenshot once it is mostly on screen. A screenshot that only
      // peeks into the first viewport therefore stays off the network and never
      // becomes the page's LCP candidate.
      { threshold: 0.6 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [src]);

  if (!src || !resolvedSrc) return null;

  if (!visible) {
    return (
      <span
        ref={setElement}
        aria-hidden="true"
        className="my-4 block w-full"
        style={
          dimensions
            ? { aspectRatio: `${dimensions.width} / ${dimensions.height}` }
            : undefined
        }
      />
    );
  }

  return (
    <img
      ref={setElement}
      src={resolvedSrc}
      width={dimensions?.width}
      height={dimensions?.height}
      alt={alt}
      loading="lazy"
      onLoad={() => setLoaded(true)}
      className={loaded ? undefined : "invisible"}
    />
  );
}
