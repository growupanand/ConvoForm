import type { ZodSchema } from "@convoform/db";

export const getResponseJSON = async <T>(
  response: Response,
  validationSchema?: ZodSchema<T>,
): Promise<T> => {
  const responseJson = await response.json();
  if (validationSchema) {
    return await validationSchema.parseAsync(responseJson);
  }

  return responseJson;
};
