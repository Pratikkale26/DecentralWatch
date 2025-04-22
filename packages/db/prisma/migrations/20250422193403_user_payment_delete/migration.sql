/*
  Warnings:

  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `signature` to the `Website` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_websiteId_fkey";

-- AlterTable
ALTER TABLE "Website" ADD COLUMN     "signature" TEXT NOT NULL;

-- DropTable
DROP TABLE "Payment";
