-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('USER', 'INTERPRETER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('ACTIVE', 'PENDING', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "public"."AuthProvider" AS ENUM ('SMS');

-- CreateEnum
CREATE TYPE "public"."InterpreterStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."SmsVerificationPurpose" AS ENUM ('LOGIN', 'PASSWORD_RESET');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'USER',
    "phone" TEXT,
    "authProvider" "public"."AuthProvider" NOT NULL,
    "status" "public"."UserStatus" NOT NULL DEFAULT 'PENDING',
    "tokenVersion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "nationality" TEXT,
    "preferences" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sms_verifications" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "purpose" "public"."SmsVerificationPurpose" NOT NULL DEFAULT 'LOGIN',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sms_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."refresh_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "deviceInfo" TEXT,
    "ipAddress" TEXT,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."languages" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."interpreter_languages" (
    "id" TEXT NOT NULL,
    "interpreterId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,

    CONSTRAINT "interpreter_languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."specializations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "specializations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."interpreter_specializations" (
    "id" TEXT NOT NULL,
    "interpreterId" TEXT NOT NULL,
    "specializationId" TEXT NOT NULL,

    CONSTRAINT "interpreter_specializations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."certifications" (
    "id" TEXT NOT NULL,
    "interpreterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuer" TEXT,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "documentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."interpreters" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "nationality" TEXT,
    "yearsOfExperience" INTEGER,
    "currentLocation" TEXT,
    "status" "public"."InterpreterStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "onlineStatus" BOOLEAN NOT NULL DEFAULT false,
    "averageRating" DOUBLE PRECISION DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interpreters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "public"."users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_userId_key" ON "public"."user_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "public"."refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "languages_code_key" ON "public"."languages"("code");

-- CreateIndex
CREATE UNIQUE INDEX "languages_name_key" ON "public"."languages"("name");

-- CreateIndex
CREATE UNIQUE INDEX "interpreter_languages_interpreterId_languageId_key" ON "public"."interpreter_languages"("interpreterId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "specializations_name_key" ON "public"."specializations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "interpreter_specializations_interpreterId_specializationId_key" ON "public"."interpreter_specializations"("interpreterId", "specializationId");

-- CreateIndex
CREATE UNIQUE INDEX "interpreters_userId_key" ON "public"."interpreters"("userId");

-- AddForeignKey
ALTER TABLE "public"."user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."interpreter_languages" ADD CONSTRAINT "interpreter_languages_interpreterId_fkey" FOREIGN KEY ("interpreterId") REFERENCES "public"."interpreters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."interpreter_languages" ADD CONSTRAINT "interpreter_languages_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "public"."languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."interpreter_specializations" ADD CONSTRAINT "interpreter_specializations_interpreterId_fkey" FOREIGN KEY ("interpreterId") REFERENCES "public"."interpreters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."interpreter_specializations" ADD CONSTRAINT "interpreter_specializations_specializationId_fkey" FOREIGN KEY ("specializationId") REFERENCES "public"."specializations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."certifications" ADD CONSTRAINT "certifications_interpreterId_fkey" FOREIGN KEY ("interpreterId") REFERENCES "public"."interpreters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."interpreters" ADD CONSTRAINT "interpreters_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
