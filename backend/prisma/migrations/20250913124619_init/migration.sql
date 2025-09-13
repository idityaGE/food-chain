-- CreateEnum
CREATE TYPE "public"."ParticipantType" AS ENUM ('Farmer', 'Distributor', 'Retailer', 'Regulator', 'None');

-- CreateEnum
CREATE TYPE "public"."BatchStatus" AS ENUM ('Registered', 'InTransit', 'AtDistributor', 'AtRetailer', 'Sold', 'Spoiled', 'Disputed');

-- CreateEnum
CREATE TYPE "public"."EventType" AS ENUM ('Registered', 'Transferred', 'QualityCheck', 'PriceUpdate', 'Sold', 'Spoiled', 'DisputeRaised', 'DisputeResolved', 'Other');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactInfo" TEXT,
    "profilePictureUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Participant" (
    "id" TEXT NOT NULL,
    "blockchainAddress" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactInfo" TEXT,
    "location" TEXT,
    "type" "public"."ParticipantType" NOT NULL DEFAULT 'None',
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "organizationName" TEXT,
    "kycDocumentHash" TEXT,
    "licenseHash" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProduceBatch" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "produceType" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "quantityUnit" TEXT NOT NULL,
    "registrationTimestamp" TIMESTAMP(3) NOT NULL,
    "originLocation" TEXT NOT NULL,
    "currentPrice" TEXT NOT NULL,
    "imageHash" TEXT,
    "detailsHash" TEXT,
    "blockchainTxHash" TEXT NOT NULL,
    "qrCodeUrl" TEXT NOT NULL,
    "currentOwnerId" TEXT NOT NULL,
    "status" "public"."BatchStatus" NOT NULL DEFAULT 'Registered',
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProduceBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SupplyChainEvent" (
    "id" TEXT NOT NULL,
    "eventId" BIGINT NOT NULL,
    "batchId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "receiverId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "eventType" "public"."EventType" NOT NULL,
    "location" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "documentHash" TEXT,
    "blockchainTxHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplyChainEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QualityCheck" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "checkerId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "overallResult" TEXT NOT NULL,
    "detailedReportHash" TEXT,
    "imagesHash" TEXT,
    "notes" TEXT,
    "blockchainTxHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QualityCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Dispute" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "disputantId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "detailsHash" TEXT,
    "raisedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "resolvedById" TEXT,
    "resolution" TEXT,
    "resolutionHash" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "blockchainTxHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_blockchainAddress_key" ON "public"."Participant"("blockchainAddress");

-- CreateIndex
CREATE UNIQUE INDEX "ProduceBatch_batchId_key" ON "public"."ProduceBatch"("batchId");

-- CreateIndex
CREATE UNIQUE INDEX "ProduceBatch_blockchainTxHash_key" ON "public"."ProduceBatch"("blockchainTxHash");

-- CreateIndex
CREATE UNIQUE INDEX "ProduceBatch_qrCodeUrl_key" ON "public"."ProduceBatch"("qrCodeUrl");

-- CreateIndex
CREATE UNIQUE INDEX "SupplyChainEvent_eventId_key" ON "public"."SupplyChainEvent"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "SupplyChainEvent_blockchainTxHash_key" ON "public"."SupplyChainEvent"("blockchainTxHash");

-- CreateIndex
CREATE UNIQUE INDEX "QualityCheck_blockchainTxHash_key" ON "public"."QualityCheck"("blockchainTxHash");

-- CreateIndex
CREATE UNIQUE INDEX "Dispute_blockchainTxHash_key" ON "public"."Dispute"("blockchainTxHash");

-- AddForeignKey
ALTER TABLE "public"."Participant" ADD CONSTRAINT "Participant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProduceBatch" ADD CONSTRAINT "ProduceBatch_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "public"."Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProduceBatch" ADD CONSTRAINT "ProduceBatch_currentOwnerId_fkey" FOREIGN KEY ("currentOwnerId") REFERENCES "public"."Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SupplyChainEvent" ADD CONSTRAINT "SupplyChainEvent_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "public"."ProduceBatch"("batchId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SupplyChainEvent" ADD CONSTRAINT "SupplyChainEvent_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "public"."Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SupplyChainEvent" ADD CONSTRAINT "SupplyChainEvent_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "public"."Participant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QualityCheck" ADD CONSTRAINT "QualityCheck_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "public"."ProduceBatch"("batchId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QualityCheck" ADD CONSTRAINT "QualityCheck_checkerId_fkey" FOREIGN KEY ("checkerId") REFERENCES "public"."Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Dispute" ADD CONSTRAINT "Dispute_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "public"."ProduceBatch"("batchId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Dispute" ADD CONSTRAINT "Dispute_disputantId_fkey" FOREIGN KEY ("disputantId") REFERENCES "public"."Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Dispute" ADD CONSTRAINT "Dispute_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "public"."Participant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
