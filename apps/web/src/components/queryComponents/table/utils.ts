import { FieldData } from "@convoform/db";

/**
 * Format conversation fields data for TableComponent,
 * Example: `<TableComponent tableData={tableData} />`
 * @param fieldsData
 * @returns
 */
export function getConversationTableData(fieldsData: FieldData[]) {
  const sanitizedFieldsData: Record<string, string> = {};
  fieldsData.map((field) => {
    let fieldValue = field.fieldValue;
    // Handled edge case where field value is not string but object
    if (fieldValue !== null && typeof fieldValue === "object") {
      fieldValue = Object.values(fieldValue).join(", ");
    }
    sanitizedFieldsData[field.fieldName] = fieldValue?.toString() ?? "";
  });

  return sanitizedFieldsData;
}
