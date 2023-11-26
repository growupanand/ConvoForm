import AppNavbar from "@/components/appNavBar";
import { Separator } from "@/components/ui/separator";
import { getCurrentUser } from "@/lib/session";

type Props = {
  children: React.ReactNode;
};

export default async function AuthLayout({ children }: Readonly<Props>) {
  const user = await getCurrentUser();
  return (
    <div className="flex h-screen">
      <div className="bg-white-300 min-w-[200px] bg-gray-50">
        <AppNavbar user={user} />
      </div>
      <div className="container py-5">{children}</div>
    </div>
  );
}
