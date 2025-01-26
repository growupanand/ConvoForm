import { Button } from "@convoform/ui";

import { LinkN } from "@/components/common/linkN";

export function SignInButton() {
  return (
    <LinkN href="/auth/sign-in" rel="noopener noreferrer nofollow">
      <Button variant="secondary" className="rounded-full">
        Sign In
      </Button>
    </LinkN>
  );
}
