"use client";

import { OrganizationList, useAuth } from "@clerk/nextjs";

type Props = {
  children: React.ReactNode;
};

export const OrganizationProvider = ({ children }: Readonly<Props>) => {
  const { orgId } = useAuth();

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

  return <div>{children}</div>;
};
