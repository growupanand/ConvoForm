import { ClerkLoading } from "@clerk/nextjs";

import { PublicLayout } from "@/components/common/publicLayout/publicLayout";
import Spinner from "@/components/common/spinner";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Readonly<Props>) {
  return (
    <PublicLayout>
      <main className="min-h-screen lg:min-h-[calc(100vh-6rem)] flex items-center justify-center">
        <div>
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
