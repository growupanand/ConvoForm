import { PublicLayoutHeader } from "@/components/common/publicLayout/publicLayoutHeader";
import { OrganizationList } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col ">
      <PublicLayoutHeader hideSignIn />
      <div className="grow flex items-center justify-center">
        <OrganizationList
          afterSelectOrganizationUrl="/dashboard"
          hidePersonal
        />
      </div>
    </div>
  );
}
