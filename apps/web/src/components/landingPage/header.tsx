import { auth, UserButton } from "@clerk/nextjs";
import { Button } from "@convoform/ui/components/ui/button";
import { LayoutDashboard } from "lucide-react";

import { LinkN } from "@/components/common/linkN";
import BrandName from "../common/brandName";

export function Header() {
  const { userId } = auth();

  return (
    <header>
      <div className="flex w-full items-center justify-between p-3">
        <BrandName className="text-xl lg:text-2xl" />
        <nav className="flex items-center gap-3">
          {userId ? (
            <>
              <LinkN href="/dashboard">
                <Button variant="secondary">
                  <LayoutDashboard className="mr-2" size={20} /> Go to Dashboard
                </Button>
              </LinkN>
              <UserButton />
            </>
          ) : (
            <LinkN href="/auth/sign-in" rel="noopener noreferrer nofollow">
              <Button variant="secondary" className="rounded-full">
                Sign In
              </Button>
            </LinkN>
          )}
        </nav>
      </div>
    </header>
  );
}
