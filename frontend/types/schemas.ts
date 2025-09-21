import { z } from 'zod';

export const StakeholderRole = {
  FARMER: 'FARMER',
  DISTRIBUTOR: 'DISTRIBUTOR',
  RETAILER: 'RETAILER',
  CONSUMER: 'CONSUMER',
  QUALITY_INSPECTOR: 'QUALITY_INSPECTOR'
} as const;

export type StakeholderRoleType = keyof typeof StakeholderRole;

export const roleMapping = {
  'FARMER': 0,
  'DISTRIBUTOR': 1,
  'RETAILER': 2,
  'CONSUMER': 3,
  'QUALITY_INSPECTOR': 4
};

export const RegisterUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  location: z.string().optional(),
  profileImage: z.string().optional(),
  businessName: z.string().optional(),
  role: z.enum(['FARMER', 'DISTRIBUTOR', 'RETAILER', 'CONSUMER', 'QUALITY_INSPECTOR'])
});

export const LoginUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
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
  role: StakeholderRoleType;
  id: string;
  publicKey: string;
  isVerified: boolean;
  registrationDate: Date;
  description: string | null;
  gpsCoordinates: any | null;
  businessLicense: string | null;
  taxId: string | null;
  dataHash: string | null;
};

// API Response types
export type ApiSuccessResponse<T> = {
  statusCode: 200;
  data: T;
  message: string;
  success: true;
};

export type ApiErrorResponse = {
  error: true;
  statusCode: number;
  success: false;
  message: string;
};

export type AuthResponse = {
  user: User;
  token: string;
  txHash?: string;
};