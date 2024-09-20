"use client";

import {
  FORM_SECTIONS_ENUMS,
  type FormSections,
} from "@convoform/db/src/schema/formDesigns/constants";
import { createContext, useContext, useState } from "react";

type FormEditorContextType = {
  currentSection: FormSections;
  currentField: string | null;
  setCurrentSection: (section: FormSections) => void;
  setCurrentField: (field: string) => void;
  formId: string;
};

const FormEditorContext = createContext<FormEditorContextType | undefined>(
  undefined,
);

export const defaultFormEditorSection =
  FORM_SECTIONS_ENUMS.landingScreen as FormSections;

export function FormEditorProvider({
  children,
  formId,
}: { children: React.ReactNode; formId: string }) {
  const [currentSection, setCurrentSection] = useState<
    FormEditorContextType["currentSection"]
  >(defaultFormEditorSection);
  const [currentField, setCurrentField] =
    useState<FormEditorContextType["currentField"]>(null);
  return (
    <FormEditorContext.Provider
      value={{
        currentSection,
        currentField,
        setCurrentSection,
        setCurrentField,
        formId,
      }}
    >
      {children}
    </FormEditorContext.Provider>
  );
}

export function useFormEditor() {
  const context = useContext(FormEditorContext);
  if (context === undefined) {
    throw new Error("useFormEditor must be used within a FormEditorProvider");
  }
  return context;
}
