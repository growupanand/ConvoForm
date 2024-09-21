DO $$ BEGIN
 CREATE TYPE "public"."formsectionsenum" AS ENUM('landing-screen', 'questions-screen', 'ending-screen', 'default-screen');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "FormDesign" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"screenType" "formsectionsenum" NOT NULL,
	"backgroundColor" text,
	"fontColor" text,
	"formId" text NOT NULL,
	"organizationId" text NOT NULL,
	CONSTRAINT "FormDesign_id_unique" UNIQUE("id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "FormDesign" ADD CONSTRAINT "FormDesign_formId_Form_id_fk" FOREIGN KEY ("formId") REFERENCES "public"."Form"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
