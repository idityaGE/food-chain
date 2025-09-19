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

export { registerBatch, transferBatch };
