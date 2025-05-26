/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Guide` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Guide" ADD COLUMN     "category" TEXT,
ADD COLUMN     "description" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Guide_name_key" ON "Guide"("name");
