/*
  Warnings:

  - You are about to drop the `Dispute` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Participant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProduceBatch` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QualityCheck` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SupplyChainEvent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."StakeholderRole" AS ENUM ('FARMER', 'DISTRIBUTOR', 'RETAILER', 'CONSUMER', 'QUALITY_INSPECTOR');

-- CreateEnum
CREATE TYPE "public"."ProductStatus" AS ENUM ('PRODUCED', 'IN_TRANSIT', 'DELIVERED', 'SOLD', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."QualityGrade" AS ENUM ('A', 'B', 'C', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."CertificationType" AS ENUM ('ORGANIC', 'FAIR_TRADE', 'NON_GMO', 'PESTICIDE_FREE', 'SUSTAINABLE');

-- DropForeignKey
ALTER TABLE "public"."Dispute" DROP CONSTRAINT "Dispute_batchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Dispute" DROP CONSTRAINT "Dispute_disputantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Dispute" DROP CONSTRAINT "Dispute_resolvedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."Participant" DROP CONSTRAINT "Participant_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProduceBatch" DROP CONSTRAINT "ProduceBatch_currentOwnerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProduceBatch" DROP CONSTRAINT "ProduceBatch_farmerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."QualityCheck" DROP CONSTRAINT "QualityCheck_batchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."QualityCheck" DROP CONSTRAINT "QualityCheck_checkerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SupplyChainEvent" DROP CONSTRAINT "SupplyChainEvent_batchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SupplyChainEvent" DROP CONSTRAINT "SupplyChainEvent_participantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SupplyChainEvent" DROP CONSTRAINT "SupplyChainEvent_receiverId_fkey";

-- DropTable
DROP TABLE "public"."Dispute";

-- DropTable
DROP TABLE "public"."Participant";

-- DropTable
DROP TABLE "public"."ProduceBatch";

-- DropTable
DROP TABLE "public"."QualityCheck";

-- DropTable
DROP TABLE "public"."SupplyChainEvent";

-- DropTable
DROP TABLE "public"."User";

-- DropEnum
DROP TYPE "public"."BatchStatus";

-- DropEnum
DROP TYPE "public"."EventType";

-- DropEnum
DROP TYPE "public"."ParticipantType";

-- CreateTable
CREATE TABLE "public"."stakeholders" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "role" "public"."StakeholderRole" NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "registrationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profileImage" TEXT,
    "description" TEXT,
    "location" TEXT,
    "gpsCoordinates" JSONB,
    "businessName" TEXT,
    "businessLicense" TEXT,
    "taxId" TEXT,
    "dataHash" TEXT,

    CONSTRAINT "stakeholders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_batches" (
    "id" TEXT NOT NULL,
    "batchId" INTEGER NOT NULL,
    "blockchainHash" TEXT,
    "productType" TEXT NOT NULL,
    "variety" TEXT,
    "quantity" DECIMAL(65,30) NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "harvestDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "public"."ProductStatus" NOT NULL DEFAULT 'PRODUCED',
    "qualityGrade" "public"."QualityGrade" NOT NULL DEFAULT 'A',
    "basePrice" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "farmerId" TEXT NOT NULL,
    "currentOwnerId" TEXT NOT NULL,
    "originHash" TEXT,
    "qualityHash" TEXT,

    CONSTRAINT "product_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."origin_data" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "farmName" TEXT NOT NULL,
    "farmAddress" TEXT NOT NULL,
    "gpsCoordinates" JSONB NOT NULL,
    "farmSize" DECIMAL(65,30),
    "soilType" TEXT,
    "soilPH" DECIMAL(65,30),
    "climate" TEXT,
    "waterSource" TEXT,
    "seedVariety" TEXT,
    "plantingMethod" TEXT,
    "irrigationMethod" TEXT,
    "fertilizers" JSONB,
    "pesticides" JSONB,
    "harvestMethod" TEXT,
    "weatherData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "origin_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."quality_reports" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "inspectorId" TEXT NOT NULL,
    "grade" "public"."QualityGrade" NOT NULL,
    "appearance" TEXT,
    "texture" TEXT,
    "taste" TEXT,
    "aroma" TEXT,
    "moistureContent" DECIMAL(65,30),
    "sugarContent" DECIMAL(65,30),
    "acidity" DECIMAL(65,30),
    "pesticideResidue" JSONB,
    "heavyMetals" JSONB,
    "microbiological" JSONB,
    "notes" TEXT,
    "images" JSONB,
    "reportDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3),
    "reportHash" TEXT,

    CONSTRAINT "quality_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transactions" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "transactionType" TEXT NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "pricePerUnit" DECIMAL(65,30) NOT NULL,
    "totalPrice" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "paymentMethod" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentRef" TEXT,
    "transactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveryDate" TIMESTAMP(3),
    "location" TEXT,
    "gpsCoordinates" JSONB,
    "transportMethod" TEXT,
    "vehicleNumber" TEXT,
    "driverDetails" JSONB,
    "invoice" TEXT,
    "receipt" TEXT,
    "documents" JSONB,
    "notes" TEXT,
    "conditions" TEXT,
    "blockchainTxHash" TEXT,
    "transactionHash" TEXT,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."certifications" (
    "id" TEXT NOT NULL,
    "stakeholderId" TEXT NOT NULL,
    "type" "public"."CertificationType" NOT NULL,
    "certifyingBody" TEXT NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "issuedDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "scope" TEXT,
    "standards" JSONB,
    "conditions" TEXT,
    "certificateUrl" TEXT,

    CONSTRAINT "certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."batch_certifications" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "certificationId" TEXT NOT NULL,
    "appliedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedDate" TIMESTAMP(3),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "batch_certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."storage_info" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "facilityName" TEXT NOT NULL,
    "facilityType" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "gpsCoordinates" JSONB,
    "temperature" DECIMAL(65,30),
    "humidity" DECIMAL(65,30),
    "atmosphere" TEXT,
    "storageStartDate" TIMESTAMP(3) NOT NULL,
    "storageEndDate" TIMESTAMP(3),
    "qualityAtEntry" TEXT,
    "qualityAtExit" TEXT,
    "losses" DECIMAL(65,30),
    "monitoringData" JSONB,
    "notes" TEXT,

    CONSTRAINT "storage_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changes" JSONB NOT NULL,
    "userId" TEXT,
    "userAddress" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "blockchainTxHash" TEXT,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."qr_codes" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "qrCodeData" TEXT NOT NULL,
    "qrCodeUrl" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "qr_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."qr_scans" (
    "id" TEXT NOT NULL,
    "qrCodeId" TEXT NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scannerType" TEXT,
    "location" TEXT,
    "gpsCoordinates" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "qr_scans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."system_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."price_history" (
    "id" TEXT NOT NULL,
    "productType" TEXT NOT NULL,
    "variety" TEXT,
    "location" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "pricePerUnit" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "marketName" TEXT,
    "source" TEXT,
    "quality" TEXT,

    CONSTRAINT "price_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stakeholders_walletAddress_key" ON "public"."stakeholders"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "stakeholders_email_key" ON "public"."stakeholders"("email");

-- CreateIndex
CREATE UNIQUE INDEX "product_batches_batchId_key" ON "public"."product_batches"("batchId");

-- CreateIndex
CREATE UNIQUE INDEX "origin_data_batchId_key" ON "public"."origin_data"("batchId");

-- CreateIndex
CREATE UNIQUE INDEX "certifications_certificateNumber_key" ON "public"."certifications"("certificateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "batch_certifications_batchId_certificationId_key" ON "public"."batch_certifications"("batchId", "certificationId");

-- CreateIndex
CREATE UNIQUE INDEX "qr_codes_batchId_key" ON "public"."qr_codes"("batchId");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_key_key" ON "public"."system_config"("key");

-- AddForeignKey
ALTER TABLE "public"."product_batches" ADD CONSTRAINT "product_batches_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "public"."stakeholders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_batches" ADD CONSTRAINT "product_batches_currentOwnerId_fkey" FOREIGN KEY ("currentOwnerId") REFERENCES "public"."stakeholders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."origin_data" ADD CONSTRAINT "origin_data_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "public"."product_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quality_reports" ADD CONSTRAINT "quality_reports_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "public"."product_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quality_reports" ADD CONSTRAINT "quality_reports_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "public"."stakeholders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "public"."product_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "public"."stakeholders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_toId_fkey" FOREIGN KEY ("toId") REFERENCES "public"."stakeholders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."certifications" ADD CONSTRAINT "certifications_stakeholderId_fkey" FOREIGN KEY ("stakeholderId") REFERENCES "public"."stakeholders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."batch_certifications" ADD CONSTRAINT "batch_certifications_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "public"."product_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."batch_certifications" ADD CONSTRAINT "batch_certifications_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "public"."certifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."storage_info" ADD CONSTRAINT "storage_info_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "public"."product_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."qr_scans" ADD CONSTRAINT "qr_scans_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "public"."qr_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
