import { ProductBatch } from './batch';
import { User } from './user';

export interface Stakeholder {
  id: string;
  name: string;
  email?: string;
  role: string;
  location: string | null;
  businessName: string;
  profileImage?: string;
  isVerified?: boolean;
  registrationDate?: string;
}

export interface TransactionDetail {
  quantity: string;
  pricePerUnit: string;
  totalPrice: string;
  paymentMethod: string;
  transportMethod: string;
  vehicleNumber: string;
}

export interface SupplyChainStage {
  stage: string;
  stakeholder: {
    id: string;
    name: string;
    role: string;
    businessName: string;
    location: string | null;
  };
  timestamp: string;
  status: string;
  isOrigin?: boolean;
  transactionDetails?: TransactionDetail;
}

export interface Transaction {
  id: string;
  transactionType: string;
  quantity: string;
  pricePerUnit: string;
  totalPrice: string;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionDate: string;
  deliveryDate: string;
  location: string;
  transportMethod: string;
  vehicleNumber: string;
  notes: string;
  conditions: string;
  blockchainTxHash: string;
  from: {
    id: string;
    name: string;
    role: string;
    businessName: string;
    location: string | null;
  };
  to: {
    id: string;
    name: string;
    role: string;
    businessName: string;
    location: string | null;
  };
}

export interface BatchAnalytics {
  totalTransfers: number;
  totalDistance: number;
  averagePrice: number;
  qualityReportsCount: number;
  certificationsCount: number;
  storageLocationsCount: number;
  daysInSupplyChain: number;
  estimatedShelfLife: number;
}

export interface BatchDetailResponse {
  batch: ProductBatch;
  stakeholders: {
    farmer: Stakeholder;
    currentOwner: Stakeholder;
  };
  supplyChainJourney: SupplyChainStage[];
  transactions: Transaction[];
  qualityReports: any[];
  originData: any;
  certifications: any[];
  storageInfo: any[];
  analytics: BatchAnalytics;
}