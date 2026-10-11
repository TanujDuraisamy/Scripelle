/*
  Warnings:

  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - Added the required column `first_name` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `users` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add new columns with temporary default values
ALTER TABLE "users"
ADD COLUMN "first_name" TEXT NOT NULL DEFAULT '',
ADD COLUMN "last_name" TEXT NOT NULL DEFAULT '',
ADD COLUMN "plan" TEXT NOT NULL DEFAULT 'free',
ADD COLUMN "available_credits" INTEGER NOT NULL DEFAULT 0;

-- Step 2: Migrate existing name data to firstName and lastName
UPDATE "users"
SET "first_name" = SPLIT_PART("name", ' ', 1),
    "last_name" = CASE
        WHEN ARRAY_LENGTH(STRING_TO_ARRAY("name", ' '), 1) > 1
        THEN SUBSTRING("name" FROM POSITION(' ' IN "name") + 1)
        ELSE ''
    END
WHERE "name" IS NOT NULL;

-- Step 3: Drop the old name column
ALTER TABLE "users" DROP COLUMN "name";
