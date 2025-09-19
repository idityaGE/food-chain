import { Prisma } from '@generated/prisma';
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

export type User = {
  name: string;
  email: string;
  phone: string | null;
  location: string | null;
  profileImage: string | null;
  businessName: string | null;
  role: $Enums.StakeholderRole;
  id: string;
  isVerified: boolean;
  registrationDate: Date;
  description: string | null;
  gpsCoordinates: Prisma.JsonValue | null;
  businessLicense: string | null;
  taxId: string | null;
  dataHash: string | null;
}