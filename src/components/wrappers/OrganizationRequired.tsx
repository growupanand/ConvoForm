import { OrganizationList } from "@clerk/nextjs";

import { getOrganizationId } from "@/lib/getOrganizationId";

type Props = {
  children: React.ReactNode;
};

export const OrganizationRequired = ({ children }: Readonly<Props>) => {
  const orgId = getOrganizationId();

  if (!orgId) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <OrganizationList
          afterSelectOrganizationUrl="/dashboard"
          hidePersonal
        />
      </div>
    );
  }

  return <>{children}</>;
};
