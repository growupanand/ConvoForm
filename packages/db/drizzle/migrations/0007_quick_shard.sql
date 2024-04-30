-- Create a temporary column for the transformed data
ALTER TABLE "Conversation" ADD COLUMN "tempFieldsData" jsonb[];

-- Populate the temporary column with the transformed data
UPDATE "Conversation" 
SET "tempFieldsData" = ARRAY[subquery.transformed_data]
FROM (
  SELECT id, jsonb_agg(jsonb_build_object('fieldName', key, 'fieldValue', value)) as transformed_data
  FROM "Conversation", jsonb_each("formFieldsData")
  GROUP BY id
) AS subquery
WHERE "Conversation".id = subquery.id;


-- Rename the temporary column to the desired name
ALTER TABLE "Conversation" RENAME COLUMN "tempFieldsData" TO "fieldsData";

-- Add the new column "formOverview"
ALTER TABLE "Conversation" ADD COLUMN "formOverview" text;

-- Populate "formOverview" with the corresponding "overview" from the "Form" table
UPDATE "Conversation" 
SET "formOverview" = "Form"."overview"
FROM "Form"
WHERE "Conversation"."formId" = "Form"."id";

-- Set "formOverview" to NOT NULL
ALTER TABLE "Conversation" ALTER COLUMN "formOverview" SET NOT NULL;