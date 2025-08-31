"use client";

import { CONVERSATION_END_MESSAGE } from "@convoform/common";
import type { Form, FormDesignRenderSchema } from "@convoform/db/src/schema";
import {
  DEFAULT_FORM_SECTION,
  type FormSections,
} from "@convoform/db/src/schema/formDesigns/constants";
import { type UseConvoFormReturnType, useConvoForm } from "@convoform/react";
import { createContext, useContext, useEffect, useState } from "react";
import { FormDesignProvider, useFormDesign } from "./formDesignContext";

type FormContext = {
  currentSection: FormSections;
  setCurrentSection: (section: FormSections) => void;
  convoFormHook: UseConvoFormReturnType;
  currentFormDesign: FormDesignRenderSchema;
  endScreenMessage: string;
  progress: number;
  form: Form;
};

const formContext = createContext<FormContext | undefined>(undefined);

type ContextProps = {
  children: React.ReactNode;
  form: Form;
  disableFetchFormDesign?: boolean;
};

function FormContextProviderInner({ children, form }: Readonly<ContextProps>) {
  const [currentSection, setCurrentSection] =
    useState<FormSections>(DEFAULT_FORM_SECTION);

  const convoFormHook = useConvoForm({
    formId: form.id,
  });

  const {
    resetConversation,
    initializeConversation,
    progress,
    conversationState,
  } = convoFormHook;

  const isFormSubmissionFinished = conversationState === "completed";

  const { getCurrentSectionFormDesign } = useFormDesign();

  const currentFormDesign = getCurrentSectionFormDesign(currentSection);

  const endScreenMessage =
    form.showCustomEndScreenMessage && form.customEndScreenMessage
      ? form.customEndScreenMessage
      : CONVERSATION_END_MESSAGE;

  // In form editor when user click on questions section, we should start conversation
  useEffect(() => {
    if (
      currentSection === "questions-screen" &&
      (conversationState === "idle" || isFormSubmissionFinished)
    ) {
      initializeConversation();
    }
  }, [currentSection, form]);

  useEffect(() => {
    // If user only changed form design, We don't want to regenerate question,
    // this will save unnecessary AI API calls
    if (currentSection !== "questions-screen") {
      resetConversation();
    }
  }, [form]);

  // Once form submission is finished, we should show ending screen
  useEffect(() => {
    if (isFormSubmissionFinished) {
      setCurrentSection("ending-screen");
    }
  }, [isFormSubmissionFinished]);

  return (
    <formContext.Provider
      value={{
        currentSection,
        setCurrentSection,
        convoFormHook,
        currentFormDesign,
        endScreenMessage,
        progress,
        form,
      }}
    >
      {children}
    </formContext.Provider>
  );
}

export function FormContextProvider({
  children,
  form,
  disableFetchFormDesign,
}: Readonly<ContextProps>) {
  return (
    <FormDesignProvider
      formId={form.id}
      disableFetchFormDesign={disableFetchFormDesign}
    >
      <FormContextProviderInner form={form}>
        {children}
      </FormContextProviderInner>
    </FormDesignProvider>
  );
}

export function useFormContext() {
  const context = useContext(formContext);
  if (context === undefined) {
    throw new Error("useFormViewer must be used within a FormContextProvider");
  }
  return context;
}
