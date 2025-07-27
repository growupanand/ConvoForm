import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const getOrganizationIdOrRedirect = async () => {
  const { orgId } = await auth();
  if (!orgId) {
    redirect("/organizations");
  }
  return orgId;
};
