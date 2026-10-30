import { PublicLayoutHeader } from "@/components/common/publicLayout/publicLayoutHeader";
import { resolvePersonalWorkspace } from "@/lib/ensurePersonalWorkspace";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ActivatePersonalOrganization } from "./activatePersonalOrganization";
import { OrganizationPicker } from "./organizationPicker";

export const dynamic = "force-dynamic";

export default async function Page() {
  const { userId, orgId } = await auth();
  if (!userId) {
    redirect("/auth/sign-in");
  }

  const resolution = orgId
    ? { kind: "picker" as const }
    : await resolvePersonalWorkspace(userId);

  return (
    <div className="min-h-screen flex flex-col ">
      <PublicLayoutHeader hideSignIn />
      <div className="flex grow items-center justify-center px-4">
        {resolution.kind === "activate" ? (
          <ActivatePersonalOrganization
            organizationId={resolution.organizationId}
          />
        ) : (
          <OrganizationPicker />
        )}
      </div>
    </div>
  );
}
