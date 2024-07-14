import { apiClient } from "../apiClient";

export const revalidatePath = async (
  path: string,
  type?: "layout" | "page",
) => {
  await apiClient("revalidate", {
    method: "GET",
    queryParams: type
      ? {
          path,
          type,
        }
      : undefined,
  });
};
