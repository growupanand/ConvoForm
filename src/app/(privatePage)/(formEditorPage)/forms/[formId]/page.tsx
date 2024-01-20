import { Metadata } from "next";
import { Eye } from "lucide-react";

import { montserrat } from "@/app/fonts";
import { FormEditorCard } from "@/components/formEditorPage/formEditor/formEditorCard";
import FormPreview from "@/components/formEditorPage/formPreview";
import NavLinks from "@/components/formEditorPage/navLinks";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerPortal,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { getFormFieldsController } from "@/lib/controllers/form";
import { cn } from "@/lib/utils";

type Props = {
  params: { formId: string };
};

export const metadata: Metadata = {
  title: "Form editor",
};

export default async function FormPage({ params: { formId } }: Props) {
  const formFields = await getFormFieldsController(formId);

  return (
    <div className="h-full lg:flex">
      <div className="px-3 lg:max-h-[calc(100vh-100px)] lg:w-[400px] lg:min-w-[400px] lg:overflow-auto">
        <NavLinks />
        <Card className="border-0 bg-transparent shadow-none">
          <CardContent className="p-0 lg:pt-6">
            <FormEditorCard formFields={formFields} />

            <div className="py-3 lg:hidden">
              <Drawer snapPoints={[0.95]}>
                <DrawerTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full", montserrat.className)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Show Preview
                  </Button>
                </DrawerTrigger>
                <DrawerPortal>
                  <DrawerContent className="h-full">
                    <div className="h-full pt-3">
                      <FormPreview noToolbar />
                    </div>
                  </DrawerContent>
                </DrawerPortal>
              </Drawer>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex grow items-center justify-center py-3 max-lg:hidden">
        <div className="h-[100%] w-full pr-3">
          <FormPreview />
        </div>
      </div>
    </div>
  );
}
