/*
  Warnings:

  - The values [EMAIL,GOOGLE,KAKAO,APPLE] on the enum `AuthProvider` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDING_DOCUMENTS] on the enum `InterpreterStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `attemptCount` on the `sms_verifications` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `sms_verifications` table. All the data in the column will be lost.
  - You are about to drop the column `verifiedAt` on the `sms_verifications` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `users` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."AuthProvider_new" AS ENUM ('SMS');
ALTER TABLE "public"."users" ALTER COLUMN "authProvider" TYPE "public"."AuthProvider_new" USING ("authProvider"::text::"public"."AuthProvider_new");
ALTER TYPE "public"."AuthProvider" RENAME TO "AuthProvider_old";
ALTER TYPE "public"."AuthProvider_new" RENAME TO "AuthProvider";
DROP TYPE "public"."AuthProvider_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."InterpreterStatus_new" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'REJECTED');
ALTER TYPE "public"."InterpreterStatus" RENAME TO "InterpreterStatus_old";
ALTER TYPE "public"."InterpreterStatus_new" RENAME TO "InterpreterStatus";
DROP TYPE "public"."InterpreterStatus_old";
COMMIT;

-- DropIndex
DROP INDEX "public"."users_email_key";

-- AlterTable
ALTER TABLE "public"."sms_verifications" DROP COLUMN "attemptCount",
DROP COLUMN "isVerified",
DROP COLUMN "verifiedAt";

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "email",
DROP COLUMN "password";

-- DropEnum
DROP TYPE "public"."DocumentVerificationStatus";
