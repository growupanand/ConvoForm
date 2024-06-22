ALTER TABLE "FormField" ADD COLUMN "fieldDescription" text;

-- Copy existing fieldName values to fieldDescription
UPDATE "FormField"
SET "fieldDescription" = "fieldName";

-- Set "fieldDescription" to NOT NULL
ALTER TABLE "FormField" ALTER COLUMN "fieldDescription" SET NOT NULL;