ALTER TABLE "users" ALTER COLUMN "available_credits" TYPE DECIMAL(12,2);
ALTER TABLE "users" ADD CONSTRAINT "users_credits_nonnegative" CHECK ("available_credits" >= 0);
ALTER TABLE "documents" ADD COLUMN "context" TEXT NOT NULL DEFAULT '';
