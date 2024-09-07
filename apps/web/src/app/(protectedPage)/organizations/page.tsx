import { ClerkLoading, OrganizationList, UserButton } from "@clerk/nextjs";
import { Skeleton } from "@convoform/ui/components/ui/skeleton";

import BrandName from "@/components/common/brandName";
import Spinner from "@/components/common/spinner";

export default function Page() {
  return (
    <div className="flex h-screen flex-col items-center justify-between">
      <div className="w-full border-b  bg-white/70 shadow-sm backdrop-blur ">
        <header className="container flex items-center justify-between p-3">
          <BrandName className="text-xl lg:text-2xl" />
          <div>
            <ClerkLoading>
              <Skeleton className="h-10 w-10 animate-pulse rounded-full" />
            </ClerkLoading>
            <UserButton />
          </div>
        </header>
      </div>
      <div>
        <OrganizationList
          afterSelectOrganizationUrl="/dashboard"
          hidePersonal
        />
        <ClerkLoading>
          <div className="flex w-full justify-center">
            <Spinner label="Please wait..." />
          </div>
        </ClerkLoading>
      </div>
      <div />
    </div>
  );
}
