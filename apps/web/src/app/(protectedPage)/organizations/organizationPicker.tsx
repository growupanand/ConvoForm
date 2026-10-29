"use client";

import { OrganizationList } from "@clerk/nextjs";

import { OrganizationViewAnalytics } from "./organizationViewAnalytics";

export function OrganizationPicker() {
  return (
    <>
      <OrganizationViewAnalytics />
      <OrganizationList afterSelectOrganizationUrl="/dashboard" hidePersonal />
    </>
  );
}
