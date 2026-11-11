import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { getBaseSchema } from "../base";

export const ANSWER_CHECK_PROVIDERS = [
  "none",
  "cloudflare-clef",
  "llm",
] as const;

export type AnswerCheckProvider = (typeof ANSWER_CHECK_PROVIDERS)[number];

export const DEFAULT_ANSWER_CHECK_PROVIDER: AnswerCheckProvider =
  "cloudflare-clef";

export const answerCheckProviderEnum = pgEnum(
  "answerCheckProvider",
  ANSWER_CHECK_PROVIDERS,
);

export const form = pgTable(
  "Form",
  {
    ...getBaseSchema(),
    name: text("name").notNull(),
    overview: text("overview").notNull(),
    welcomeScreenTitle: text("welcomeScreenTitle").notNull(),
    welcomeScreenMessage: text("welcomeScreenMessage").notNull(),
    welcomeScreenCTALabel: text("welcomeScreenCTALabel").notNull(),
    isPublished: boolean("isPublished").default(true).notNull(),
    publishedAt: timestamp("publishedAt").defaultNow(),

    userId: text("userId").notNull(),
    organizationId: text("organizationId").notNull(),
    isAIGenerated: boolean("isAIGenerated").default(false).notNull(),
    showOrganizationName: boolean("showOrganizationName")
      .default(false)
      .notNull(),
    organizationName: text("organizationName"),
    showOrganizationLogo: boolean("showOrganizationLogo")
      .default(false)
      .notNull(),
    organizationLogoUrl: text("organizationLogoUrl"),
    showCustomEndScreenMessage: boolean("showCustomEndScreenMessage")
      .default(false)
      .notNull(),
    customEndScreenMessage: text("customEndScreenMessage"),
    formFieldsOrders: text("formFieldsOrders")
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    endScreenCTAUrl: text("endScreenCTAUrl"),
    endScreenCTALabel: text("endScreenCTALabel"),
    googleFormId: text("googleFormId"),
    answerCheckProvider: answerCheckProviderEnum("answerCheckProvider")
      .default(DEFAULT_ANSWER_CHECK_PROVIDER)
      .notNull(),
  },
  (form) => [
    index("idx_form_org").on(form.organizationId),
    index("idx_form_user_id").on(form.userId),
    index("idx_form_published")
      .on(form.isPublished)
      .where(sql`${form.isPublished} = true`),
    index("idx_form_org_published").on(form.organizationId, form.isPublished),
  ],
);
