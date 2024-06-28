ALTER TYPE "inputTypeEnum" ADD VALUE 'multipleChoice';--> statement-breakpoint
ALTER TABLE "FormField" ADD COLUMN "fieldConfiguration" jsonb NOT NULL DEFAULT '{"inputType": "text", "inputConfiguration": {}}';--> statement-breakpoint
ALTER TABLE "FormField" DROP COLUMN IF EXISTS "inputType";--> statement-breakpoint
ALTER TABLE "FormField" ALTER COLUMN "fieldConfiguration" DROP DEFAULT;