"use-client";
import AppNavbar from "@/components/appNavBar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { getCurrentUser } from "@/lib/session";

type Props = {
  children: React.ReactNode;
};

export default async function AuthLayout({ children }: Readonly<Props>) {
  const user = await getCurrentUser();

  return (
    <Sheet modal={false}>
      <SheetContent
        side="left"
        className=" min-w-[200px] bg-gray-50"
        forceMount
      >
        <AppNavbar user={user} />
      </SheetContent>
      {children}
    </Sheet>
  );
}
