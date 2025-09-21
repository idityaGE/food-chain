'use client';

import { useAuth } from '@/lib/auth-context';
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
        {/* User Info Card */}
        <div className="bg-card overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <User className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-muted-foreground truncate">
                    Welcome back
                  </dt>
                  <dd className="text-lg font-medium text-foreground">
                    {user.name}
                  </dd>
                </dl>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {/* Email */}
              <div className="bg-muted overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <User className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-muted-foreground truncate">
                          Email
                        </dt>
                        <dd className="text-sm text-foreground">
                          {user.email}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Role */}
              <div className="bg-muted overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Shield className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-muted-foreground truncate">
                          Role
                        </dt>
                        <dd className="text-sm text-foreground">
                          {user.role.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone */}
              {user.phone && (
                <div className="bg-muted overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <User className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-muted-foreground truncate">
                            Phone
                          </dt>
                          <dd className="text-sm text-foreground">
                            {user.phone}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Location */}
              {user.location && (
                <div className="bg-muted overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <MapPin className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-muted-foreground truncate">
                            Location
                          </dt>
                          <dd className="text-sm text-foreground">
                            {user.location}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Business Name */}
              {user.businessName && (
                <div className="bg-muted overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Building className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-muted-foreground truncate">
                            Business Name
                          </dt>
                          <dd className="text-sm text-foreground">
                            {user.businessName}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Public Key */}
              <div className="bg-muted overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Shield className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-muted-foreground truncate">
                          Public Key
                        </dt>
                        <dd className="text-sm text-foreground font-mono break-all">
                          {user.publicKey}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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