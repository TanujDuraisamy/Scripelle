/*
  Warnings:

  - Added the optional column `created_by` to the `documents` table.

*/
-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "created_by" INTEGER;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
