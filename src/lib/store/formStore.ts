import { Conversation, Form, FormField, Workspace } from "@prisma/client";
import {
  getFormController,
  getFormConversationsController,
} from "../controllers/form";
import { create } from "zustand";
import { FormSubmitDataSchema } from "@/components/formEditor";

type WorkspaceStore = {
  formId?: string;
  isLoading: boolean;
  initializeStore: (formId?: string) => Promise<void>;
  form?: Form & { workspace: Workspace; formField: FormField[] };
  fetchForm: () => Promise<void>;
  conversations: Conversation[];
  fetchConversations: () => Promise<void>;
  updateForm: (
    form: Omit<FormSubmitDataSchema, "formField"> & { formField: FormField[] }
  ) => Promise<void>;
};

export const useFormStore = create<WorkspaceStore>((set, get) => ({
  formId: undefined,
  isLoading: true,
  form: undefined,
  conversations: [],

  initializeStore: async (currentFormId) => {
    const formId = currentFormId || get().formId;
    set({ isLoading: true, form: undefined, formId: formId });
    if (formId) {
      await get().fetchForm();
    }
  },

  fetchForm: async () => {
    const { formId } = get();
    if (!formId) {
      return;
    }
    set({ isLoading: true, form: undefined });
    const form = await getFormController(formId);
    set({ form, isLoading: false });
  },

  fetchConversations: async () => {
    const { formId } = get();
    console.log({ formId });
    if (!formId) {
      return;
    }
    const conversations = await getFormConversationsController(formId);
    console.log({ conversations });
    set({ conversations });
  },

  updateForm: async (updatedForm) => {
    const { form } = get();
    if (form === undefined) {
      return;
    }
    set({ form: { ...form, ...updatedForm } });
  },
}));
