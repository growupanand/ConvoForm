import NavigationCardContent from "@/components/mainPage/navigationCardContent";
import NavigationMobileCard from "@/components/mainPage/navigationMobileCard";
import { getOrganizationId } from "@/lib/getOrganizationId";

type Props = {
  children: React.ReactNode;
};

export default async function Layout({ children }: Readonly<Props>) {
  const orgId = getOrganizationId();

  return (
    <div className="flex h-screen flex-col lg:flex-row ">
      {/* Mobile view */}
      <div className="lg:hidden">
        <NavigationMobileCard>
          <NavigationCardContent orgId={orgId} />
        </NavigationMobileCard>
      </div>

      {/* Desktop View */}
      <div className="min-w-[300px] max-lg:hidden">
        <NavigationCardContent orgId={orgId} />
      </div>
      <div className="h-full overflow-auto border-l bg-white px-3 lg:container lg:py-5">
        {children}
      </div>
    </div>
  );
}
