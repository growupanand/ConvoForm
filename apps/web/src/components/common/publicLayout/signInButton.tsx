import Link from "next/link";

export function SignInButton() {
  return (
    <Link
      href="/auth/sign-in"
      prefetch={false}
      rel="noopener noreferrer nofollow"
      className="inline-flex items-center rounded-full px-2.5 py-2 text-sm font-medium text-marketing-muted transition-colors duration-150 hover:text-marketing-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketing-blue-600"
    >
      Sign in
    </Link>
  );
}
