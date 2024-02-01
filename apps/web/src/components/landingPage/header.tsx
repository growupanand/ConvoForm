import dynamic from "next/dynamic";

import BrandName from "../common/brandName";
import { SignInButton } from "./signInButton";

const UserSignInButton = dynamic(() => import("./userButton"), {
  ssr: false,
  loading: () => <SignInButton />,
});

export function Header() {
  return (
    <header>
      <div className="flex w-full items-center justify-between p-3">
        <BrandName className="text-xl lg:text-2xl" />
        <nav className="flex items-center gap-3">
          <UserSignInButton />
        </nav>
      </div>
    </header>
  );
}
