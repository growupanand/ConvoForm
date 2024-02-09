ALTER TABLE "Conversation" ALTER COLUMN "updatedAt" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "Conversation" ALTER COLUMN "updatedAt" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "Form" ALTER COLUMN "updatedAt" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "Form" ALTER COLUMN "updatedAt" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "FormField" ALTER COLUMN "updatedAt" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "FormField" ALTER COLUMN "updatedAt" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "Organization" ALTER COLUMN "updatedAt" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "Organization" ALTER COLUMN "updatedAt" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "updatedAt" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "updatedAt" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "Workspace" ALTER COLUMN "updatedAt" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "Workspace" ALTER COLUMN "updatedAt" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "OrganizationMember" ALTER COLUMN "updatedAt" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "OrganizationMember" ALTER COLUMN "updatedAt" DROP NOT NULL;