import { Skeleton } from "@convoform/ui";
import { Info, type LucideIcon } from "lucide-react";
import React from "react";

type IconType = LucideIcon | React.ReactNode;

type Props = {
  metaData?: Record<
    string,
    | {
        value: any | React.ReactNode;
        icon?: IconType;
      }
    | any
    | React.ReactNode
  >;
  excludeKeys?: string[];
};

export default function MetadataCard({
  metaData,
  excludeKeys = [],
}: Readonly<Props>) {
  if (!metaData || Object.keys(metaData).length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <Info className="inline-block mr-2 h-4 w-4" />
        <span>No metadata available</span>
      </div>
    );
  }

  // Extract and flatten nested properties to display
  const flattenedData: Record<
    string,
    {
      value: string | React.ReactNode;
      icon?: IconType;
    }
  > = {};

  // Helper function to extract nested values with path notation (e.g., "userAgent.browser.name")
  const extractNestedValues = (obj: any, parentKey = "") => {
    if (!obj || typeof obj !== "object") return;

    Object.entries(obj).forEach(([key, value]) => {
      const currentKey = parentKey ? `${parentKey}.${key}` : key;

      // Skip excluded keys
      if (excludeKeys.includes(currentKey)) return;

      // Check if value is an object with value and icon properties
      if (value && typeof value === "object" && "value" in value) {
        const displayKey = key.charAt(0).toUpperCase() + key.slice(1);
        flattenedData[displayKey] = {
          value: value.value as React.ReactNode,
          ...("icon" in value && {
            icon: value.icon as IconType,
          }),
        };
      } else if (React.isValidElement(value)) {
        // Handle React elements directly
        const displayKey = key.charAt(0).toUpperCase() + key.slice(1);
        flattenedData[displayKey] = { value };
      } else if (value && typeof value === "object" && !Array.isArray(value)) {
        // Recursively process nested objects
        extractNestedValues(value, currentKey);
      } else if (value !== undefined && value !== null) {
        // Format the label for display
        const displayKey = key.charAt(0).toUpperCase() + key.slice(1);
        flattenedData[displayKey] = { value: String(value) };
      }
    });
  };

  extractNestedValues(metaData);

  return (
    <div className="py-4 flex items-start justify-center space-x-10 divide-x-2 flex-wrap">
      {Object.entries(flattenedData).map(([key, data]) => (
        <MetaInfo key={key} label={key} value={data.value} icon={data.icon} />
      ))}
    </div>
  );
}

MetadataCard.Skeleton = function MetadataCardSkeleton() {
  return (
    <div className="py-4 flex items-start justify-center space-x-10 divide-x-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex flex-col items-start text-sm px-4">
          <Skeleton className="h-3 w-16 mb-1" />
          <Skeleton className="h-5 w-24" />
        </div>
      ))}
    </div>
  );
};

function MetaInfo({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value?: string | React.ReactNode;
  icon?: IconType;
}) {
  function renderIcon(Icon: IconType) {
    if (React.isValidElement(Icon)) {
      return Icon;
    }

    const LIcon = Icon as LucideIcon;
    return <LIcon className="size-4" />;
  }

  return (
    <div className="flex flex-col items-start text-sm px-4 gap-y-1">
      <div className="text-xs font-light text-muted-foreground">{label}</div>
      <div className=" flex items-center gap-x-1">
        {Icon ? renderIcon(Icon) : null}
        {value ?? "-"}
      </div>
    </div>
  );
}
