import { Button } from "@convoform/ui/components/ui/button";

import { LinkN } from "../common/linkN";

export function SignInButton() {
  return (
    <LinkN href="/auth/sign-in" rel="noopener noreferrer nofollow">
      <Button variant="secondary" className="rounded-full">
        Sign In
      </Button>
    </LinkN>
  );
}
