ALTER TABLE "Form" ALTER COLUMN "answerCheckProvider" SET DEFAULT 'none';--> statement-breakpoint
UPDATE "Form" SET "answerCheckProvider" = 'none';