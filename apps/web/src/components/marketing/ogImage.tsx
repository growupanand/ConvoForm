import { ImageResponse } from "next/og";

// Shared social-share card. Every public page owns an `opengraph-image.tsx`
// (and a matching `twitter-image.tsx`) that renders through this helper, so the
// card keeps the marketing design tokens while the title, description and
// eyebrow stay unique per page.

export const OG_IMAGE_SIZE = { width: 1200, height: 630 };
export const OG_IMAGE_CONTENT_TYPE = "image/png";

const PAPER = "#fafbfc";
const SURFACE = "#ffffff";
const INK = "#0f172a";
const MUTED = "#475569";
const LABEL = "#64748b";
const HAIR = "#cbd5e1";
const BLUE = "#2563eb";

type OgImageProps = {
  eyebrow: string;
  title: string;
  description: string;
};

type LoadedFont = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 500 | 600 | 700;
  style: "normal";
};

const fontCache = new Map<string, Promise<LoadedFont | null>>();

async function loadGoogleFont(
  family: string,
  weight: LoadedFont["weight"],
): Promise<LoadedFont | null> {
  const cacheKey = `${family}-${weight}`;
  const cached = fontCache.get(cacheKey);
  if (cached) return cached;

  const load = async () => {
    try {
      const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
        family,
      )}:wght@${weight}&display=swap`;
      const cssResponse = await fetch(cssUrl, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(8000),
      });
      if (!cssResponse.ok) return null;

      const css = await cssResponse.text();
      const match = css.match(/src: url\(([^)]+)\)/);
      if (!match?.[1]) return null;

      const fontResponse = await fetch(match[1], {
        signal: AbortSignal.timeout(8000),
      });
      if (!fontResponse.ok) return null;

      return {
        name: family,
        data: await fontResponse.arrayBuffer(),
        weight,
        style: "normal" as const,
      };
    } catch {
      // The card still renders with the built-in font when the network is
      // unavailable (for example an offline local build).
      return null;
    }
  };

  fontCache.set(cacheKey, load());
  return fontCache.get(cacheKey) ?? null;
}

async function loadFonts() {
  const fonts = await Promise.all([
    loadGoogleFont("Bricolage Grotesque", 700),
    loadGoogleFont("Inter", 400),
    loadGoogleFont("Inter", 600),
    loadGoogleFont("JetBrains Mono", 500),
  ]);

  return fonts.filter((font): font is LoadedFont => font !== null);
}

function Dots() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(15,23,42,0.07) 1px, transparent 0)",
        backgroundSize: "22px 22px",
      }}
    />
  );
}

export async function renderOgImage({
  eyebrow,
  title,
  description,
}: OgImageProps) {
  const fonts = await loadFonts();

  return new ImageResponse(
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: PAPER,
        color: INK,
        padding: "64px 72px",
        fontFamily: "Inter",
      }}
    >
      <Dots />

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          border: `1.25px solid ${HAIR}`,
          backgroundColor: SURFACE,
          padding: "44px 48px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                display: "flex",
                width: 14,
                height: 14,
                borderRadius: 999,
                backgroundColor: BLUE,
              }}
            />
            <div
              style={{
                display: "flex",
                fontFamily: "Bricolage Grotesque",
                fontWeight: 700,
                fontSize: 30,
                letterSpacing: "-0.02em",
              }}
            >
              ConvoForm
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "JetBrains Mono",
              fontWeight: 500,
              fontSize: 15,
              letterSpacing: "0.08em",
              color: LABEL,
            }}
          >
            CONVOFORM.COM
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            paddingTop: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontFamily: "JetBrains Mono",
              fontWeight: 500,
              fontSize: 16,
              letterSpacing: "0.1em",
              color: BLUE,
              textTransform: "uppercase",
            }}
          >
            <div
              style={{
                display: "flex",
                width: 6,
                height: 6,
                borderRadius: 999,
                backgroundColor: BLUE,
              }}
            />
            {eyebrow}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 20,
              maxWidth: 900,
              fontFamily: "Bricolage Grotesque",
              fontWeight: 700,
              fontSize: 64,
              lineHeight: 1.04,
              letterSpacing: "-0.035em",
              color: INK,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 20,
              maxWidth: 820,
              fontSize: 24,
              lineHeight: 1.45,
              color: MUTED,
            }}
          >
            {description}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `1.25px solid ${HAIR}`,
            paddingTop: 20,
            fontFamily: "JetBrains Mono",
            fontWeight: 500,
            fontSize: 14,
            letterSpacing: "0.08em",
            color: LABEL,
            textTransform: "uppercase",
          }}
        >
          <div style={{ display: "flex" }}>Forms that talk back</div>
          <div style={{ display: "flex" }}>AI conversational forms</div>
        </div>
      </div>
    </div>,
    {
      ...OG_IMAGE_SIZE,
      fonts: fonts.length > 0 ? fonts : undefined,
    },
  );
}
