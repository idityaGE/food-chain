import { prisma } from '@/db';

import { hash, verifyHash } from '@/services/hashService';
import contractPromise, { provider, address } from '@/services/contractManager';

import { asyncHandler } from "@/utils/asyncHandler"
import { ApiError } from "@/utils/ApiError";
import { ApiResponse } from "@/utils/ApiResponse";

import { CreateBatchSchema } from '@/types/batch';
import { ethers } from 'ethers';

const createBatch = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(401, "Authentication required");
  }

  if (user.role !== 'FARMER') {
    throw new ApiError(403, "Only farmers can create batches");
  }

  const farmerUser = await prisma.stakeholder.findUnique({
    where: {
      id: user.id
    }
  })
  if (!farmerUser) {
    throw new ApiError(401, "Farmer User Not found")
  }

  const publicKey = new ethers.Wallet(farmerUser.privateKey)

  const { success, data } = CreateBatchSchema.safeParse(req.body);
  if (!success) {
    throw new ApiError(400, "Send Proper data");
  }

  const contract = await contractPromise

  const tx = await contract.createProductBatch(
    data.productType,
    data.quantity,
    Math.floor(new Date(data.harvestDate).getTime() / 1000),
    Math.floor(new Date(data.expiryDate).getTime() / 1000),
    data.basePrice,
    "",
    "",
    {
      nonce: await provider.getTransactionCount(address),
    }
  )
  await tx.wait();





})
