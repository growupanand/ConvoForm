"use client";

import Spinner from "@/components/common/spinner";
import { useFormDesign } from "@/components/formViewer/formDesignContext";
import { api } from "@/trpc/react";
import { DEFAULT_FORM_DESIGN } from "@convoform/db/src/schema/formDesigns/constants";
import { sonnerToast } from "@convoform/ui/components/ui/sonner";
import { useEffect } from "react";
import { BasicDesignCard, type FormHookData } from "./basicDesignCard";
import { DesignDefaultScreenCard } from "./designDefaultScreen";
import { DesignEndingScreenCard } from "./designEndingScreen";
import { DesignLandingScreenCard } from "./designLandingScreen";
import { DesignQuestionsScreenCard } from "./designQuestionsScreen";

type Props = {
  organizationId: string;
};

export function FormDesignEditor({ organizationId }: Readonly<Props>) {
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
    <div className="px-5">
      <div className="font-medium text-lg mb-4">Design</div>
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
      <p className="text-muted-foreground ">More options coming soon</p>
    </div>
  );
}
