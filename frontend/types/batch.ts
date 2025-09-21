import { z } from 'zod';
import { StakeholderRoleType } from './user';

export const CreateBatchSchema = z.object({
  productName: z.string().min(1).max(100),
  productType: z.string().min(1).max(100),
  variety: z.string().max(100).optional(),
  quantity: z.number().positive(),
  unit: z.string().default("kg"),
  harvestDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid harvest date format"
  }),
  expiryDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid expiry date format"
  }),
  basePrice: z.number().positive(),
}).refine((data) => {
  const harvestDate = new Date(data.harvestDate);
  const expiryDate = new Date(data.expiryDate);
  return expiryDate > harvestDate;
}, {
  message: "Expiry date must be after harvest date",
  path: ["expiryDate"]
});

export const TransferBatchSchema = z.object({
  batchId: z.string().min(1, "Batch ID is required"),
  toStakeholderEmail: z.email("Invalid email address"),
  pricePerUnit: z.number().positive("Price per unit must be positive"),
  quantity: z.number().positive("Quantity must be positive").optional(),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "CRYPTO"]).optional(),
  deliveryDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid delivery date format"
  }).optional(),
  location: z.string().optional(),
  transportMethod: z.enum(["TRUCK", "RAIL", "AIR", "SHIP"]).optional(),
  vehicleNumber: z.string().optional(),
  notes: z.string().optional(),
  conditions: z.string().optional(),
});

export type CreateBatch = z.infer<typeof CreateBatchSchema>;
export type TransferBatch = z.infer<typeof TransferBatchSchema>;

export type BatchResponse = {
  batchId: string;
  blockchainId: string;
  txHash: string;
}

export type TransferResponse = {
  batchId: string;
  blockchainBatchId: number;
  transactionId: string;
  txHash: string;
  from: {
    id: string;
    name: string;
    role: StakeholderRoleType;
  };
  to: {
    id: string;
    name: string;
    role: StakeholderRoleType;
  };
  transferDetails: {
    quantity: number;
    pricePerUnit: number;
    totalPrice: number;
    currency: string;
  };
}

export type ProductBatch = {
  id: string;
  batchId: number;
  blockchainHash: string | null;
  productName: string;
  productType: string;
  variety: string | null;
  quantity: number;
  unit: string;
  harvestDate: Date;
  expiryDate: Date;
  createdAt: Date;
  updatedAt: Date;
  status: "PRODUCED" | "IN_TRANSIT" | "DELIVERED" | "SOLD" | "EXPIRED";
  qualityGrade: "A" | "B" | "C" | "REJECTED";
  basePrice: number;
  currency: string;
  farmerId: string;
  currentOwnerId: string;
  originHash: string | null;
  qualityHash: string | null;
}

export type ProductBatchesResponse = {
  batches: ProductBatch[];
}