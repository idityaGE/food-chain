"use client";

import { CreateBatchForm } from "@/components/forms/batch";

export default function CreateBatchPage() {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <h1 className="text-2xl font-bold mb-6">Create New Batch</h1>
      <CreateBatchForm />
    </div>
  );
}