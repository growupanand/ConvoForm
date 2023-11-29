import { AppNavbarButton } from "@/components/appNavbar/appNavbarButton";
import BrandName from "@/components/brandName";
import FormEditor from "@/components/formEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

interface FormPageProps {
  params: { formId: string };
}

async function getFormDetails(formId: string) {
  return await db.form.findFirst({
    where: {
      id: formId,
    },
  });
}

export default async function NewFormPage({ params }: FormPageProps) {
  const { formId } = params;
  const form = await getFormDetails(formId);
  if (!form) {
    notFound();
  }

  return (
    <div className="flex h-screen">
      <div className=" w-[400px] bg-gray-50 overflow-auto">
        <div className="flex justify-between items-center sticky top-0 p-3 bg-gray-50">
          <AppNavbarButton />
          <BrandName />
          <Link href={`/workspaces/${form.workspaceId}`}>
            <Button variant="ghost">Back</Button>
          </Link>
        </div>
        <Card className="bg-transparent border-0 shadow-none">
          <CardContent className="pt-3">
            <FormEditor form={form} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
