ALTER TABLE "Form" ALTER COLUMN "isPublished" SET DEFAULT true;--> statement-breakpoint
ALTER TABLE "Form" ALTER COLUMN "publishedAt" SET DEFAULT now();