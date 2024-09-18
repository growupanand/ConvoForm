import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { formDesign } from "./formDesigns";

export const insertFormDesignSchema = createInsertSchema(formDesign, {});

export const selectFormDesignSchema = createSelectSchema(formDesign, {});

export const updateFormDesignSchema = insertFormDesignSchema.extend({});

export const patchFormDesignSchema = insertFormDesignSchema.partial().extend({
  id: z.string().min(1),
});

export type FormDesign = z.infer<typeof selectFormDesignSchema>;
