import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAppRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/forms(.*)",
  "/channels(.*)",
  "/settings(.*)",
  "/organizations(.*)",
]);

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/forms(.*)",
  "/channels(.*)",
  "/settings(.*)",
  "/organizations(.*)",
  "/api/auth/(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    await auth.protect();
  }

  const { userId, orgId } = await auth();
  if (!userId || orgId || !isAppRoute(request)) {
    return;
  }

  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/organizations") || pathname.startsWith("/api")) {
    return;
  }

  // Document redirect. redirect() inside a server layout becomes a client
  // navigation and crashes the App Router for users who have no active org.
  return NextResponse.redirect(new URL("/organizations", request.url));
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
