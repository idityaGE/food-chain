import { prisma } from '@/db';

import { hash, verifyHash } from '@/services/hashService';
import contractPromise, { provider, address } from '@/services/contractManager';

import { asyncHandler } from "@/utils/asyncHandler"
import { ApiError } from "@/utils/ApiError";
import { ApiResponse } from "@/utils/ApiResponse";

import { CreateBatchSchema, TransferBatchSchema } from '@/types/batch';
import { ethers } from 'ethers';

const registerBatch = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(401, "Authentication required");
  }

  if (user.role !== 'FARMER') {
    throw new ApiError(403, "Only farmers can create batches");
  }

  const { success, data } = CreateBatchSchema.safeParse(req.body);
  if (!success) {
    throw new ApiError(400, "Invalid batch data provided");
  }

  const harvestDate = Math.floor(new Date(data.harvestDate).getTime() / 1000);
  const expiryDate = Math.floor(new Date(data.expiryDate).getTime() / 1000);

  const basePriceInWei = ethers.parseEther(data.basePrice.toString());

  try {
    const originData = {
      farmerId: user.id,
      farmerName: user.name,
      harvestDate: data.harvestDate,
      location: user.location || '',
    };
    const originHash = await hash(JSON.stringify(originData));

    if (!originHash) {
      throw new ApiError(500, "Failed to create origin hash");
    }

    const contract = await contractPromise;

    const tx = await contract.createProductBatch(
      user.publicKey,
      data.productName,
      data.productType,
      data.quantity,
      harvestDate,
      expiryDate,
      basePriceInWei,
      originHash,
      "", // qualityHash - empty initially
      {
        nonce: await provider.getTransactionCount(address),
      }
    );

    const receipt = await tx.wait();
    if (!receipt) {
      throw new ApiError(500, "Transaction failed");
    }

    const event = receipt.logs
      .map(log => {
        try {
          return contract.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .filter(e => e && e.name === "ProductBatchCreated")[0];

    let blockchainBatchId: number;
    if (event) {
      const batchId = event.args.batchId.toString();
      blockchainBatchId = Number(batchId);
    } else {
      throw new ApiError(500, "Failed to get batch ID from blockchain");
    }

    const batch = await prisma.productBatch.create({
      data: {
        batchId: blockchainBatchId,
        blockchainHash: tx.hash,
        productName: data.productName,
        productType: data.productType,
        variety: data.variety,
        quantity: data.quantity,
        unit: data.unit || "kg",
        harvestDate: new Date(data.harvestDate),
        expiryDate: new Date(data.expiryDate),
        basePrice: data.basePrice,
        currency: "INR",
        farmerId: user.id,
        currentOwnerId: user.id,
        originHash: originHash,
        status: "PRODUCED",
        qualityGrade: "A"
      }
    });

    if (!batch) {
      throw new ApiError(500, "Failed to save batch to database");
    }

    return res.status(201).json(new ApiResponse(201, {
      batchId: batch.id,
      blockchainBatchId: blockchainBatchId,
      txHash: tx.hash
    }, "Batch registered successfully"));

  } catch (error: any) {
    console.error("Error registering batch:", error);

    if (error.code === 'CALL_EXCEPTION') {
      throw new ApiError(400, `Smart contract error: ${error.reason || error.message}`);
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, "Failed to register batch");
  }
});

const transferBatch = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(401, "Authentication required");
  }

  const { success, data } = TransferBatchSchema.safeParse(req.body);
  if (!success) {
    throw new ApiError(400, "Invalid transfer data provided");
  }

  try {
    const batch = await prisma.productBatch.findUnique({
      where: { id: data.batchId },
      include: {
        farmer: true,
        currentOwner: true
      }
    });
    if (!batch) {
      throw new ApiError(404, "Batch not found");
    }

    if (batch.currentOwnerId !== user.id) {
      throw new ApiError(403, "You are not the current owner of this batch");
    }

    const toStakeholder = await prisma.stakeholder.findUnique({
      where: { id: data.toStakeholderId }
    });
    if (!toStakeholder) {
      throw new ApiError(404, "Recipient stakeholder not found");
    }
    if (!toStakeholder.isVerified) {
      throw new ApiError(400, "Recipient stakeholder is not verified");
    }

    const validTransfers: Record<string, string[]> = {
      'FARMER': ['DISTRIBUTOR', 'RETAILER', 'CONSUMER'],
      'DISTRIBUTOR': ['RETAILER', 'CONSUMER'],
      'RETAILER': ['CONSUMER'],
      'CONSUMER': []
    };

    if (!validTransfers[user.role]?.includes(toStakeholder.role)) {
      throw new ApiError(400, `Cannot transfer from ${user.role} to ${toStakeholder.role}`);
    }

    const transferQuantity = data.quantity || Number(batch.quantity);
    const totalPrice = data.pricePerUnit * transferQuantity;
    const totalPriceInWei = ethers.parseEther(totalPrice.toString());

    const transactionData = {
      batchId: batch.batchId,
      from: user.id,
      to: data.toStakeholderId,
      quantity: transferQuantity,
      pricePerUnit: data.pricePerUnit,
      totalPrice: totalPrice,
      timestamp: new Date().toISOString(),
      paymentMethod: data.paymentMethod,
      transportMethod: data.transportMethod,
      vehicleNumber: data.vehicleNumber,
      location: data.location,
      notes: data.notes,
      conditions: data.conditions
    };

    const transactionHash = await hash(JSON.stringify(transactionData));
    if (!transactionHash) {
      throw new ApiError(500, "Failed to create transaction hash");
    }

    const contract = await contractPromise;

    const tx = await contract.transferBatch(
      batch.batchId,
      user.publicKey,
      toStakeholder.publicKey,
      totalPriceInWei,
      transactionHash,
      {
        nonce: await provider.getTransactionCount(address),
      }
    );

    const receipt = await tx.wait();
    if (!receipt) {
      throw new ApiError(500, "Blockchain transaction failed");
    }

    const result = await prisma.$transaction(async (prisma) => {
      const updatedBatch = await prisma.productBatch.update({
        where: { id: data.batchId },
        data: {
          currentOwnerId: data.toStakeholderId,
          status: "IN_TRANSIT",
          updatedAt: new Date()
        }
      });

      const transaction = await prisma.transaction.create({
        data: {
          batchId: data.batchId,
          fromId: user.id,
          toId: data.toStakeholderId,
          transactionType: "SALE",
          quantity: transferQuantity,
          pricePerUnit: data.pricePerUnit,
          totalPrice: totalPrice,
          currency: "INR",
          paymentMethod: data.paymentMethod || "BANK_TRANSFER",
          paymentStatus: "COMPLETED",
          transactionDate: new Date(),
          deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
          location: data.location,
          transportMethod: data.transportMethod,
          vehicleNumber: data.vehicleNumber,
          notes: data.notes,
          conditions: data.conditions,
          blockchainTxHash: tx.hash,
          transactionHash: transactionHash
        }
      });

      return { updatedBatch, transaction };
    });

    return res.status(200).json(new ApiResponse(200, {
      batchId: batch.id,
      blockchainBatchId: batch.batchId,
      transactionId: result.transaction.id,
      txHash: tx.hash,
      from: {
        id: user.id,
        name: user.name,
        role: user.role
      },
      to: {
        id: toStakeholder.id,
        name: toStakeholder.name,
        role: toStakeholder.role
      },
      transferDetails: {
        quantity: transferQuantity,
        pricePerUnit: data.pricePerUnit,
        totalPrice: totalPrice,
        currency: "INR"
      }
    }, "Batch transferred successfully"));

  } catch (error: any) {
    console.error("Error transferring batch:", error);

    if (error.code === 'CALL_EXCEPTION') {
      throw new ApiError(400, `Smart contract error: ${error.reason || error.message}`);
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, "Failed to transfer batch");
  }
});

const getBatch = asyncHandler(async (req, res) => {
  const { batchId } = req.params;

  if (!batchId) {
    throw new ApiError(400, "Batch ID is required");
  }

  try {
    const batch = await prisma.productBatch.findUnique({
      where: { id: batchId },
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            location: true,
            businessName: true,
            profileImage: true,
            isVerified: true,
            registrationDate: true
          }
        },
        currentOwner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            location: true,
            businessName: true,
            profileImage: true,
            isVerified: true
          }
        },
        transactions: {
          include: {
            from: {
              select: {
                id: true,
                name: true,
                role: true,
                businessName: true,
                location: true
              }
            },
            to: {
              select: {
                id: true,
                name: true,
                role: true,
                businessName: true,
                location: true
              }
            }
          },
          orderBy: {
            transactionDate: 'asc'
          }
        },
        qualityReports: {
          include: {
            inspector: {
              select: {
                id: true,
                name: true,
                role: true,
                businessName: true
              }
            }
          },
          orderBy: {
            reportDate: 'desc'
          }
        },
        originData: true,
        certifications: {
          include: {
            certification: {
              include: {
                stakeholder: {
                  select: {
                    id: true,
                    name: true,
                    businessName: true
                  }
                }
              }
            }
          }
        },
        storageInfo: {
          orderBy: {
            storageStartDate: 'desc'
          }
        }
      }
    });

    if (!batch) {
      throw new ApiError(404, "Batch not found");
    }

    const supplyChainJourney: any[] = [
      {
        stage: "Production",
        stakeholder: {
          id: batch.farmer.id,
          name: batch.farmer.name,
          role: batch.farmer.role,
          businessName: batch.farmer.businessName,
          location: batch.farmer.location
        },
        timestamp: batch.createdAt,
        status: "PRODUCED",
        isOrigin: true
      }
    ];

    // Add transaction stages to supply chain journey
    batch.transactions.forEach((transaction, index) => {
      supplyChainJourney.push({
        stage: `Transfer ${index + 1}`,
        stakeholder: {
          id: transaction.to.id,
          name: transaction.to.name,
          role: transaction.to.role,
          businessName: transaction.to.businessName,
          location: transaction.to.location
        },
        timestamp: transaction.transactionDate,
        status: "IN_TRANSIT",
        transactionDetails: {
          quantity: transaction.quantity,
          pricePerUnit: transaction.pricePerUnit,
          totalPrice: transaction.totalPrice,
          paymentMethod: transaction.paymentMethod,
          transportMethod: transaction.transportMethod,
          vehicleNumber: transaction.vehicleNumber
        }
      });
    });

    // Add current status if the batch has been delivered
    if (batch.status === "DELIVERED" || batch.status === "SOLD") {
      const lastIndex = supplyChainJourney.length - 1;
      if (lastIndex >= 0 && supplyChainJourney[lastIndex]) {
        supplyChainJourney[lastIndex].status = batch.status;
      }
    }

    // Calculate batch analytics
    const analytics = {
      totalTransfers: batch.transactions.length,
      totalDistance: 0, // Could be calculated from GPS coordinates
      averagePrice: batch.transactions.length > 0 
        ? batch.transactions.reduce((sum, t) => sum + Number(t.pricePerUnit), 0) / batch.transactions.length 
        : Number(batch.basePrice),
      qualityReportsCount: batch.qualityReports.length,
      certificationsCount: batch.certifications.length,
      storageLocationsCount: batch.storageInfo.length,
      daysInSupplyChain: Math.floor((new Date().getTime() - batch.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
      estimatedShelfLife: Math.floor((batch.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    };

    // Format the response
    const response = {
      batch: {
        id: batch.id,
        batchId: batch.batchId,
        blockchainHash: batch.blockchainHash,
        productName: batch.productName,
        productType: batch.productType,
        variety: batch.variety,
        quantity: batch.quantity,
        unit: batch.unit,
        harvestDate: batch.harvestDate,
        expiryDate: batch.expiryDate,
        status: batch.status,
        qualityGrade: batch.qualityGrade,
        basePrice: batch.basePrice,
        currency: batch.currency,
        originHash: batch.originHash,
        qualityHash: batch.qualityHash,
        createdAt: batch.createdAt,
        updatedAt: batch.updatedAt
      },
      stakeholders: {
        farmer: batch.farmer,
        currentOwner: batch.currentOwner
      },
      supplyChainJourney,
      transactions: batch.transactions.map(t => ({
        id: t.id,
        transactionType: t.transactionType,
        quantity: t.quantity,
        pricePerUnit: t.pricePerUnit,
        totalPrice: t.totalPrice,
        currency: t.currency,
        paymentMethod: t.paymentMethod,
        paymentStatus: t.paymentStatus,
        transactionDate: t.transactionDate,
        deliveryDate: t.deliveryDate,
        location: t.location,
        transportMethod: t.transportMethod,
        vehicleNumber: t.vehicleNumber,
        notes: t.notes,
        conditions: t.conditions,
        blockchainTxHash: t.blockchainTxHash,
        from: t.from,
        to: t.to
      })),
      qualityReports: batch.qualityReports.map(qr => ({
        id: qr.id,
        grade: qr.grade,
        appearance: qr.appearance,
        texture: qr.texture,
        taste: qr.taste,
        aroma: qr.aroma,
        moistureContent: qr.moistureContent,
        sugarContent: qr.sugarContent,
        acidity: qr.acidity,
        pesticideResidue: qr.pesticideResidue,
        heavyMetals: qr.heavyMetals,
        microbiological: qr.microbiological,
        notes: qr.notes,
        images: qr.images,
        reportDate: qr.reportDate,
        expiryDate: qr.expiryDate,
        inspector: qr.inspector
      })),
      originData: batch.originData,
      certifications: batch.certifications.map(bc => ({
        id: bc.id,
        appliedDate: bc.appliedDate,
        verifiedDate: bc.verifiedDate,
        isVerified: bc.isVerified,
        certification: {
          id: bc.certification.id,
          type: bc.certification.type,
          certifyingBody: bc.certification.certifyingBody,
          certificateNumber: bc.certification.certificateNumber,
          issuedDate: bc.certification.issuedDate,
          expiryDate: bc.certification.expiryDate,
          isValid: bc.certification.isValid,
          scope: bc.certification.scope,
          certificateUrl: bc.certification.certificateUrl,
          stakeholder: bc.certification.stakeholder
        }
      })),
      storageInfo: batch.storageInfo,
      analytics
    };

    return res.status(200).json(new ApiResponse(200, response, "Batch details retrieved successfully"));

  } catch (error: any) {
    console.error("Error fetching batch details:", error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, "Failed to fetch batch details");
  }
});

export { registerBatch, transferBatch, getBatch };
