import type {
  Form as DBForm,
  FormField as DBFormField,
} from "@convoform/db/src/schema";

export type GenerationStep =
  | "idle"
  | "generating-fields"
  | "reviewing-fields"
  | "generating-metadata"
  | "saving-form"
  | "completed"
  | "error";

export type GeneratedField = {
  fieldName: string;
  fieldDescription: string;
  fieldConfiguration: {
    inputType: string;
    inputConfiguration?: Record<string, any>;
  };
};

export type State = {
  currentStep: GenerationStep;
  progress: number;
  error?: string;
  generatedFields?: GeneratedField[];
  selectedFields?: GeneratedField[];
};

export type GenerateFormModalProps = {
  onFormGenerated?: (
    form: DBForm & {
      formFields: DBFormField[];
    },
  ) => Promise<void>;
  open: boolean;
  setOpen: (open: boolean) => void;
  organizationId: string;
};

export type Template = {
  id: string;
  name: string;
  context: string;
};
