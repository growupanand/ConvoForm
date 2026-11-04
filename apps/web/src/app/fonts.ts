import localFont from "next/font/local";

/**
 * Fonts are self-hosted so production builds never depend on Google Fonts.
 *
 * Google Fonts occasionally returns extensionless `/l/font?kit=...&skey=...`
 * URLs, which Turbopack mis-parses as multiple query entries and fails the
 * build with `next/font/google queries have exactly one entry`
 * (vercel/next.js#99114). Vendoring the latin woff2 files avoids that flake.
 */
export const bricolageGrotesque = localFont({
  src: "./fonts/bricolage-grotesque-latin.woff2",
  display: "swap",
  variable: "--font-bricolage",
  weight: "600 700",
  adjustFontFallback: false,
  fallback: ["Bricolage Grotesque Fallback"],
});

export const inter = localFont({
  src: "./fonts/inter-latin.woff2",
  display: "swap",
  variable: "--font-inter",
  weight: "400 700",
  adjustFontFallback: false,
  fallback: ["Inter Fallback"],
});

export const jetBrainsMono = localFont({
  src: "./fonts/jetbrains-mono-latin.woff2",
  display: "swap",
  variable: "--font-jetbrains-mono",
  weight: "400 500",
  adjustFontFallback: false,
  fallback: ["JetBrains Mono Fallback"],
});
