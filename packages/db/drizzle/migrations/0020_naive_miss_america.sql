-- Rename the column first
ALTER TABLE "Conversation" RENAME COLUMN "isFinished" TO "finishedAt";

-- First drop NOT NULL constraint
ALTER TABLE "Conversation" ALTER COLUMN "finishedAt" DROP NOT NULL;

-- Then drop default
ALTER TABLE "Conversation" ALTER COLUMN "finishedAt" DROP DEFAULT;

-- Finally change the data type from boolean to timestamp
ALTER TABLE "Conversation" ALTER COLUMN "finishedAt" TYPE timestamp USING 
  CASE WHEN "finishedAt" = true THEN "updatedAt" ELSE NULL END;