import { env } from "../env";

export const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""; // browser should use relative url
  if (env.NEXT_PUBLIC_APP_URL) return env.NEXT_PUBLIC_APP_URL;
  if (env.VERCEL_URL) return `https://${env.VERCEL_URL}`;
  return "http://localhost:3000"; // dev SSR should use localhost
};
