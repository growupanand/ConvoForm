import type { ExtraStreamData } from "@convoform/db/src/schema";

export function getSubmissionProgress(
  collectedData: ExtraStreamData["collectedData"],
) {
  const totalFieldsRequired = collectedData?.length ?? 0;
  const totalFieldsCollected =
    collectedData?.filter(({ fieldValue }) => Boolean(fieldValue)).length ?? 0;
  const totalProgress = (totalFieldsCollected / totalFieldsRequired) * 100;
  return totalProgress;
}
