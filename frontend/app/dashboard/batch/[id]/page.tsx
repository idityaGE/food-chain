'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Api, ApiError } from '@/utils/api';
import { ProductBatch } from '@/types/batch';
import { BatchDetailResponse } from '@/types/batchDetail';
import { format } from 'date-fns';
import { ArrowLeft, CalendarIcon, PackageIcon, Loader2, ArrowUpRight, TruckIcon, Wallet, Users, Activity, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function BatchDetailPage() {
  const { id } = useParams();
  const { token, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [batchDetails, setBatchDetails] = useState<BatchDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    async function fetchBatchDetails() {
      if (!token || !id) return;

      try {
        setLoading(true);
        try {
          const batchData = await Api.getBatchById(id as string);
          setBatchDetails(batchData);
          setError(null);
        } catch (fetchError) {
          console.error("Error fetching batch details:", fetchError);
          setError('Batch not found or you do not have permission to access it.');
        }
      } catch (err) {
        console.error('Error fetching batch details:', err);
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('Failed to load batch details. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated && token && id) {
      fetchBatchDetails();
    }
  }, [id, isAuthenticated, isLoading, router, token]);

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

  function getQualityColor(grade: string) {
    switch (grade) {
      case 'A':
        return 'bg-green-100 text-green-800';
      case 'B':
        return 'bg-blue-100 text-blue-800';
      case 'C':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading batch details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push('/dashboard')}>
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!batchDetails || !batchDetails.batch) {
    return null;
  }

  const { batch, stakeholders, supplyChainJourney, transactions, analytics } = batchDetails;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        <Button onClick={() => router.push(`/dashboard/batch/transfer?batchId=${batch.id}`)}>
          Transfer Batch
          <ArrowUpRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Batch Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{batch.productName}</CardTitle>
                  <CardDescription>Batch #{batch.batchId}</CardDescription>
                </div>
                <Badge variant="outline" className={getBadgeColor(batch.status)}>
                  {batch.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Product Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b pb-2">
                      <span>Product Type</span>
                      <span className="font-medium">{batch.productType}</span>
                    </div>
                    {batch.variety && (
                      <div className="flex justify-between border-b pb-2">
                        <span>Variety</span>
                        <span className="font-medium">{batch.variety}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-b pb-2">
                      <span>Quantity</span>
                      <span className="font-medium">{batch.quantity} {batch.unit}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span>Base Price</span>
                      <span className="font-medium">{batch.basePrice} {batch.currency}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span>Quality Grade</span>
                      <Badge variant="outline" className={getQualityColor(batch.qualityGrade)}>
                        {batch.qualityGrade}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Dates</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b pb-2">
                      <span>Harvest Date</span>
                      <span className="font-medium">{format(new Date(batch.harvestDate), "PPP")}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span>Expiry Date</span>
                      <span className="font-medium">{format(new Date(batch.expiryDate), "PPP")}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span>Created</span>
                      <span className="font-medium">{format(new Date(batch.createdAt), "PPP")}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span>Last Updated</span>
                      <span className="font-medium">{format(new Date(batch.updatedAt), "PPP")}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Blockchain Details</h3>
                <div className="space-y-3">
                  {batch.blockchainHash && (
                    <div className="flex justify-between border-b pb-2">
                      <span>Blockchain Hash</span>
                      <span className="font-mono text-xs bg-muted p-1 rounded break-all">{batch.blockchainHash}</span>
                    </div>
                  )}
                  {batch.originHash && (
                    <div className="flex justify-between border-b pb-2">
                      <span>Origin Hash</span>
                      <span className="font-mono text-xs bg-muted p-1 rounded break-all">{batch.originHash}</span>
                    </div>
                  )}
                  {batch.qualityHash && (
                    <div className="flex justify-between border-b pb-2">
                      <span>Quality Hash</span>
                      <span className="font-mono text-xs bg-muted p-1 rounded break-all">{batch.qualityHash}</span>
                    </div>
                  )}
                  {!batch.blockchainHash && !batch.originHash && !batch.qualityHash && (
                    <p className="text-muted-foreground italic">No blockchain data available</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supply Chain Journey */}
          <Card>
            <CardHeader>
              <CardTitle>Supply Chain Journey</CardTitle>
              <CardDescription>Track the history of this batch</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {supplyChainJourney.map((stage, index) => (
                  <div key={index} className="relative pl-8 pb-8 border-l border-muted last:border-0">
                    <div className="absolute left-0 top-0 bg-background w-6 h-6 rounded-full border border-muted flex items-center justify-center -translate-x-1/2">
                      {stage.status === "PRODUCED" ? (
                        <PackageIcon className="h-3 w-3" />
                      ) : (
                        <TruckIcon className="h-3 w-3" />
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{stage.stage}</h4>
                        <Badge variant="outline" className={getBadgeColor(stage.status)}>
                          {stage.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {format(new Date(stage.timestamp), "PPP 'at' p")}
                      </p>

                      <div className="bg-muted/50 p-3 rounded-md">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span className="font-medium">{stage.stakeholder.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {stage.stakeholder.role}
                          </Badge>
                        </div>
                        {stage.stakeholder.businessName && (
                          <p className="text-sm mt-1">{stage.stakeholder.businessName}</p>
                        )}
                      </div>

                      {stage.transactionDetails && (
                        <div className="bg-muted/30 p-3 rounded-md mt-2">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-1">
                              <Wallet className="h-3.5 w-3.5" />
                              <span>{stage.transactionDetails.quantity} {batch.unit}</span>
                            </div>
                            <div>
                              <span>@ {stage.transactionDetails.pricePerUnit} {batch.currency}</span>
                            </div>
                            <div className="col-span-2 pt-1 border-t">
                              <span className="font-medium">Total: {stage.transactionDetails.totalPrice} {batch.currency}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Transactions */}
          {transactions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Transactions</CardTitle>
                <CardDescription>
                  Payment and transfer records for this batch
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="mb-4 p-4 border rounded-md">
                    <div className="flex flex-wrap justify-between mb-2">
                      <Badge variant="outline" className="mb-2">
                        {transaction.transactionType}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(transaction.transactionDate), "PPP")}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Transaction Details</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Quantity:</span>
                            <span>{transaction.quantity} {batch.unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Price Per Unit:</span>
                            <span>{transaction.pricePerUnit} {transaction.currency}</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span>Total Price:</span>
                            <span>{transaction.totalPrice} {transaction.currency}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Payment Method:</span>
                            <span>{transaction.paymentMethod.replace('_', ' ')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Payment Status:</span>
                            <Badge variant={transaction.paymentStatus === "COMPLETED" ? "default" : "outline"}>
                              {transaction.paymentStatus}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Delivery Information</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Delivery Date:</span>
                            <span>{format(new Date(transaction.deliveryDate), "PP")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Location:</span>
                            <span>{transaction.location}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Transport:</span>
                            <span>{transaction.transportMethod}</span>
                          </div>
                          {transaction.vehicleNumber && (
                            <div className="flex justify-between">
                              <span>Vehicle Number:</span>
                              <span>{transaction.vehicleNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {(transaction.notes || transaction.conditions) && (
                      <div className="mt-2 pt-2 border-t">
                        {transaction.notes && (
                          <div className="text-sm mb-1">
                            <span className="font-medium">Notes:</span> {transaction.notes}
                          </div>
                        )}
                        {transaction.conditions && (
                          <div className="text-sm">
                            <span className="font-medium">Conditions:</span> {transaction.conditions}
                          </div>
                        )}
                      </div>
                    )}

                    {transaction.blockchainTxHash && (
                      <div className="mt-2 pt-2 border-t">
                        <div className="text-sm">
                          <span className="font-medium">Transaction Hash:</span>
                          <span className="font-mono text-xs block mt-1 bg-muted p-1 rounded break-all">
                            {transaction.blockchainTxHash}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar with stakeholders and analytics */}
        <div className="space-y-6">
          {/* Stakeholders */}
          <Card>
            <CardHeader>
              <CardTitle>Stakeholders</CardTitle>
              <CardDescription>Parties involved in this batch</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge>Farmer</Badge>
                  {stakeholders.farmer.isVerified && (
                    <Badge variant="outline" className="bg-green-50 text-green-700">Verified</Badge>
                  )}
                </div>
                <h4 className="font-medium">{stakeholders.farmer.name}</h4>
                <p className="text-sm text-muted-foreground">{stakeholders.farmer.email}</p>
                {stakeholders.farmer.businessName && (
                  <p className="text-sm mt-1">{stakeholders.farmer.businessName}</p>
                )}
              </div>

              <div className="border rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge>Current Owner</Badge>
                  {stakeholders.currentOwner.isVerified && (
                    <Badge variant="outline" className="bg-green-50 text-green-700">Verified</Badge>
                  )}
                </div>
                <h4 className="font-medium">{stakeholders.currentOwner.name}</h4>
                <p className="text-sm text-muted-foreground">{stakeholders.currentOwner.email}</p>
                {stakeholders.currentOwner.businessName && (
                  <p className="text-sm mt-1">{stakeholders.currentOwner.businessName}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Supply chain metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-md p-3 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{analytics.totalTransfers}</span>
                  <span className="text-sm text-muted-foreground">Transfers</span>
                </div>
                <div className="border rounded-md p-3 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{analytics.daysInSupplyChain}</span>
                  <span className="text-sm text-muted-foreground">Days</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Avg. Price</span>
                  <span className="font-medium">{analytics.averagePrice} {batch.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Distance</span>
                  <span className="font-medium">{analytics.totalDistance} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Shelf Life</span>
                  <span className="font-medium">{analytics.estimatedShelfLife} days</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <CardFooter className="flex justify-end px-0">
            <Button onClick={() => router.push(`/dashboard/batch/transfer?batchId=${batch.id}`)}>
              Transfer Batch
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </div>
      </div>
    </div>
  );
}