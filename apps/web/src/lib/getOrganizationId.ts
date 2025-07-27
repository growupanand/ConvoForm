import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const getOrgIdOrRedirect = async () => {
  const { orgId } = await auth();
  if (!orgId) {
    redirect("/organizations");
  }
  return orgId;
};

export const getOrgId = async () => {
  const { orgId } = await auth();
  return orgId;
};
