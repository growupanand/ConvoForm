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
        <div className="flex h-screen">
          <div className="bg-white-300 min-w-[300px] bg-gray-50">
            <AppNavbar />
          </div>
          <div className="container py-5 overflow-auto">{children}</div>
        </div>
      </StoreInitializer>
    </OrganizationProvider>
  );
}
