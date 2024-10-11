import type { FormWithFormFields } from "@convoform/db/src/schema";
import { API_DOMAIN } from "../constants";
import { getResponseJSON } from "./utils";

export const fetchFormWithFormFields = async (formId: string) => {
  const response = await fetch(`${API_DOMAIN}/api/form/${formId}`);
  return getResponseJSON<FormWithFormFields>(response);
};
