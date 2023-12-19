import { db } from "../db";
import { FormWithFields } from "../types/form";

export const getFormDetails = async (formId: string) => {
  return await db.form.findFirst({
    where: {
      id: formId,
    },
  });
};

export const getFormDetailsWithFields = async (formId: string) => {
  return (await db.form.findFirst({
    where: {
      id: formId,
    },
    include: {
      formField: true,
    },
  })) as FormWithFields;
};
