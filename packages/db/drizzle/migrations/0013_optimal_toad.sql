DO $$ BEGIN
 CREATE TYPE "public"."inputTypeEnum" AS ENUM('text');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "FormField" ADD COLUMN "inputType" "inputTypeEnum" DEFAULT 'text' NOT NULL;