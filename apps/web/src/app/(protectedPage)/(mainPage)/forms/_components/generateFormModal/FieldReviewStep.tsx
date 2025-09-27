"use client";

import { Badge, Button, Card, CardContent } from "@convoform/ui";
import { CheckCircle2, Eye, Trash2, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { GeneratedField } from "./types";

type FieldReviewStepProps = {
  fields: GeneratedField[];
  onFieldsConfirmed: (selectedFields: GeneratedField[]) => void;
  onBack: () => void;
};

const getFieldTypeIcon = (inputType: string) => {
  switch (inputType) {
    case "text":
      return "📝";
    case "multipleChoice":
      return "☑️";
    case "datePicker":
      return "📅";
    case "rating":
      return "⭐";
    case "fileUpload":
      return "📎";
    default:
      return "❓";
  }
};

const getFieldTypeLabel = (inputType: string) => {
  switch (inputType) {
    case "text":
      return "Text Input";
    case "multipleChoice":
      return "Multiple Choice";
    case "datePicker":
      return "Date Picker";
    case "rating":
      return "Rating";
    case "fileUpload":
      return "File Upload";
    default:
      return inputType;
  }
};

export function FieldReviewStep({
  fields,
  onFieldsConfirmed,
  onBack,
}: FieldReviewStepProps) {
  const [selectedFields, setSelectedFields] =
    useState<GeneratedField[]>(fields);
  const [viewingField, setViewingField] = useState<GeneratedField | null>(null);

  const removeField = (fieldToRemove: GeneratedField) => {
    setSelectedFields((prev) =>
      prev.filter((field) => field.fieldName !== fieldToRemove.fieldName),
    );
  };

  const handleConfirm = () => {
    if (selectedFields.length > 0) {
      onFieldsConfirmed(selectedFields);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-medium">Review Generated Fields</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          {selectedFields.length} field{selectedFields.length !== 1 ? "s" : ""}{" "}
          generated. Remove any fields you don't want in your form.
        </p>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {selectedFields.map((field, index) => (
          <motion.div
            key={field.fieldName}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-sm transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">
                        {getFieldTypeIcon(field.fieldConfiguration.inputType)}
                      </span>
                      <h4 className="font-medium text-sm truncate">
                        {field.fieldName}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {getFieldTypeLabel(field.fieldConfiguration.inputType)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {field.fieldDescription}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewingField(field)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeField(field)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {selectedFields.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            No fields selected. Your form needs at least one field.
          </p>
          <Button variant="outline" onClick={onBack}>
            Go Back
          </Button>
        </div>
      )}

      {selectedFields.length > 0 && (
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Back to Edit
          </Button>
          <Button onClick={handleConfirm} className="flex-1">
            Confirm Fields ({selectedFields.length})
          </Button>
        </div>
      )}

      {/* Field Detail Modal */}
      {viewingField && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setViewingField(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-background rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Field Details</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewingField(null)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Field Name
                </label>
                <p className="text-sm">{viewingField.fieldName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Field Type
                </label>
                <div className="flex items-center gap-2">
                  <span>
                    {getFieldTypeIcon(
                      viewingField.fieldConfiguration.inputType,
                    )}
                  </span>
                  <p className="text-sm">
                    {getFieldTypeLabel(
                      viewingField.fieldConfiguration.inputType,
                    )}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Description
                </label>
                <p className="text-sm">{viewingField.fieldDescription}</p>
              </div>
              {viewingField.fieldConfiguration.inputConfiguration && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Configuration
                  </label>
                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                    {JSON.stringify(
                      viewingField.fieldConfiguration.inputConfiguration,
                      null,
                      2,
                    )}
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
