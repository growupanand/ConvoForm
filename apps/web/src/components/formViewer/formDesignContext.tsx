"use client";

import { api } from "@/trpc/react";
import type {
  FormDesign,
  FormDesignRenderSchema,
} from "@convoform/db/src/schema";
import {
  DEFAULT_FORM_DESIGN,
  FORM_SECTIONS_ENUMS,
  type FormSections,
} from "@convoform/db/src/schema/formDesigns/constants";
import { createContext, useContext } from "react";

type FormDesignContext = {
  isLoadingFormDesign: boolean;
  defaultFormDesign: FormDesignRenderSchema;
  getCurrentSectionFormDesign: (
    currentSection: FormSections,
  ) => FormDesignRenderSchema;
  formDesigns?: FormDesign[];
};

const FormViewerContext = createContext<FormDesignContext | undefined>(
  undefined,
);

type FormDesignProviderProps = {
  formId: string;
  children: React.ReactNode;
  disableFetchFormDesign?: boolean;
};

export function FormDesignProvider({
  children,
  formId,
  disableFetchFormDesign,
}: Readonly<FormDesignProviderProps>) {
  const { data: formDesigns, isLoading: isLoadingFormDesign } =
    api.formDesign.getAll.useQuery(
      {
        formId,
      },
      {
        queryHash: `formDesign-${formId}`,
        enabled: !disableFetchFormDesign,
      },
    );

  const defaultFormDesign =
    formDesigns?.find(
      (formDesign) =>
        formDesign.screenType === FORM_SECTIONS_ENUMS.defaultScreen,
    ) || DEFAULT_FORM_DESIGN;

  const getCurrentSectionFormDesign = (
    currentSection: FormSections,
  ): FormDesignRenderSchema => {
    const currentSectionFormDesign = formDesigns?.find(
      (formDesign) => formDesign.screenType === currentSection,
    );

    if (
      !currentSectionFormDesign ||
      currentSectionFormDesign?.useDefaultDesign ||
      disableFetchFormDesign
    ) {
      return defaultFormDesign;
    }

    return currentSectionFormDesign;
  };

  return (
    <FormViewerContext.Provider
      value={{
        isLoadingFormDesign,
        defaultFormDesign,
        getCurrentSectionFormDesign,
        formDesigns,
      }}
    >
      {children}
    </FormViewerContext.Provider>
  );
}

export function useFormDesign() {
  const context = useContext(FormViewerContext);
  if (context === undefined) {
    throw new Error("useFormViewer must be used within a FormDesignProvider");
  }
  return context;
}
