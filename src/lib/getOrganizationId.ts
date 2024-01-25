import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs";

export const getOrganizationId = () => {
  const { orgId } = auth();
  if (!orgId) {
    redirect("/");
  }
  return orgId;
};
