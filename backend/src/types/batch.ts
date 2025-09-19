import { z } from 'zod';

export const CreateBatchSchema = z.object({
  productName: z.string().max(100),
  productType: z.string().max(100),
  variety: z.string().max(100).optional(),
  quantity: z.number().positive(),
  unit: z.string().optional(),
  harvestDate: z.date(),
  expiryDate: z.date(),
  basePrice: z.number(), // INR
})

export type CreateBatch = z.infer<typeof CreateBatchSchema>