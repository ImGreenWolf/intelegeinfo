/*
  Warnings:

  - A unique constraint covering the columns `[fileUUID]` on the table `Project` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Project_fileUUID_key" ON "Project"("fileUUID");
