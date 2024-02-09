CREATE TABLE IF NOT EXISTS "Conversation" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"formFieldsData" jsonb NOT NULL,
	"transcript" jsonb[],
	"formId" text NOT NULL,
	"organizationId" text NOT NULL,
	CONSTRAINT "Conversation_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Form" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"overview" text NOT NULL,
	"welcomeScreenTitle" text NOT NULL,
	"welcomeScreenMessage" text NOT NULL,
	"welcomeScreenCTALabel" text NOT NULL,
	"isPublished" boolean DEFAULT false NOT NULL,
	"publishedAt" timestamp,
	"workspaceId" text NOT NULL,
	"userId" text NOT NULL,
	"organizationId" text NOT NULL,
	CONSTRAINT "Form_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "FormField" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"fieldName" text NOT NULL,
	"formId" text NOT NULL,
	CONSTRAINT "FormField_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Organization" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"slug" text,
	"organizationId" text NOT NULL,
	CONSTRAINT "Organization_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "User" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"email" text NOT NULL,
	"firstName" text,
	"lastName" text,
	"imageUrl" text,
	"userId" text NOT NULL,
	CONSTRAINT "User_id_unique" UNIQUE("id"),
	CONSTRAINT "User_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Workspace" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"userId" text,
	"organizationId" text NOT NULL,
	CONSTRAINT "Workspace_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "OrganizationMember" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"role" text NOT NULL,
	"memberId" text NOT NULL,
	"userId" text NOT NULL,
	"organizationId" text NOT NULL,
	CONSTRAINT "OrganizationMember_id_unique" UNIQUE("id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_formId_Form_id_fk" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Form" ADD CONSTRAINT "Form_workspaceId_Workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "FormField" ADD CONSTRAINT "FormField_formId_Form_id_fk" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
