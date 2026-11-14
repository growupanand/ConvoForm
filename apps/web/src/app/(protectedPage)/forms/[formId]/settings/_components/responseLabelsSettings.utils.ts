import type {
  FormLabelCategory,
  FormLabelSettings,
} from "@convoform/db/src/schema/forms/labelSettings";

export const SUGGESTED_AUTO_TAGS: FormLabelCategory[] = [
  {
    id: "suggested-country",
    name: "Country",
    options: ["UK", "Canada", "Australia", "USA", "Germany", "Other"],
  },
  {
    id: "suggested-budget",
    name: "Budget",
    options: ["Under ₹20L", "₹20–40L", "Above ₹40L"],
  },
  {
    id: "suggested-intake",
    name: "Intake",
    options: ["This year", "Next year", "Not sure"],
  },
];

export type AutoTagErrors = {
  name?: string;
  choices?: string[];
};

export type AutoTagValidation = {
  valid: boolean;
  byTagId: Record<string, AutoTagErrors>;
};

/**
 * Resolves the settings persisted by the enable/disable switch.
 *
 * The switch must never save unsaved editor drafts: it always starts from the
 * last persisted categories. Enabling with no saved tags seeds the suggested
 * tags so the editor is not empty.
 */
export function resolveAutoTagToggle(params: {
  checked: boolean;
  persisted: FormLabelSettings;
  suggestions?: FormLabelCategory[];
}): FormLabelSettings {
  const { checked, persisted } = params;
  const suggestions = params.suggestions ?? SUGGESTED_AUTO_TAGS;

  if (!checked) {
    return {
      categoriesEnabled: false,
      categories: persisted.categories,
    };
  }

  return {
    categoriesEnabled: true,
    categories:
      persisted.categories.length > 0
        ? persisted.categories
        : suggestions.map((tag) => ({ ...tag, options: [...tag.options] })),
  };
}

export function validateAutoTagSettings(
  settings: FormLabelSettings,
): AutoTagValidation {
  const byTagId: Record<string, AutoTagErrors> = {};
  const nameCounts = new Map<string, number>();

  for (const tag of settings.categories) {
    const normalizedName = tag.name.trim().toLowerCase();
    if (normalizedName) {
      nameCounts.set(normalizedName, (nameCounts.get(normalizedName) ?? 0) + 1);
    }
  }

  for (const tag of settings.categories) {
    const errors: AutoTagErrors = {};
    const normalizedName = tag.name.trim().toLowerCase();

    if (!normalizedName) {
      errors.name = "Tag name is required.";
    } else if ((nameCounts.get(normalizedName) ?? 0) > 1) {
      errors.name = "Tag names must be unique.";
    }

    const choices = tag.options.map((choice) => choice.trim());
    const nonEmptyChoices = choices.filter((choice) => choice.length > 0);
    const choiceCounts = new Map<string, number>();

    for (const choice of nonEmptyChoices) {
      const normalizedChoice = choice.toLowerCase();
      choiceCounts.set(
        normalizedChoice,
        (choiceCounts.get(normalizedChoice) ?? 0) + 1,
      );
    }

    const choiceErrors: string[] = [];
    if (nonEmptyChoices.length < 2) {
      choiceErrors.push("Add at least two choices.");
    }
    if (nonEmptyChoices.length < choices.length) {
      choiceErrors.push("Choices cannot be empty.");
    }
    if ([...choiceCounts.values()].some((count) => count > 1)) {
      choiceErrors.push("Choices must be unique.");
    }
    if (choiceErrors.length > 0) {
      errors.choices = choiceErrors;
    }

    if (errors.name || errors.choices) {
      byTagId[tag.id] = errors;
    }
  }

  return {
    valid: Object.keys(byTagId).length === 0,
    byTagId,
  };
}

export function autoTagSettingsEqual(
  a: FormLabelSettings,
  b: FormLabelSettings,
) {
  return JSON.stringify(a) === JSON.stringify(b);
}
