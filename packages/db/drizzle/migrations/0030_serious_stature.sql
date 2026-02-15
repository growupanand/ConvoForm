CREATE TABLE "Integration" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"userId" text NOT NULL,
	"provider" text NOT NULL,
	"encryptedAccessToken" text NOT NULL,
	"encryptedRefreshToken" text,
	"expiresAt" timestamp,
	CONSTRAINT "Integration_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "FormIntegration" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"formId" text NOT NULL,
	"integrationId" text NOT NULL,
	"config" json DEFAULT '{}'::json,
	"enabled" boolean DEFAULT true NOT NULL,
	CONSTRAINT "FormIntegration_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE INDEX "idx_form_integration_form_id" ON "FormIntegration" USING btree ("formId");--> statement-breakpoint
CREATE INDEX "idx_form_integration_integration_id" ON "FormIntegration" USING btree ("integrationId");