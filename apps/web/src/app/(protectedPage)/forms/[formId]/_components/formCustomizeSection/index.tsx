"use client";

import Spinner from "@/components/common/spinner";
import { useFormDesign } from "@/components/formViewer/formDesignContext";
import { api } from "@/trpc/react";
import { DEFAULT_FORM_DESIGN } from "@convoform/db/src/schema/formDesigns/constants";
import { sonnerToast } from "@convoform/ui/components/ui/sonner";
import { useEffect } from "react";
import { CustomizeDefaultScreenCard } from "./customizeDefaultScreen";
import { CustomizeEndingScreenCard } from "./customizeEndingScreen";
import { CustomizeLandingScreenCard } from "./customizeLandingScreen";
import { CustomizeQuestionsScreenCard } from "./customizeQuestionsScreen";
import {
  CustomizeScreenBasicCard,
  type FormHookData,
} from "./customizeScreenBasic";

type Props = {
  organizationId: string;
};

export function FormCustomizeSection({ organizationId }: Readonly<Props>) {
  const {
    formId,
    currentSection,
    currentSectionFormDesign,
    isLoadingFormDesign,
    defaultFormDesign,
  } = useFormDesign();
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
    sonnerToast.promise(createPromise, {
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
    return (
      <div className="text-muted-foreground flex items-center gap-2 px-5">
        <Spinner size="sm" />
        loading...
      </div>
    );
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
    sonnerToast.promise(updatePromise, {
      loading: "Saving changes...",
      success: "Changes saved successfully",
      error: "Unable to save changes",
    });
  };

  const renderSection = () => {
    switch (currentSection) {
      case "landing-screen":
        return <CustomizeLandingScreenCard />;
      case "questions-screen":
        return <CustomizeQuestionsScreenCard />;
      case "ending-screen":
        return <CustomizeEndingScreenCard />;
      case "default-screen":
        return <CustomizeDefaultScreenCard />;
      default:
        return null;
    }
  };

  return (
    <div className="px-5">
      <div className="font-medium text-lg mb-4">Design</div>
      <div className="space-y-10">
        <CustomizeScreenBasicCard
          formDesign={currentSectionFormDesign}
          onUpdateFormDesign={handleUpdateFormDesign}
          isSavingFormDesign={isSavingFormDesign}
          currentSection={currentSection}
          defaultFormDesign={defaultFormDesign}
        />
        {renderSection()}
      </div>
    </div>
  );
}

export function ComingSoonCard() {
  return (
    <div>
      <div className=" text-xl">More options</div>
      <p className="text-muted-foreground ">Coming soon</p>
    </div>
  );
}
