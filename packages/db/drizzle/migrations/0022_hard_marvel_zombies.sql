ALTER TYPE "public"."inputTypeEnum" ADD VALUE 'rating';--> statement-breakpoint
ALTER TABLE "Conversation" ADD COLUMN "metaData" jsonb DEFAULT '{}'::jsonb NOT NULL;