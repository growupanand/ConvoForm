import { ClerkLoading } from "@clerk/nextjs";

import Spinner from "@/components/common/spinner";
import { TopHeader } from "@/components/common/topHeader";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Readonly<Props>) {
  return (
    <main className="min-h-screen flex flex-col">
      <TopHeader hideSignIn />
      <div className="  grow flex items-center justify-center">
        <div>
          <ClerkLoading>
            <div className="flex w-full justify-center">
              <Spinner label="Checking auth..." />
            </div>
          </ClerkLoading>
          {children}
        </div>
      </div>
    </main>
  );
}
