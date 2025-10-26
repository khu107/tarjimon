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
