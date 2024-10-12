import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const getOrganizationId = () => {
  const { orgId } = auth();
  if (!orgId) {
    redirect("/organizations");
  }
  return orgId;
};
