import { z } from 'zod';

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

export type CreateBatch = z.infer<typeof CreateBatchSchema>;