import { prisma } from '@/db';

import { hash, verifyHash } from '@/services/hashService';
import contractPromise, { provider, address } from '@/services/contractManager';

import { asyncHandler } from "@/utils/asyncHandler"
import { ApiError } from "@/utils/ApiError";
import { ApiResponse } from "@/utils/ApiResponse";

import { CreateBatchSchema } from '@/types/batch';
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

    const batchCreatedEvent = receipt.logs.find((log: any) =>
      log.topics[0] === ethers.id("ProductBatchCreated(uint256,address,string)")
    );

    let blockchainBatchId: number;
    if (batchCreatedEvent) {
      const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
        ['uint256'],
        batchCreatedEvent.data
      );
      blockchainBatchId = Number(decoded[0]);
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

export { registerBatch };
