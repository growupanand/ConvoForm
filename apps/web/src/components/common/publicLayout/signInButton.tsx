import { Button } from "@convoform/ui";
import Link from "next/link";

export function SignInButton() {
  return (
    <Link href="/auth/sign-in" rel="noopener noreferrer nofollow">
      <Button variant="secondary" className="rounded-full">
        Sign In
      </Button>
    </Link>
  );
}
