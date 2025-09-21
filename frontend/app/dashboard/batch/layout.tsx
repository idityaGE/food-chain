"use client"

import React from "react";
import { Header } from "@/components/ui/header";
import { useAuth } from "@/hooks/useAuth";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    redirect("/auth/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background antialiased">
      <Header />
      <main className="flex-1">
        <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}