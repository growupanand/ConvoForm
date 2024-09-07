import type { CollectedData } from "@convoform/db/src/schema";

/**
 * Format conversation fields data for TableComponent,
 * Example: `<TableComponent tableData={tableData} />`
 * @param collectedData
 * @returns
 */
export function getConversationTableData(collectedData: CollectedData[]) {
  const sanitizedFieldsData: Record<string, string> = {};
  collectedData.map((field) => {
    let fieldValue = field.fieldValue;
    // Handled edge case where field value is not string but object
    if (fieldValue !== null && typeof fieldValue === "object") {
      fieldValue = Object.values(fieldValue).join(", ");
    }
    sanitizedFieldsData[field.fieldName] = fieldValue?.toString() ?? "";
  });

  return sanitizedFieldsData;
}
