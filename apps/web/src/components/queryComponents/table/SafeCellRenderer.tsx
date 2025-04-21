import { renderCellValue } from "./utils";

interface SafeCellRendererProps {
  value: unknown;
  className?: string;
}

/**
 * SafeCellRenderer - A component that safely renders cell values regardless of their type
 * Will properly handle objects from getConversationTableData which have {value, config} structure
 */
export function SafeCellRenderer({
  value,
  className = "",
}: SafeCellRendererProps) {
  // Handle {value, config} objects from getConversationTableData
  if (
    value &&
    typeof value === "object" &&
    "value" in value &&
    "config" in value
  ) {
    const cellData = value as { value: string | null; config: any };
    return (
      <div className={className}>
        {renderCellValue(cellData.value || "", cellData.config)}
      </div>
    );
  }

  // Handle null/undefined
  if (value === null || value === undefined) {
    return <div className={className}>-</div>;
  }

  // Handle arrays (prevent [object Object] display)
  if (Array.isArray(value)) {
    return <div className={className}>{JSON.stringify(value)}</div>;
  }

  // Handle other objects (prevent [object Object] display)
  if (typeof value === "object") {
    return <div className={className}>{JSON.stringify(value)}</div>;
  }

  // Handle primitives
  return <div className={className}>{String(value)}</div>;
}
