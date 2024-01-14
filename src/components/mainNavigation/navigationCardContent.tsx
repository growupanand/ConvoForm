import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";

import BrandName from "../brandName";
import NavigationLink from "./navigationLink";
import { WorkspacesNavigation } from "./workspacesNavigation";

type Props = {
  orgId: string;
  pathname: string;
};

export function NavigationCardContent({ pathname }: Readonly<Props>) {
  return (
    <nav className="flex h-full flex-col justify-between lg:p-5">
      <div>
        <div className="mb-5 flex justify-start ps-4">
          <BrandName className="text-xl lg:text-2xl" />
        </div>
        <div className="grid gap-2">
          <NavigationLink
            name="Dashboard"
            href="/dashboard"
            isActive={pathname.includes("dashboard")}
          />
          <WorkspacesNavigation />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between gap-2 lg:justify-evenly">
          <OrganizationSwitcher
            afterSelectOrganizationUrl="/dashboard"
            hidePersonal
          />
          <UserButton />
        </div>
      </div>
    </nav>
  );
}

export default NavigationCardContent;
