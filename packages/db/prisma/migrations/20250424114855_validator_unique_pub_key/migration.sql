/*
  Warnings:

  - A unique constraint covering the columns `[publicKey]` on the table `Validator` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Validator_publicKey_key" ON "Validator"("publicKey");
