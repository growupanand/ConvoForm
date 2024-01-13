import AppNavbar from "@/components/appNavbar/appNavBar";
import { OrganizationProvider } from "@/components/organizationProvider";
import { StoreInitializer } from "@/components/storeInitializer";

type Props = {
  children: React.ReactNode;
};

export default async function AuthLayout({ children }: Readonly<Props>) {
  return (
    <OrganizationProvider>
      <StoreInitializer stores={["useWorkspaceStore"]}>
        <div className="flex h-screen flex-col lg:flex-row ">
          <AppNavbar />
          <div className="h-full overflow-auto border-l bg-white px-3 lg:container lg:py-5">
            {children}
          </div>
        </div>
      </StoreInitializer>
    </OrganizationProvider>
  );
}
