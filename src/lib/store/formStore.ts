import { Conversation, Form, FormField, Workspace } from "@prisma/client";
import {
  getFormController,
  getFormConversationsController,
} from "../controllers/form";
import { create } from "zustand";
import { FormSubmitDataSchema } from "@/components/formEditor";
import { timeout } from "../utils";

type WorkspaceStore = {
  formId?: string;
  isLoading: boolean;
  initializeStore: (formId?: string) => Promise<void>;
  form?: Form & { workspace: Workspace; formField: FormField[] };
  fetchForm: () => Promise<void>;
  conversations: Conversation[];
  fetchConversations: () => Promise<void>;
  isLoadingConversations: boolean;
  updateForm: (
    form: Omit<FormSubmitDataSchema, "formField"> & { formField: FormField[] }
  ) => Promise<void>;
};

export const useFormStore = create<WorkspaceStore>((set, get) => ({
  formId: undefined,
  isLoading: true,
  form: undefined,
  conversations: [],
  isLoadingConversations: true,

  initializeStore: async (currentFormId) => {
    const formId = currentFormId || get().formId;
    set({
      isLoading: true,
      form: undefined,
      formId: formId,
      conversations: [],
      isLoadingConversations: true,
    });
    if (formId) {
      await get().fetchForm();
    }
  },

  fetchForm: async () => {
    const { formId } = get();
    if (!formId) {
      return;
    }
    set({
      isLoading: true,
      form: undefined,
      conversations: [],
      isLoadingConversations: true,
    });
    const form = await getFormController(formId);
    set({ form, isLoading: false });
  },

  fetchConversations: async () => {
    const { formId } = get();
    if (!formId) {
      return;
    }
    set({ isLoadingConversations: true });
    const conversations = await getFormConversationsController(formId);

    set({ conversations, isLoadingConversations: false });
  },

  updateForm: async (updatedForm) => {
    const { form } = get();
    if (form === undefined) {
      return;
    }
    set({ form: { ...form, ...updatedForm } });
  },
}));
