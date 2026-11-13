import type { RespondentMetadata } from "@convoform/db/src/schema";
import {
  type VisibleConversationLabels,
  getVisibleConversationLabels,
  hasVisibleConversationLabels,
} from "@convoform/db/src/schema/conversations/conversationLabels";
import { Badge } from "@convoform/ui";

import {
  getSentimentVariant,
  getTemperatureVariant,
  getToneVariant,
} from "@/lib/conversationLabelVariants";
import { cn } from "@/lib/utils";

type Props = {
  metaData?: RespondentMetadata | null;
  labels?: VisibleConversationLabels;
  compact?: boolean;
  className?: string;
};

/**
 * Renders the visible response labels. Labels below the confidence threshold
 * are already removed by `getVisibleConversationLabels`.
 */
export function ConversationLabelChips({
  metaData,
  labels: providedLabels,
  compact = false,
  className,
}: Props) {
  const labels = providedLabels ?? getVisibleConversationLabels(metaData);
  if (!hasVisibleConversationLabels(labels)) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {labels.tone && (
        <Badge
          variant={getToneVariant(labels.tone.value)}
          title={formatConfidence(labels.tone.score)}
          className={cn("capitalize", compact && "px-2 py-0")}
        >
          {labels.tone.value}
        </Badge>
      )}
      {labels.sentiment && (
        <Badge
          variant={getSentimentVariant(labels.sentiment.value)}
          title={formatConfidence(labels.sentiment.score)}
          className={cn("capitalize", compact && "px-2 py-0")}
        >
          {labels.sentiment.value}
        </Badge>
      )}
      {labels.temperature && (
        <Badge
          variant={getTemperatureVariant(labels.temperature.value)}
          title={formatConfidence(labels.temperature.score)}
          className={cn(compact && "px-2 py-0")}
        >
          {labels.temperature.value} lead
        </Badge>
      )}
      {labels.categories.map((category) => (
        <Badge
          key={category.categoryId}
          variant="secondary"
          title={formatConfidence(category.score)}
          className={cn(compact && "px-2 py-0")}
        >
          {category.categoryName}: {category.value}
        </Badge>
      ))}
    </div>
  );
}

function formatConfidence(score: number) {
  return `${Math.round(score * 100)}% confidence`;
}
