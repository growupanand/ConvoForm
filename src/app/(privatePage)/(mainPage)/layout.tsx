import NavigationCardContent from "@/components/mainPage/navigationCardContent";
import NavigationMobileCard from "@/components/mainPage/navigationMobileCard";
import { getWorkspacesController } from "@/lib/controllers/workspace";
import { getOrganizationId } from "@/lib/getOrganizationId";
import Provider from "./provider";

type Props = {
  children: React.ReactNode;
};

export default async function Layout({ children }: Readonly<Props>) {
  const orgId = getOrganizationId();

  const workspaces = await getWorkspacesController(orgId);

  return (
    <Provider workspaces={workspaces} orgId={orgId}>
      <div className="flex h-screen flex-col lg:flex-row ">
        {/* Mobile view */}
        <div className="lg:hidden">
          <NavigationMobileCard>
            <NavigationCardContent />
          </NavigationMobileCard>
        </div>

        {/* Desktop View */}
        <div className="min-w-[300px] max-lg:hidden">
          <NavigationCardContent />
        </div>
        <div className="h-full overflow-auto border-l bg-white px-3 lg:container lg:py-5">
          {children}
        </div>
      </div>
    </Provider>
  );
}
