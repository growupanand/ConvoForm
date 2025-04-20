import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { inputTypeEnum } from "./constants";
import { formField } from "./formField";

export const inputTypeSchema = z.enum(inputTypeEnum.enumValues);
export type InputTypeSchema = z.infer<typeof inputTypeSchema>;

// --- TEXT INPUT CONFIGURATION ---

/**
 * Schema for text input configuration
 * Allows for optional placeholder text and max length
 */
export const textInputConfigSchema = z.object({
  placeholder: z.string().optional(),
  maxLength: z.number().optional(),
  isParagraph: z.boolean().optional(),
});

// --- MULTIPLE CHOICE CONFIGURATION ---

/**
 * Schema for individual choice options within a multiple choice input
 */
const choiceOptionSchema = z.object({
  value: z.string().min(1),
});

/**
 * Schema for multiple choice input configuration
 * Requires at least 2 options and allows optional multi-select
 */
export const multipleChoiceInputConfigSchema = z.object({
  options: choiceOptionSchema.array().min(2, "Must have at least 2 options"),
  allowMultiple: z.boolean().optional(),
});

// --- DATE PICKER CONFIGURATION ---

/**
 * Schema for date picker input configuration
 * Allows for optional min and max date constraints
 */
export const datePickerInputConfigSchema = z.object({
  minDate: z.date().optional(),
  maxDate: z.date().optional(),
});

// --- FIELD CONFIGURATION TYPE SCHEMAS ---

/**
 * Schema for text field configuration
 * Combines the input type with its specific configuration
 */
export const textFieldConfigurationSchema = z.object({
  inputType: z.literal(z.enum(inputTypeEnum.enumValues).Values.text),
  inputConfiguration: textInputConfigSchema,
});

/**
 * Schema for multiple choice field configuration
 * Combines the input type with its specific configuration
 */
export const multipleChoiceFieldConfigurationSchema = z.object({
  inputType: z.literal(z.enum(inputTypeEnum.enumValues).Values.multipleChoice),
  inputConfiguration: multipleChoiceInputConfigSchema,
});

/**
 * Schema for date picker field configuration
 * Combines the input type with its specific configuration
 */
export const datePickerFieldConfigurationSchema = z.object({
  inputType: z.literal(z.enum(inputTypeEnum.enumValues).Values.datePicker),
  inputConfiguration: datePickerInputConfigSchema,
});

/**
 * Union schema for all field configurations
 * Allows for validation of any supported field type
 */
export const fieldConfigurationSchema = z.union([
  textFieldConfigurationSchema,
  multipleChoiceFieldConfigurationSchema,
  datePickerFieldConfigurationSchema,
]);

// --- FORM FIELD CRUD SCHEMAS ---

/**
 * Schema for inserting a new form field
 * Extends the base form field schema with validation rules
 */
export const insertFormFieldSchema = createInsertSchema(formField, {
  fieldName: z.string().min(1),
  fieldDescription: z.string().min(1),
  fieldConfiguration: fieldConfigurationSchema,
});

/**
 * Schema for selecting/retrieving form fields
 * Ensures proper typing for the field configuration
 */
export const selectFormFieldSchema = createSelectSchema(formField, {
  fieldConfiguration: fieldConfigurationSchema,
});

/**
 * Schema for updating a form field
 * Omits the formId (which shouldn't be changed) and requires an ID
 */
export const updateFormFieldSchema = insertFormFieldSchema
  .omit({
    formId: true,
  })
  .extend({
    id: z.string().min(1),
  });

/**
 * Schema for patching a form field (partial update)
 * Makes all fields optional except the ID
 */
export const patchFormFieldSchema = updateFormFieldSchema.partial().extend({
  id: z.string().min(1),
});

// --- EXPORTED TYPES ---
export type FormField = z.infer<typeof selectFormFieldSchema>;
export type InsertFormField = z.infer<typeof insertFormFieldSchema>;
export type TextInputConfigSchema = z.infer<typeof textInputConfigSchema>;
export type DatePickerInputConfigSchema = z.infer<
  typeof datePickerInputConfigSchema
>;
export type MultipleChoiceInputConfigSchema = z.infer<
  typeof multipleChoiceInputConfigSchema
>;
export type FieldConfiguration = z.infer<typeof fieldConfigurationSchema>;
