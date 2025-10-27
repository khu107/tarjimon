/*
  Warnings:

  - You are about to drop the column `name` on the `languages` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `specializations` table. All the data in the column will be lost.
  - Added the required column `nameEn` to the `languages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameRu` to the `languages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameUz` to the `languages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameEn` to the `specializations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameRu` to the `specializations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameUz` to the `specializations` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."AppLanguage" AS ENUM ('UZ', 'RU', 'EN');

-- DropIndex
DROP INDEX "public"."languages_name_key";

-- DropIndex
DROP INDEX "public"."specializations_name_key";

-- AlterTable
ALTER TABLE "public"."languages" DROP COLUMN "name",
ADD COLUMN     "nameEn" TEXT NOT NULL,
ADD COLUMN     "nameRu" TEXT NOT NULL,
ADD COLUMN     "nameUz" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."specializations" DROP COLUMN "name",
ADD COLUMN     "nameEn" TEXT NOT NULL,
ADD COLUMN     "nameRu" TEXT NOT NULL,
ADD COLUMN     "nameUz" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "appLanguage" "public"."AppLanguage" NOT NULL DEFAULT 'UZ';
