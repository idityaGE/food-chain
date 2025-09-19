/*
  Warnings:

  - Added the required column `productName` to the `product_batches` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."product_batches" ADD COLUMN     "productName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."stakeholders" ALTER COLUMN "isVerified" SET DEFAULT true;
