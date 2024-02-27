import dynamic from "next/dynamic";

import BrandName from "@/components/common/brandName";
import { SignInButton } from "./signInButton";

const UserSignInButton = dynamic(() => import("./userButton"), {
  ssr: false,
  loading: () => <SignInButton />,
});

export function Header() {
  return (
    <header>
      <div className="flex w-full flex-nowrap items-center justify-between gap-3 p-3">
        <BrandName className="text-xl lg:text-2xl" />
        <nav className="flex items-center gap-3">
          <UserSignInButton />
        </nav>
      </div>
    </header>
  );
}
