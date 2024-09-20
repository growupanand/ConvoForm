"use client";

import Spinner from "@/components/common/spinner";
import { api } from "@/trpc/react";
import type { FormDesignRenderSchema } from "@convoform/db/src/schema";
import { DEFAULT_FORM_DESIGN } from "@convoform/db/src/schema/formDesigns/constants";
import { sonnerToast } from "@convoform/ui/components/ui/sonner";
import { useEffect } from "react";
import { useFormEditor } from "../formEditorContext";
import { CustomizeDefaultScreenCard } from "./customizeDefaultScreen";
import { CustomizeEndingScreenCard } from "./customizeEndingScreen";
import { CustomizeLandingScreenCard } from "./customizeLandingScreen";
import { CustomizeQuestionsScreenCard } from "./customizeQuestionsScreen";
import { CustomizeScreenBasicCard } from "./customizeScreenBasic";

type Props = {
  organizationId: string;
};

export function FormCustomizeSection({ organizationId }: Readonly<Props>) {
  const { formId, currentSection } = useFormEditor();
  const isSectionSelected = (currentSection as string) !== "";

  const apiUtils = api.useUtils();

  const { isLoading, data } = api.formDesign.getOne.useQuery(
    {
      formId,
      screenType: currentSection,
    },
    {
      queryHash: `formDesign-${formId}-${currentSection}`,
    },
  );

  const patchFormDesign = api.formDesign.patch.useMutation({
    onSuccess: () => {
      apiUtils.invalidate(undefined, {
        queryKey: [[`formDesign-${formId}-${currentSection}`]],
      });
    },
  });

  const { isPending: isSavingFormDesign } = patchFormDesign;

  const createFormDesign = api.formDesign.create.useMutation({
    onSuccess: () => {
      apiUtils.invalidate(undefined, {
        queryKey: [[`formDesign-${formId}-${currentSection}`]],
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
    if (!isLoading && !data && isSectionSelected) {
      handleCreateDefaultFormDesign();
    }
  }, [data, currentSection, isLoading]);

  const formDesign: FormDesignRenderSchema = {
    ...DEFAULT_FORM_DESIGN,
    ...data,
  };

  if (!isSectionSelected) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="text-muted-foreground flex items-center gap-2 px-5">
        <Spinner size="sm" />
        loading...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-muted-foreground flex items-center gap-2 px-5">
        <Spinner size="sm" />
        Initializing design...
      </div>
    );
  }

  const handleUpdateFormDesign = async (
    updatedFormDesign: FormDesignRenderSchema,
  ) => {
    console.log({ updatedFormDesign });
    const updatePromise = patchFormDesign.mutateAsync({
      id: data.id,
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
          formDesign={formDesign}
          onUpdateFormDesign={handleUpdateFormDesign}
          isSavingFormDesign={isSavingFormDesign}
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
