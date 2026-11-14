CREATE TABLE "AiProviderCredential" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"organizationId" text NOT NULL,
	"provider" text NOT NULL,
	"label" text NOT NULL,
	"baseUrl" text,
	"accountId" text,
	"encryptedSecret" text NOT NULL,
	"iv" text NOT NULL,
	"wrappedDataKey" text NOT NULL,
	"keyVersion" integer NOT NULL,
	"last4" text NOT NULL,
	"status" text DEFAULT 'untested' NOT NULL,
	"lastTestedAt" timestamp,
	"lastTestResult" text,
	"createdBy" text NOT NULL,
	CONSTRAINT "AiProviderCredential_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "AiProviderAudit" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"organizationId" text NOT NULL,
	"credentialId" text,
	"userId" text NOT NULL,
	"action" text NOT NULL,
	"provider" text,
	"result" text NOT NULL,
	"errorCode" text,
	CONSTRAINT "AiProviderAudit_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "OrganizationAiSettings" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"organizationId" text NOT NULL,
	"chatCredentialId" text,
	"chatModel" text,
	"decisionsCredentialId" text,
	"decisionsModel" text,
	"backgroundCredentialId" text,
	"backgroundModel" text,
	CONSTRAINT "OrganizationAiSettings_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "OrganizationAiSettings" ADD CONSTRAINT "OrganizationAiSettings_chatCredentialId_AiProviderCredential_id_fk" FOREIGN KEY ("chatCredentialId") REFERENCES "public"."AiProviderCredential"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "OrganizationAiSettings" ADD CONSTRAINT "OrganizationAiSettings_decisionsCredentialId_AiProviderCredential_id_fk" FOREIGN KEY ("decisionsCredentialId") REFERENCES "public"."AiProviderCredential"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "OrganizationAiSettings" ADD CONSTRAINT "OrganizationAiSettings_backgroundCredentialId_AiProviderCredential_id_fk" FOREIGN KEY ("backgroundCredentialId") REFERENCES "public"."AiProviderCredential"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_ai_provider_credential_org_status" ON "AiProviderCredential" USING btree ("organizationId","status");--> statement-breakpoint
CREATE INDEX "idx_ai_provider_audit_org_created_at" ON "AiProviderAudit" USING btree ("organizationId","createdAt");--> statement-breakpoint
CREATE INDEX "idx_ai_provider_audit_credential" ON "AiProviderAudit" USING btree ("credentialId");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_organization_ai_settings_org" ON "OrganizationAiSettings" USING btree ("organizationId");