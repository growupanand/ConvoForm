import { ClerkLoading } from "@clerk/nextjs";

import BrandName from "@/components/common/brandName";
import Spinner from "@/components/common/spinner";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Readonly<Props>) {
  return (
    <main className="container max-w-[900px]">
      <nav className="mt-5 flex items-center justify-center p-3">
        <BrandName className="text-3xl" />
      </nav>
      <ClerkLoading>
        <div className="flex w-full justify-center">
          <Spinner label="Please wait..." />
        </div>
      </ClerkLoading>
      {children}
    </main>
  );
}
