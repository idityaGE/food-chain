"use client";

import { TransferBatchForm } from "@/components/forms/batch";
import { useSearchParams } from "next/navigation";

export default function TransferBatchPage() {
  const searchParams = useSearchParams();
  const batchId = searchParams.get("batchId") || "";
  
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <h1 className="text-2xl font-bold mb-6">Transfer Batch</h1>
      <TransferBatchForm batchId={batchId} />
    </div>
  );
}