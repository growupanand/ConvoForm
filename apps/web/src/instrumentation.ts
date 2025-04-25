/**
 * This file is used to capture exceptions and send them to PostHog
 */

export function register() {
  // No-op for initialization
}

export const onRequestError = async (
  err: Error,
  request: { headers: { cookie: any } },
) => {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { analytics } = await import("@convoform/analytics");

    let distinctId = null;
    if (request.headers.cookie) {
      const cookieString = request.headers.cookie;
      const postHogCookieMatch = cookieString.match(
        /ph_phc_.*?_posthog=([^;]+)/,
      );

      if (postHogCookieMatch?.[1]) {
        try {
          const decodedCookie = decodeURIComponent(postHogCookieMatch[1]);
          const postHogData = JSON.parse(decodedCookie);
          distinctId = postHogData.distinct_id;
        } catch (e) {
          console.error("Error parsing PostHog cookie:", e);
        }
      }
    }

    analytics.captureException(err, distinctId || undefined);
  }
};
