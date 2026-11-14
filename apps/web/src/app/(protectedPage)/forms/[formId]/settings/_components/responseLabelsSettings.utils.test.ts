import { describe, expect, it } from "bun:test";
import type { FormLabelSettings } from "@convoform/db/src/schema/forms/labelSettings";
import {
  SUGGESTED_AUTO_TAGS,
  resolveAutoTagToggle,
  validateAutoTagSettings,
} from "./responseLabelsSettings.utils";

const persisted: FormLabelSettings = {
  categoriesEnabled: true,
  categories: [
    { id: "country", name: "Country", options: ["UK", "Canada"] },
    { id: "budget", name: "Budget", options: ["Under ₹20L", "₹20–40L"] },
  ],
};

describe("resolveAutoTagToggle", () => {
  it("disabling saves the last persisted tags, not unsaved drafts", () => {
    const unsavedDraft = persisted.categories.map((category) => ({
      ...category,
      name: `${category.name} edited`,
      options: ["Draft one", "Draft two"],
    }));

    const result = resolveAutoTagToggle({
      checked: false,
      persisted,
      suggestions: [],
    });

    expect(result).toEqual({
      categoriesEnabled: false,
      categories: persisted.categories,
    });
    expect(result.categories).not.toEqual(unsavedDraft);
  });

  it("enabling with no saved tags seeds the suggested tags", () => {
    const result = resolveAutoTagToggle({
      checked: true,
      persisted: { categoriesEnabled: false, categories: [] },
    });

    expect(result.categoriesEnabled).toBe(true);
    expect(result.categories).toEqual(SUGGESTED_AUTO_TAGS);
  });

  it("enabling with saved tags reuses them instead of seeding suggestions", () => {
    const result = resolveAutoTagToggle({
      checked: true,
      persisted: { ...persisted, categoriesEnabled: false },
    });

    expect(result.categories).toEqual(persisted.categories);
  });
});

describe("validateAutoTagSettings", () => {
  it("accepts valid tags", () => {
    expect(validateAutoTagSettings(persisted).valid).toBe(true);
  });

  it("reports empty names and duplicate tag names", () => {
    const validation = validateAutoTagSettings({
      categoriesEnabled: true,
      categories: [
        { id: "one", name: "", options: ["A", "B"] },
        { id: "two", name: "Country", options: ["A", "B"] },
        { id: "three", name: "country", options: ["A", "B"] },
      ],
    });

    expect(validation.valid).toBe(false);
    expect(validation.byTagId.one?.name).toBe("Tag name is required.");
    expect(validation.byTagId.two?.name).toBe("Tag names must be unique.");
    expect(validation.byTagId.three?.name).toBe("Tag names must be unique.");
  });

  it("reports fewer than two choices, empty choices and duplicates", () => {
    const validation = validateAutoTagSettings({
      categoriesEnabled: true,
      categories: [
        { id: "one", name: "Country", options: ["UK"] },
        { id: "two", name: "Budget", options: ["UK", ""] },
        { id: "three", name: "Intake", options: ["Now", "now"] },
      ],
    });

    expect(validation.byTagId.one?.choices).toContain(
      "Add at least two choices.",
    );
    expect(validation.byTagId.two?.choices).toContain(
      "Choices cannot be empty.",
    );
    expect(validation.byTagId.three?.choices).toContain(
      "Choices must be unique.",
    );
  });
});
