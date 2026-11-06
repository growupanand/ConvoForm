import { loadFonts } from "@/components/marketing/ogImage";
import { ImageResponse } from "next/og";

export const runtime = "edge";

/**
 * Social share card. Mirrors brand/social/og-1200x630.svg — edit the brand
 * artwork first, then keep this route in sync.
 */
export async function GET() {
  const fonts = await loadFonts();

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        backgroundColor: "#fafbfc",
        padding: "80px",
      }}
    >
      <div
        style={{
          display: "flex",
          position: "relative",
          width: 256,
          height: 256,
          flexShrink: 0,
          backgroundColor: "#fafbfc",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 40,
            top: 72,
            width: 136,
            height: 44,
            borderRadius: 22,
            backgroundColor: "#94a3b8",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 80,
            top: 140,
            width: 136,
            height: 44,
            borderRadius: 22,
            backgroundColor: "#2563eb",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginLeft: 40,
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "Bricolage Grotesque",
            fontSize: 76,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          <span style={{ color: "#2563eb" }}>Convo</span>
          <span style={{ color: "#0f172a" }}>Form</span>
        </div>
        <div
          style={{
            display: "flex",
            width: 460,
            height: 2,
            marginTop: 24,
            backgroundColor: "#cbd5e1",
          }}
        />
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontFamily: "Inter",
            fontSize: 32,
            color: "#475569",
          }}
        >
          Forms that talk back.
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: fonts.length > 0 ? fonts : undefined,
    },
  );
}
