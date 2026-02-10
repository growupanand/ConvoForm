import { FormEditPageLayout } from "@/components/formEditPageLayout";
import { Card, Skeleton } from "@convoform/ui";
import { FormDesignEditorSkeleton } from "./_components/formDesignEditor/index";
import { FormEditorFormSkeleton } from "./_components/formEditor/formEditorCard";
import { MainNavTabSkeleton } from "./_components/mainNavTab";

export default function Loading() {
  return (
    <FormEditPageLayout
      leftSidebar={
        <div className="flex h-full w-full flex-col space-y-4">
          <MainNavTabSkeleton />
          <div className="relative grow overflow-auto">
            <Card className="border-0 bg-transparent shadow-none">
              <FormEditorFormSkeleton />
            </Card>
          </div>
        </div>
      }
      rightSidebar={<FormDesignEditorSkeleton />}
    >
      <Skeleton className="h-full w-full" />
    </FormEditPageLayout>
  );
}
