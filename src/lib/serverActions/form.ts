"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "../db";
import { FormWithFields } from "../types/form";
import { FormCreateSchema } from "../validations/form";

export const getFormDetails = async (formId: string, userId: string) => {
  return await prisma.form.findFirst({
    where: {
      id: formId,
      userId,
    },
  });
};

export const getFormDetailsWithFields = async (
  formId: string,
  userId: string,
) => {
  return (await prisma.form.findFirst({
    where: {
      id: formId,
      userId,
    },
    include: {
      formField: true,
    },
  })) as FormWithFields;
};

export const getFormDetailsWithWorkspace = async (
  formId: string,
  userId: string,
) => {
  return await prisma.form.findFirst({
    where: {
      id: formId,
      userId,
    },
    include: {
      workspace: true,
    },
  });
};

// get form conversations count
export async function getUserTotalConversationsCount(userId: string) {
  // get all form ids for the user
  const forms = await prisma.form.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
    },
  });
  // get all conversations count for the form
  return await prisma.conversation.count({
    where: {
      formId: {
        in: forms.map((form) => form.id),
      },
    },
  });
}

export const deleteForm = async (formId: string, organizationId: string) => {
  revalidatePath("/dashboard", "page");
  return await prisma.form.delete({
    where: {
      id: formId,
      organizationId,
    },
  });
};

export const createForm = async (
  organizationId: string,
  userId: string,
  workspaceId: string,
  newForm: FormCreateSchema,
) => {
  const { formField, ...restForm } = newForm;
  revalidatePath("/dashboard", "page");
  return await prisma.form.create({
    data: {
      workspaceId,
      userId,
      organizationId,
      ...restForm,
      formField: {
        create: formField,
      },
    },
  });
};
