/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `tournaments` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "tournaments" ADD COLUMN     "code" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "tournaments_code_key" ON "tournaments"("code");
