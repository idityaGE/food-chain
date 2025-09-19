import { $Enums } from '@generated/prisma';
import { z } from 'zod'

export const RegisterUserSchema = z.object({
  name: z.string(),
  email: z.email(),
  phone: z.string().optional(),
  password: z.string(),
  location: z.string().optional(),
  profileImage: z.string().optional(),
  businessName: z.string().optional(),
  role: z.enum($Enums.StakeholderRole)
});

export const LoginUserSchema = z.object({
  email: z.email(),
  password: z.string()
});

export type RegisterUser = z.infer<typeof RegisterUserSchema>;
export type LoginUser = z.infer<typeof LoginUserSchema>;