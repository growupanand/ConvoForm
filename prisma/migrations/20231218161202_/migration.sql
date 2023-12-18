/*
  Warnings:

  - You are about to drop the `FormResponse` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Journey` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FormResponse" DROP CONSTRAINT "FormResponse_formId_fkey";

-- DropForeignKey
ALTER TABLE "Journey" DROP CONSTRAINT "Journey_formId_fkey";

-- DropTable
DROP TABLE "FormResponse";

-- DropTable
DROP TABLE "Journey";

-- CreateTable
CREATE TABLE "FormField" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fieldName" TEXT NOT NULL,
    "formId" TEXT NOT NULL,

    CONSTRAINT "FormField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "formFieldsData" JSONB NOT NULL,
    "transcript" JSONB[],
    "formId" TEXT NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FormField" ADD CONSTRAINT "FormField_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;
