import { ClerkLoading } from "@clerk/nextjs";

import { PublicLayout } from "@/components/common/publicLayout/publicLayout";
import Spinner from "@/components/common/spinner";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Readonly<Props>) {
  return (
    <PublicLayout>
      <main className="flex w-full items-center justify-center px-4 py-6 lg:min-h-[calc(100vh-6rem)]">
        <div className="w-full max-w-[400px] [&_.cl-card]:!w-full [&_.cl-cardBox]:!w-full [&_.cl-rootBox]:!w-full">
          <ClerkLoading>
            <div className="flex w-full justify-center">
              <Spinner label="Checking auth..." />
            </div>
          </ClerkLoading>
          {children}
        </div>
      </main>
    </PublicLayout>
  );
}
