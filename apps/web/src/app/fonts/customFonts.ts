import { Marck_Script } from "next/font/google";
import localFont from "next/font/local";

export const marck_script = Marck_Script({
  subsets: ["latin"],
  display: "swap",
  weight: "400",
  variable: "--font-marck-script",
});

export const nohemi = localFont({
  src: "./Nohemi-Medium.woff",
  display: "swap",
  variable: "--font-nohemi",
});
