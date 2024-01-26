import { Button } from "@convoform/ui/components/ui/button";
import { Card, CardContent } from "@convoform/ui/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerPortal,
  DrawerTrigger,
} from "@convoform/ui/components/ui/drawer";
import { Eye } from "lucide-react";

import { montserrat } from "@/app/fonts";
import { FormEditorFormSkeleton } from "@/components/formEditorPage/formEditor/formEditorCard";
import NavLinks from "@/components/formEditorPage/navLinks";
import { cn } from "@/lib/utils";

export default function Loading() {
  return (
    <div className="h-full lg:flex">
      <div className="px-3 lg:max-h-[calc(100vh-100px)] lg:w-[400px] lg:min-w-[400px] lg:overflow-auto">
        <NavLinks />
        <Card className="border-0 bg-transparent shadow-none">
          <CardContent className="p-0 lg:pt-6">
            <FormEditorFormSkeleton />

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
                    <div className="h-full pt-3"></div>
                  </DrawerContent>
                </DrawerPortal>
              </Drawer>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex grow items-center justify-center py-3 max-lg:hidden"></div>
    </div>
  );
}
