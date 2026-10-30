const MOBILE_ALLOWED_PREFIXES = [
  "/auth/register",
  "/auth/sign-in",
  "/organizations",
] as const;

export function isMobileAllowedPath(pathname: string): boolean {
  return MOBILE_ALLOWED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
