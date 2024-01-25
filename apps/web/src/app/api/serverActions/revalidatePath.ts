"use server";

import { revalidatePath } from "next/cache";

export const revalidatePathAction = (
  path: string,
  type?: "page" | "layout",
) => {
  revalidatePath(path, type);
};
