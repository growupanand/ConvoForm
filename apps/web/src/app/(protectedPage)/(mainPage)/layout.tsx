// import NavigationCardContent from "@/app/(protectedPage)/(mainPage)/_components/navigationCardContent";
import { AppSidebar } from "@/components/app-sidebar";
import { getOrgIdOrRedirect } from "@/lib/getOrganizationId";
import { SidebarInset, SidebarProvider } from "@convoform/ui";

type Props = {
  children: React.ReactNode;
};

export default async function Layout({ children }: Readonly<Props>) {
  const orgId = await getOrgIdOrRedirect();

  return (
    <SidebarProvider>
      <div className="flex w-full h-screen flex-row ">
        <AppSidebar orgId={orgId} />
        <SidebarInset className="bg-white">
          <main className="h-full  grow overflow-auto px-3 lg:px-5 lg:py-5">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
