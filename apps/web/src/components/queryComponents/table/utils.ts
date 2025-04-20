import type { CollectedData, Conversation } from "@convoform/db/src/schema";

/**
 * Format conversation fields data for TableComponent,
 * Example: `<TableComponent tableData={tableData} />`
 * @param collectedData
 * @returns
 */

export function getConversationTableData(
  collectedData: Conversation["collectedData"],
) {
  if (!collectedData || !Array.isArray(collectedData)) {
    return {};
  }

  return collectedData.reduce(
    (acc, data) => {
      if (!data.fieldName || !data.fieldValue) return acc;

      acc[data.fieldName] = {
        value: data.fieldValue,
        config: data.fieldConfiguration || {},
      };

      return acc;
    },
    {} as Record<
      string,
      { value: string; config: CollectedData["fieldConfiguration"] }
    >,
  );
}
