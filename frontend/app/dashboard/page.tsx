'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Api, ApiError } from '@/utils/api';
import { ProductBatch } from '@/types/batch';
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Header } from '@/components/ui/header';

export default function DashboardPage() {
  const { user, token, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }

    async function fetchBatches() {
      if (token) {
        try {
          setLoadingBatches(true);
          const data = await Api.getBatches(token);
          setBatches(data.batches);
          setError(null);
        } catch (err) {
          console.error('Error fetching batches:', err);
          if (err instanceof ApiError) {
            setError(err.message);
          } else {
            setError('Failed to load batches. Please try again.');
          }
        } finally {
          setLoadingBatches(false);
        }
      }
    }

    if (isAuthenticated && token) {
      fetchBatches();
    }
  }, [isAuthenticated, isLoading, router, token]);

  function handleBatchClick(batchId: string) {
    router.push(`/dashboard/batch/${batchId}`);
  }

  function handleTransferClick(e: React.MouseEvent, batchId: string) {
    e.stopPropagation();
    router.push(`/dashboard/batch/transfer?batchId=${batchId}`);
  }

  function getBadgeColor(status: string) {
    switch (status) {
      case 'PRODUCED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_TRANSIT':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'SOLD':
        return 'bg-purple-100 text-purple-800';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <Header />
      <header className="bg-card shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">Welcome to the Food Chain platform</p>
            </div>
            {user.role === "FARMER" && (
              <Button asChild>
                <Link href='/dashboard/batch/create'>Register New Batch</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Your Batches</h2>

          {error && (
            <div className="bg-destructive/15 text-destructive p-4 rounded-md mb-4">
              {error}
            </div>
          )}

          {loadingBatches ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2">Loading batches...</span>
            </div>
          ) : batches.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No batches found.</p>
              {user.role === "FARMER" && (
                <Button asChild className="mt-4">
                  <Link href='/dashboard/batch/create'>Create your first batch</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableCaption>List of your product batches</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch ID</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Harvest Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((batch) => (
                    <TableRow
                      key={batch.id}
                      onClick={() => handleBatchClick(batch.id)}
                      className="cursor-pointer hover:bg-muted"
                    >
                      <TableCell className="font-medium">{batch.batchId}</TableCell>
                      <TableCell>{batch.productName}</TableCell>
                      <TableCell>{batch.productType}</TableCell>
                      <TableCell>
                        {batch.quantity} {batch.unit}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getBadgeColor(batch.status)}>
                          {batch.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(batch.harvestDate), "MMM d, yyyy")}</TableCell>
                      <TableCell>{format(new Date(batch.expiryDate), "MMM d, yyyy")}</TableCell>
                      {user.id === batch.currentOwnerId && (<TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleTransferClick(e, batch.id)}
                        >
                          Transfer
                          <ArrowUpRight className="ml-1 h-4 w-4" />
                        </Button>
                      </TableCell>)}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}