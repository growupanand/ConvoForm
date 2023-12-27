import { auth } from "@clerk/nextjs";

export const getOrganizationId = () => {
  const { orgId } = auth();
  if (!orgId) {
    const error = new Error("Organization not found");
    error.name = "Unauthorized";
    throw error;
  }
  return orgId;
};
