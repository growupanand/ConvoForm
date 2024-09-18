"use client";

import { createContext, useContext, useState } from "react";

type FormEditorContextType = {
  currentSection: FormEditorSections | null;
  currentField: string | null;
  setCurrentSection: (section: FormEditorSections) => void;
  setCurrentField: (field: string) => void;
};

const FormEditorContext = createContext<FormEditorContextType | undefined>(
  undefined,
);

export function FormEditorProvider({
  children,
}: { children: React.ReactNode }) {
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

export const FORM_EDITOR_SECTIONS_ENUMS = {
  landingScreen: "landing-screen" as const,
  questionsScreen: "questions-screen" as const,
  endingScreen: "ending-screen" as const,
  customizePage: "customize-page" as const,
};

export const defaultFormEditorSection =
  FORM_EDITOR_SECTIONS_ENUMS.landingScreen as FormEditorSections;

export type FormEditorSections =
  (typeof FORM_EDITOR_SECTIONS_ENUMS)[keyof typeof FORM_EDITOR_SECTIONS_ENUMS];
