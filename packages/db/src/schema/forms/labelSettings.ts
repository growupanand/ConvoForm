import { z } from "zod/v4";

export const MAX_FORM_LABEL_CATEGORIES = 3;
export const MAX_FORM_LABEL_OPTIONS = 6;

export const formLabelCategorySchema = z.object({
  id: z
    .string()
    .min(1)
    .max(40)
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Category id may only contain letters, numbers, hyphens and underscores",
    ),
  name: z.string().trim().min(1).max(40),
  options: z
    .array(z.string().trim().min(1).max(60))
    .min(2)
    .max(MAX_FORM_LABEL_OPTIONS),
});

export const formLabelSettingsSchema = z
  .object({
    /** Custom categories are experimental and off by default. */
    categoriesEnabled: z.boolean().default(false),
    categories: z
      .array(formLabelCategorySchema)
      .max(MAX_FORM_LABEL_CATEGORIES)
      .default([]),
  })
  .superRefine((settings, ctx) => {
    const seenIds = new Set<string>();
    const seenNames = new Set<string>();

    settings.categories.forEach((category, index) => {
      if (seenIds.has(category.id)) {
        ctx.addIssue({
          code: "custom",
          message: "Category ids must be unique",
          path: ["categories", index, "id"],
        });
      }
      seenIds.add(category.id);

      const normalizedName = category.name.toLowerCase();
      if (seenNames.has(normalizedName)) {
        ctx.addIssue({
          code: "custom",
          message: "Category names must be unique",
          path: ["categories", index, "name"],
        });
      }
      seenNames.add(normalizedName);

      const seenOptions = new Set<string>();
      category.options.forEach((option, optionIndex) => {
        const normalizedOption = option.toLowerCase();
        if (seenOptions.has(normalizedOption)) {
          ctx.addIssue({
            code: "custom",
            message: "Category options must be unique",
            path: ["categories", index, "options", optionIndex],
          });
        }
        seenOptions.add(normalizedOption);
      });
    });
  });

export type FormLabelCategory = z.infer<typeof formLabelCategorySchema>;
export type FormLabelSettings = z.infer<typeof formLabelSettingsSchema>;

export const DEFAULT_FORM_LABEL_SETTINGS: FormLabelSettings = {
  categoriesEnabled: false,
  categories: [],
};
