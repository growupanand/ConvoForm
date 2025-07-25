"use client";

import Spinner from "@/components/common/spinner";
import { useFormContext } from "@/components/formViewer/formContext";
import { useFormDesign } from "@/components/formViewer/formDesignContext";
import { api } from "@/trpc/react";
import { DEFAULT_FORM_DESIGN } from "@convoform/db/src/schema/formDesigns/constants";
import { MutedText, Skeleton, toast } from "@convoform/ui";
import { Palette } from "lucide-react";
import { useEffect } from "react";
import { BasicDesignCard, type FormHookData } from "./basicDesignCard";
import { DesignDefaultScreenCard } from "./designDefaultScreen";
import { DesignEndingScreenCard } from "./designEndingScreen";
import { DesignLandingScreenCard } from "./designLandingScreen";
import { DesignQuestionsScreenCard } from "./designQuestionsScreen";

type Props = {
  organizationId: string;
  formId: string;
};

export function FormDesignEditor({ organizationId, formId }: Readonly<Props>) {
  const { currentSection } = useFormContext();
  const { isLoadingFormDesign, defaultFormDesign, formDesigns } =
    useFormDesign();

  const currentSectionFormDesign = formDesigns?.find(
    (formDesign) => formDesign.screenType === currentSection,
  );
  const isSectionSelected = (currentSection as string) !== "";

  const apiUtils = api.useUtils();

  const patchFormDesign = api.formDesign.patch.useMutation({
    onSuccess: () => {
      apiUtils.invalidate(undefined, {
        queryKey: [[`formDesign-${formId}`]],
      });
    },
  });

  const { isPending: isSavingFormDesign } = patchFormDesign;

  const createFormDesign = api.formDesign.create.useMutation({
    onSuccess: () => {
      apiUtils.invalidate(undefined, {
        queryKey: [[`formDesign-${formId}`]],
      });
    },
  });

  const handleCreateDefaultFormDesign = async () => {
    const createPromise = createFormDesign.mutateAsync({
      formId,
      organizationId,
      screenType: currentSection,
      ...DEFAULT_FORM_DESIGN,
    });
    toast.promise(createPromise, {
      loading: "Initializing design...",
      success: "Form design initialized!",
      error: "Failed to initialized form design!",
    });
  };

  useEffect(() => {
    if (
      !isLoadingFormDesign &&
      !currentSectionFormDesign &&
      isSectionSelected
    ) {
      handleCreateDefaultFormDesign();
    }
  }, [currentSectionFormDesign, currentSection, isLoadingFormDesign]);

  if (!isSectionSelected) {
    return null;
  }

  if (isLoadingFormDesign) {
    return <FormDesignEditorSkeleton />;
  }

  if (!currentSectionFormDesign) {
    return (
      <div className="text-muted-foreground flex items-center gap-2 px-5">
        <Spinner size="sm" />
        Initializing design...
      </div>
    );
  }

  const handleUpdateFormDesign = async (updatedFormDesign: FormHookData) => {
    const updatePromise = patchFormDesign.mutateAsync({
      id: currentSectionFormDesign.id,
      ...updatedFormDesign,
    });
    toast.promise(updatePromise, {
      loading: "Saving changes...",
      success: "Changes saved successfully",
      error: "Unable to save changes",
    });
  };

  const getSectionDesignCard = () => {
    switch (currentSection) {
      case "landing-screen":
        return <DesignLandingScreenCard />;
      case "questions-screen":
        return <DesignQuestionsScreenCard />;
      case "ending-screen":
        return <DesignEndingScreenCard />;
      case "default-screen":
        return <DesignDefaultScreenCard />;
      default:
        return null;
    }
  };

  return (
    <div className="px-2">
      <div className="mb-6">
        <div className="font-medium text-lg">
          <Palette className="size-5 me-2 inline " />
          Form Design
        </div>
        <MutedText>Customize the appearance of your form</MutedText>
      </div>
      <div className="space-y-10">
        <BasicDesignCard
          formDesign={currentSectionFormDesign}
          onUpdateFormDesign={handleUpdateFormDesign}
          isSavingFormDesign={isSavingFormDesign}
          currentSection={currentSection}
          defaultFormDesign={defaultFormDesign}
        />
        {getSectionDesignCard()}
      </div>
    </div>
  );
}

export function ComingSoonCard() {
  return (
    <div>
      <MutedText>More options coming soon...</MutedText>
    </div>
  );
}

FormDesignEditor.Skeleton = FormDesignEditorSkeleton;

export function FormDesignEditorSkeleton() {
  return (
    <div className="px-5">
      <div className="font-medium text-lg mb-4">
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="space-y-10">
        {/* Basic Design Card Skeleton */}
        <div className="border rounded-lg p-4">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>

        {/* Section Design Card Skeleton */}
        <div className="border rounded-lg p-4">
          <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
