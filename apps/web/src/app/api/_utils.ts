import type { NextRequest } from "next/server";
import type { ZodSchema } from "zod";

export const getRequestJSON = async <T>(
  request: NextRequest,
  validationSchema: ZodSchema<T>,
) => {
  const requestJson = await request.json();
  return await validationSchema.parseAsync(requestJson);
};
