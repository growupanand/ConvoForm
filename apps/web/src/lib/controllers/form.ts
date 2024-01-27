import { Conversation, Form, FormField } from "@convoform/db";
import { z } from "zod";

import { revalidatePathAction } from "@/app/api/serverActions/revalidatePath";
import { apiClient } from "../apiClient";
import {
  formCreateSchema,
  formPatchSchema,
  formUpdateSchema,
} from "../validations/form";

export const getFormController = async (formId: string) => {
  const response = await apiClient(`form/${formId}`, {
    method: "GET",
  });
  return (await response.json()) as Form;
};

export const getFormFieldsController = async (formId: string) => {
  const response = await apiClient(`form/${formId}/formFields`, {
    method: "GET",
  });
  return (await response.json()) as FormField[];
};

export const getFormsController = async (workspaceId: string) => {
  const response = await apiClient(`workspaces/${workspaceId}/forms`, {
    method: "GET",
  });
  return (await response.json()) as Form[];
};

export const createFormController = async (
  workspaceId: string,
  form: z.infer<typeof formCreateSchema>,
) => {
  const response = await apiClient(`workspaces/${workspaceId}/forms`, {
    method: "POST",
    data: form,
  });
  revalidatePathAction("/dashboard");
  return (await response.json()) as Form;
};

export const patchFormController = async (
  formId: string,
  payload: z.infer<typeof formPatchSchema>,
) => {
  const response = await apiClient(`form/${formId}`, {
    method: "PATCH",
    data: payload,
  });

  revalidatePathAction(`/form/${formId}`);

  return (await response.json()) as Form & { formField: FormField[] };
};

export const updateFormController = async (
  formId: string,
  payload: z.infer<typeof formUpdateSchema>,
) => {
  const response = await apiClient(`form/${formId}`, {
    method: "PUT",
    data: payload,
  });

  revalidatePathAction(`/form/${formId}`);

  return (await response.json()) as Form & { formField: FormField[] };
};

export const getFormConversationController = async (conversationId: string) => {
  const response = await apiClient(`conversation/${conversationId}`, {
    method: "GET",
  });
  return (await response.json()) as Conversation;
};

export const getFormConversationsController = async (formId: string) => {
  const response = await apiClient(`form/${formId}/conversations`, {
    method: "GET",
  });
  return (await response.json()) as Conversation[];
};

export const deleteFormController = async (formId: string) => {
  const response = await apiClient(`form/${formId}`, {
    method: "DELETE",
  });
  return (await response.json()) as Form;
};
