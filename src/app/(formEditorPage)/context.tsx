"use client";

import { db } from "@/lib/db";
import { ConversationForm } from "@/lib/types/form";
import { Form } from "@prisma/client";
import React from "react";

const FormEditorContext = React.createContext<
  | {
      form: ConversationForm;
      handleUpdateForm: (updatedForm: ConversationForm) => void;
    }
  | undefined
>(undefined);

type State = {
  form: ConversationForm;
  refresh: boolean;
};

export function FormEditorContextProvider(props: {
  children: React.ReactNode;
  form: ConversationForm;
}) {
  const [state, setState] = React.useState<State>({
    form: props.form,
    refresh: false,
  });
  const { form, refresh } = state;

  const handleUpdateForm = (updatedForm: ConversationForm) => {
    setState({ ...state, form: updatedForm, refresh: !state.refresh });
  };

  return (
    <FormEditorContext.Provider value={{ form, handleUpdateForm }}>
      {props.children}
    </FormEditorContext.Provider>
  );
}

export function useFormEditorContext() {
  const context = React.useContext(FormEditorContext);
  if (context === undefined) {
    throw new Error(
      "useFormEditorContext must be used within a FormEditorContextProvider"
    );
  }
  return context;
}
