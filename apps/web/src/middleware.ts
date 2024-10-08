import { authMiddleware } from "@clerk/nextjs";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware
export default authMiddleware({
  publicRoutes: [
    "/",
    "/view/(.*)",
    "/api/form/(.*)/conversation",
    "/api/form/(.*)/new-conversation",
    "/api/webhook(.*)",
    "/auth/(.*)",
    "/api/trpc/formDesign.get(.*)",
    // Added for sentry
    "/monitoring(.*)",
    "/changelog",
    "/api/og",
  ],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
