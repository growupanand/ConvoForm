import prisma from "../db";
import { FormWithFields } from "../types/form";

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
  userId: string
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
  userId: string
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
