import BrandName from "@/components/common/brandName";
import { Suspense } from "react";
import { SignInButton } from "./signInButton";
import { UserSignInButton } from "./userButton";

export function Header() {
  return (
    <header>
      <div className="flex w-full flex-nowrap items-center justify-between gap-3 p-3">
        <BrandName className="text-xl lg:text-2xl" />
        <nav className="flex items-center gap-3">
          <Suspense fallback={<SignInButton />}>
            <UserSignInButton />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}
