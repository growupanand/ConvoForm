import { Form } from "@prisma/client";
import { apiClient } from "../fetch";
import { z } from "zod";
import { formCreateSchema } from "../validations/form";

export const getFormsController = async (workspaceId: string) => {
  const response = await apiClient(`workspaces/${workspaceId}/forms`, {
    method: "GET",
  });
  return (await response.json()) as Form[];
};

export const createFormController = async (
  workspaceId: string,
  form: z.infer<typeof formCreateSchema>
) => {
  const response = await apiClient(`workspaces/${workspaceId}/forms`, {
    method: "POST",
    data: form,
  });
  return (await response.json()) as Form;
};
