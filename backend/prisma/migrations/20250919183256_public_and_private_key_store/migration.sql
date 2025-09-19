/*
  Warnings:

  - You are about to drop the column `walletAddress` on the `stakeholders` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[privateKey]` on the table `stakeholders` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[publicKey]` on the table `stakeholders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `privateKey` to the `stakeholders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicKey` to the `stakeholders` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."stakeholders_walletAddress_key";

-- AlterTable
ALTER TABLE "public"."stakeholders" DROP COLUMN "walletAddress",
ADD COLUMN     "privateKey" TEXT NOT NULL,
ADD COLUMN     "publicKey" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "stakeholders_privateKey_key" ON "public"."stakeholders"("privateKey");

-- CreateIndex
CREATE UNIQUE INDEX "stakeholders_publicKey_key" ON "public"."stakeholders"("publicKey");
