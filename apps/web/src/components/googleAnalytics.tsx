import { GoogleTagManager } from "@next/third-parties/google";

export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS;

  console.log({ gaId });

  if (!gaId || !gaId.length) {
    return null;
  }

  return <GoogleTagManager gtmId={gaId} />;
}
