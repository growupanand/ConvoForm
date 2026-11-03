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

// The first screenshot in the first visible release is the page's LCP element.
// Serve it from this site as a small WebP so it is one short, cacheable,
// high-priority request.
const LOCAL_IMAGES: Record<string, string> = {
  "66d90c32-2d6a-4fcb-9bdd-88e58f3300a0":
    "/images/changelog/response-insights.webp",
};

const attachmentId = (src: string) => src.split("/").filter(Boolean).at(-1);

// Release-note screenshots arrive from GitHub's user-attachment CDN. Render
// them directly from the server so the alt text and the JS-off view are
// complete without a client boundary. The first screenshot is eager and
// high-priority; the rest keep native lazy loading so the 3 MB GIF and the
// other offscreen files stay out of the first paint.
export function ReleaseImage({ src, alt = "" }: ReleaseImageProps) {
  if (!src) return null;

  const id = attachmentId(src);
  const dimensions = id ? DIMENSIONS[id] : undefined;
  const resolvedSrc = id ? LOCAL_IMAGES[id] ?? src : src;
  const eager = id ? id in LOCAL_IMAGES : false;

  return (
    <img
      src={resolvedSrc}
      width={dimensions?.width}
      height={dimensions?.height}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={eager ? "high" : "low"}
    />
  );
}
