import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight, Home } from "lucide-react";
import { getFormDetailsWithWorkspace } from "@/lib/dbControllers/form";
import FormNameInput from "@/components/formEditor/formNameInput";
import { getCurrentUser } from "@/lib/session";
import NavLinks from "@/components/formEditor/navLinks";

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
  const form = await getFormDetailsWithWorkspace(formId, user.id);
  if (!form) {
    notFound();
  }

  return (
    <div className="h-screen flex flex-col ">
      <div className="flex justify-between items-center sticky top-0 backdrop-blur-md shadow-sm p-3">
        <div className="flex items-center ">
          <Link href={"/dashboard"}>
            <Button variant="link" className="text-sm ">
              <Home className="w-4 h-4 mr-2 " /> Dashboard
            </Button>
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={`/workspaces/${form.workspaceId}`}>
            <Button variant="link">{form.workspace.name}</Button>
          </Link>
          <ChevronRight className="w-4 h-4" />
          <FormNameInput form={form} className="text-md font-semibold" />
        </div>
        <NavLinks form={form} />
      </div>
      {children}
    </div>
  );
}
