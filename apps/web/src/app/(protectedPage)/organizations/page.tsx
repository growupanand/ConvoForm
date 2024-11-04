import { TopHeader } from "@/components/common/topHeader";
import { OrganizationList } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col ">
      <TopHeader hideSignIn />
      <div className="grow flex items-center justify-center">
        <OrganizationList
          afterSelectOrganizationUrl="/dashboard"
          hidePersonal
        />
      </div>
    </div>
  );
}
