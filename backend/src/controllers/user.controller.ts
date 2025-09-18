import { prisma } from '@/db';
import { RegisterUserSchema } from '@/types/user';

import contractPromise, { provider, address } from '@/services/contractManager';
import { hash } from '@/services/hashService';
import { getRandomWallet } from '@/services/walletService';

import { asyncHandler } from "@/utils/asyncHandler"
import { ApiError } from "@/utils/ApiError";
import { ApiResponse } from "@/utils/ApiResponse";

const registerUser = asyncHandler(async (req, res) => {
  const { success, data } = RegisterUserSchema.safeParse(req.body);
  if (!success) {
    throw new ApiError(400, "Invalid request data");
  }

  const userExists = await prisma.stakeholder.findFirst({
    where: {
      email: data.email
    }
  })
  if (userExists) {
    throw new ApiError(400, "User already exists");
  }

  const wallet = getRandomWallet();
  if (!wallet) {
    throw new ApiError(500, "Failed to generate wallet");
  }

  const hashedPassword = await hash(data.password);
  if (!hashedPassword) {
    throw new ApiError(500, "Failed to hash password");
  }

  const dataHash = await hash(JSON.stringify(data));
  if (!dataHash) {
    throw new ApiError(500, "Failed to hash data");
  }

  const contract = await contractPromise

  const tx = await contract.registerStakeholder(
    wallet.address,
    1,
    data.name,
    dataHash,
    {
      nonce: await provider.getTransactionCount(address)
    }
  )
  await tx.wait();

  const user = await prisma.stakeholder.create({
    data: {
      name: data.name,
      walletAddress: wallet.privateKey,
      password: hashedPassword,
      email: data.email,
      role: data.role,
      phone: data.phone,
      profileImage: data.profileImage,
      businessName: data.businessName,
      location: data.location,
    }
  })

  if (!user) {
    throw new ApiError(500, "Failed to create user");
  }

  return res.status(200).json(new ApiResponse(200, {}, "User registered successfully"));
});

export { registerUser };