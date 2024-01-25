-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "Organization" ALTER COLUMN "slug" DROP NOT NULL;
