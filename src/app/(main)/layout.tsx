import { auth, OrganizationList } from "@clerk/nextjs";

import NavigationCard from "@/components/mainNavigation/navigationCard";
import WorkspacesProvider from "@/components/workspacesProvider";

type Props = {
  children: React.ReactNode;
};

export default async function Layout({ children }: Readonly<Props>) {
  const { orgId } = auth();
  if (!orgId) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <OrganizationList
          afterSelectOrganizationUrl="/dashboard"
          hidePersonal
        />
      </div>
    );
  }
  return (
    <WorkspacesProvider orgId={orgId}>
      <div className="flex h-screen flex-col lg:flex-row ">
        <NavigationCard orgId={orgId} />
        <div className="h-full overflow-auto border-l bg-white px-3 lg:container lg:py-5">
          {children}
        </div>
      </div>
    </WorkspacesProvider>
  );
}
