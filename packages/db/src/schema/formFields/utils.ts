import { INPUT_TYPES_MAP } from "./constants";
import type { FieldConfiguration, FormField } from "./validation";

export const restoreDateFields = (
  fieldConfiguration: FormField["fieldConfiguration"],
) => {
  /**
   * TODO: Find a way to fix this
   * Currently we are saving fieldConfiguration as jsonb in the database, and
   * minDate and maxDate are saved as string in the database though they are Date objects passed while saving.
   * So we need to convert them back to Date objects here, Because we have defined there types as Date objects in the schema.
   */

  if (fieldConfiguration.inputType === "datePicker") {
    const minDate = fieldConfiguration.inputConfiguration.minDate;
    fieldConfiguration.inputConfiguration.minDate = minDate
      ? new Date(minDate)
      : undefined;

    const maxDate = fieldConfiguration.inputConfiguration.maxDate;
    fieldConfiguration.inputConfiguration.maxDate = maxDate
      ? new Date(maxDate)
      : undefined;
  }
  return fieldConfiguration;
};

export const shouldSkipValidation = (
  inputType: FieldConfiguration["inputType"],
) => {
  return INPUT_TYPES_MAP[inputType].saveExactValue;
};
