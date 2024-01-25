"use server";

import { revalidateTag } from "next/cache";

export const revalidateTagAction = (tag: string) => {
  revalidateTag(tag);
};
