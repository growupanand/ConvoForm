import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight, Home } from "lucide-react";
import NavLinks from "@/components/formEditor/navLinks";
import { getFormDetails } from "@/lib/dbControllers/form";
import FormNameInput from "@/components/formEditor/formNameInput";
import { getCurrentUser } from "@/lib/session";

type Props = {
  children: React.ReactNode;
  params: { formId: string };
};

export default async function AuthLayout({
  children,
  params,
}: Readonly<Props>) {
  const { formId } = params;
  const user = await getCurrentUser();
  const form = await getFormDetails(formId, user.id);
  console.log({ formId });
  if (!form) {
    notFound();
  }
  return (
    <div className="h-screen flex flex-col ">
      <div className="flex justify-between items-center sticky top-0 bg-gray-50/75 backdrop-blur-md shadow-sm">
        <div className="flex items-center">
          <Link href={"/dashboard"}>
            <Button variant="link">
              <Home className="w-4 h-4 mr-2" /> Dashboard
            </Button>
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={`/workspaces/${form.workspaceId}`}>
            <Button variant="link">Workspace</Button>
          </Link>
        </div>
        <FormNameInput form={form} />
        <div className="my-3 flex items-center gap-2 px-3">
          <NavLinks form={form} />
        </div>
      </div>
      {children}
    </div>
  );
}
