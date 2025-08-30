import type { ExtraStreamData } from "@convoform/db/src/schema";

export function getSubmissionProgress(
  formFieldResponses: ExtraStreamData["formFieldResponses"],
) {
  const totalFieldsRequired = formFieldResponses?.length ?? 0;
  const totalFieldsCollected =
    formFieldResponses?.filter(({ fieldValue }) => Boolean(fieldValue))
      .length ?? 0;
  const totalProgress = (totalFieldsCollected / totalFieldsRequired) * 100;
  return totalProgress;
}
