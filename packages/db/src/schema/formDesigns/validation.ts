import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { colorCodeSchema } from "../lib";
import { formDesign } from "./formDesigns";

export const insertFormDesignSchema = createInsertSchema(formDesign, {}).extend(
  {
    backgroundColor: colorCodeSchema,
    fontColor: colorCodeSchema,
  },
);

export const selectFormDesignSchema = createSelectSchema(formDesign, {});

export const updateFormDesignSchema = insertFormDesignSchema.extend({});

export const patchFormDesignSchema = insertFormDesignSchema.partial().extend({
  id: z.string().min(1),
});

export type FormDesign = z.infer<typeof selectFormDesignSchema>;

export const formDesignRenderSchema = selectFormDesignSchema.pick({
  backgroundColor: true,
  fontColor: true,
});

export type FormDesignRenderSchema = z.infer<typeof formDesignRenderSchema>;
