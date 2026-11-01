import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";

export const bricolageGrotesque = Bricolage_Grotesque({
  display: "swap",
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const inter = Inter({
  display: "swap",
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const jetBrainsMono = JetBrains_Mono({
  display: "swap",
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});
