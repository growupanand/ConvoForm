import AppNavbar from "@/components/appNavbar/appNavBar";
import { StoreInitializer } from "@/components/storeInitializer";
import { getCurrentUser } from "@/lib/session";

type Props = {
  children: React.ReactNode;
};

export default async function AuthLayout({ children }: Readonly<Props>) {
  const user = await getCurrentUser();
  return (
    <StoreInitializer>
      <div className="flex h-screen">
        <div className="bg-white-300 w-[300px] bg-gray-50">
          <AppNavbar user={user} />
        </div>
        <div className="container py-5 overflow-auto">{children}</div>
      </div>
    </StoreInitializer>
  );
}
