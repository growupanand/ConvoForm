import NavigationCardContent from "@/app/(protectedPage)/(mainPage)/_components/navigationCardContent";
import NavigationMobileCard from "@/app/(protectedPage)/(mainPage)/_components/navigationMobileCard";
import { getOrganizationId } from "@/lib/getOrganizationId";

// import {motion} from "framer-motion";

type Props = {
  children: React.ReactNode;
};

export default async function Layout({ children }: Readonly<Props>) {
  const orgId = getOrganizationId();

  return (
    <div className="flex h-screen flex-col lg:flex-row">
      {/* Mobile view */}
      <div className="lg:hidden">
        <NavigationMobileCard>
          <NavigationCardContent
            orgId={orgId}
            workspacesLinks={undefined}
            workspace={undefined}
          />
        </NavigationMobileCard>
      </div>

      {/* Desktop View */}
      <div className="min-w-[300px] max-lg:hidden">
        <NavigationCardContent
          orgId={orgId}
          workspacesLinks={undefined}
          workspace={undefined}
        />
      </div>
      <div className="h-full grow overflow-auto border-l bg-white px-3 lg:px-5 lg:py-5">
        {/* <motion.div transition={{duration: 0.5}} > */}
        {children}
        {/* </motion.div> */}
      </div>
    </div>
  );
}
