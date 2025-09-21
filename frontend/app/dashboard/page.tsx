'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, User, Shield, MapPin, Building } from 'lucide-react';

export default function DashboardPage() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

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

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">Welcome to the Food Chain platform</p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Button className="h-20 text-left justify-start" variant="outline">
              <div>
                <h3 className="font-medium">Manage Products</h3>
                <p className="text-sm text-muted-foreground">Add and track your products</p>
              </div>
            </Button>
            <Button className="h-20 text-left justify-start" variant="outline">
              <div>
                <h3 className="font-medium">View Transactions</h3>
                <p className="text-sm text-muted-foreground">Track blockchain transactions</p>
              </div>
            </Button>
            <Button className="h-20 text-left justify-start" variant="outline">
              <div>
                <h3 className="font-medium">Profile Settings</h3>
                <p className="text-sm text-muted-foreground">Update your information</p>
              </div>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}