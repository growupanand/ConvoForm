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
import { createContext, useContext, useState } from "react";

type FormViewerContextType = {
  currentSection: FormSections;
  setCurrentSection: (section: FormSections) => void;
  formId: string;
  currentSectionFormDesign?: FormDesign;
  isLoadingFormDesign: boolean;
  defaultFormDesign: FormDesignRenderSchema;
  activeFormDesign: FormDesignRenderSchema;
};

const FormViewerContext = createContext<FormViewerContextType | undefined>(
  undefined,
);

export const defaultFormViewerSection =
  FORM_SECTIONS_ENUMS.landingScreen as FormSections;

export function FormDesignProvider({
  children,
  formId,
}: { children: React.ReactNode; formId: string }) {
  const [currentSection, setCurrentSection] = useState<FormSections>(
    defaultFormViewerSection,
  );

  const { data: formDesigns, isLoading: isLoadingFormDesign } =
    api.formDesign.getAll.useQuery(
      {
        formId,
      },
      {
        queryHash: `formDesign-${formId}`,
      },
    );

  // If User have set default colors setting on for current section
  const defaultFormDesign =
    formDesigns?.find(
      (formDesign) =>
        formDesign.screenType === FORM_SECTIONS_ENUMS.defaultScreen,
    ) || DEFAULT_FORM_DESIGN;

  const currentSectionFormDesign = formDesigns?.find(
    (formDesign) => formDesign.screenType === currentSection,
  );

  // To avoid unnecessary logics handling to determine which form design to use
  const activeFormDesign =
    currentSectionFormDesign !== undefined &&
    currentSectionFormDesign.useDefaultDesign === false
      ? currentSectionFormDesign
      : defaultFormDesign;

  return (
    <FormViewerContext.Provider
      value={{
        currentSection,
        setCurrentSection,
        formId,
        currentSectionFormDesign,
        isLoadingFormDesign,
        defaultFormDesign,
        activeFormDesign,
      }}
    >
      {children}
    </FormViewerContext.Provider>
  );
}

export function useFormDesign() {
  const context = useContext(FormViewerContext);
  if (context === undefined) {
    throw new Error("useFormViewer must be used within a FormViewerProvider");
  }
  return context;
}
