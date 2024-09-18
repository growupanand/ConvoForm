import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text } from "drizzle-orm/pg-core";

import { getBaseSchema } from "../base";
import { form } from "../forms/form";
import { FORM_SECTIONS_ENUMS } from "./constants";

const formSectionsEnum = pgEnum("formSectionsEnum", [
  FORM_SECTIONS_ENUMS.landingScreen,
  FORM_SECTIONS_ENUMS.questionsScreen,
  FORM_SECTIONS_ENUMS.endingScreen,
  FORM_SECTIONS_ENUMS.defaultScreen,
]);

export const formDesign = pgTable("Conversation", {
  ...getBaseSchema(),
  screenType: formSectionsEnum("screenType").notNull(),
  backgroundColor: text("backgroundColor"),
  fontColor: text("fontColor"),
  formId: text("formId")
    .notNull()
    .references(() => form.id, { onDelete: "cascade", onUpdate: "cascade" }),
  organizationId: text("organizationId").notNull(),
});

export const formDesignsRelations = relations(formDesign, ({ one }) => ({
  form: one(form, {
    fields: [formDesign.formId],
    references: [form.id],
  }),
}));
