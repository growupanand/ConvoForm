ALTER TYPE "public"."inputTypeEnum" ADD VALUE 'fileUpload';--> statement-breakpoint
CREATE TABLE "FileUpload" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"originalName" text NOT NULL,
	"storedName" text NOT NULL,
	"storedPath" text NOT NULL,
	"mimeType" text NOT NULL,
	"fileSize" integer NOT NULL,
	"organizationId" text NOT NULL,
	"formId" text NOT NULL,
	"conversationId" text,
	"expiresAt" timestamp NOT NULL,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"downloadCount" integer DEFAULT 0 NOT NULL,
	"lastDownloadedAt" timestamp,
	CONSTRAINT "FileUpload_id_unique" UNIQUE("id")
);
