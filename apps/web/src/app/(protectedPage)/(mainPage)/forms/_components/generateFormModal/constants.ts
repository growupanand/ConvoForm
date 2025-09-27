import { CheckCircle2, FileText, Save, Wand2 } from "lucide-react";
import type { GenerationStep, State } from "./types";

export const initialState: State = {
  currentStep: "idle",
  progress: 0,
  error: undefined,
  generatedFields: undefined,
  selectedFields: undefined,
};

export const steps = [
  {
    id: "generating-fields" as GenerationStep,
    label: "Generating form fields",
    icon: Wand2,
    progress: 20,
  },
  {
    id: "reviewing-fields" as GenerationStep,
    label: "Review & customize fields",
    icon: CheckCircle2,
    progress: 40,
  },
  {
    id: "generating-metadata" as GenerationStep,
    label: "Creating form details",
    icon: FileText,
    progress: 70,
  },
  {
    id: "saving-form" as GenerationStep,
    label: "Saving your form",
    icon: Save,
    progress: 100,
  },
] as const;
