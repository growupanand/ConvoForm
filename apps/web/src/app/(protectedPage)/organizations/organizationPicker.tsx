"use client";

import { OrganizationList } from "@clerk/nextjs";

import { OrganizationViewAnalytics } from "./organizationViewAnalytics";

export function OrganizationPicker() {
  return (
    <>
      <OrganizationViewAnalytics />
      <div className="w-full max-w-[400px] [&_.cl-cardBox]:!w-full [&_.cl-rootBox]:!w-full">
        <OrganizationList
          afterSelectOrganizationUrl="/dashboard"
          hidePersonal
          appearance={{
            elements: {
              rootBox: "w-full",
              cardBox: "w-full",
            },
          }}
        />
      </div>
    </>
  );
}
