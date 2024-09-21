ALTER TABLE "FormDesign" ALTER COLUMN "backgroundColor" SET DEFAULT '#F9FAFB';--> statement-breakpoint
ALTER TABLE "FormDesign" ALTER COLUMN "backgroundColor" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "FormDesign" ALTER COLUMN "fontColor" SET DEFAULT '#020817';--> statement-breakpoint
ALTER TABLE "FormDesign" ALTER COLUMN "fontColor" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "FormDesign" ADD COLUMN "useDefaultDesign" boolean DEFAULT true NOT NULL;