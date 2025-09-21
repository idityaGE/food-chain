"use client"

import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Shield,
  Calendar,
  FileText,
  LogOut,
  Edit,
  CheckCircle,
  XCircle,
} from "lucide-react"

const Profile = () => {
  const { user, logout, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "FARMER":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      case "DISTRIBUTOR":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "RETAILER":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20"
      case "QUALITY_INSPECTOR":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20"
      case "CONSUMER":
        return "bg-gray-500/10 text-gray-400 border-gray-500/20"
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20"
    }
  }

  const formatRole = (role: string) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/")}
                className="text-muted-foreground hover:text-foreground"
              >
                ← Back to Home
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Profile Overview */}
          <div className="lg:col-span-1">
            <Card className="bg-card/50 border-border/40">
              <CardHeader className="text-center pb-4">
                <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">{user.name}</CardTitle>
                <div className="flex items-center justify-center mt-2">
                  <Badge className={`${getRoleColor(user.role)} border`}>{formatRole(user.role)}</Badge>
                </div>
                <div className="flex items-center justify-center mt-2">
                  {user.isVerified ? (
                    <div className="flex items-center text-green-400 text-sm">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Verified Account
                    </div>
                  ) : (
                    <div className="flex items-center text-yellow-400 text-sm">
                      <XCircle className="h-4 w-4 mr-1" />
                      Pending Verification
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground mr-3" />
                    <span className="text-foreground">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground mr-3" />
                      <span className="text-foreground">{user.phone}</span>
                    </div>
                  )}
                  {user.location && (
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mr-3" />
                      <span className="text-foreground">{user.location}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground mr-3" />
                    <span className="text-foreground">
                      Joined {new Date(user.registrationDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <Card className="bg-card/50 border-border/40 mt-6">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start text-primary">
                    Profile Overview
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
                    Transaction History
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
                    Supply Chain Activity
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
                    Settings
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Right Content - Detailed Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Business Information */}
            {user.businessName && (
              <Card className="bg-card/50 border-border/40">
                <CardHeader>
                  <CardTitle className="flex items-center text-foreground">
                    <Building className="h-5 w-5 mr-2" />
                    Business Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Business Name</label>
                      <p className="text-foreground mt-1">{user.businessName}</p>
                    </div>
                    {user.businessLicense && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">License Number</label>
                        <p className="text-foreground mt-1">{user.businessLicense}</p>
                      </div>
                    )}
                    {user.taxId && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Tax ID</label>
                        <p className="text-foreground mt-1">{user.taxId}</p>
                      </div>
                    )}
                  </div>
                  {user.description && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Description</label>
                      <p className="text-foreground mt-1 leading-relaxed">{user.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Blockchain Information */}
            <Card className="bg-card/50 border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <Shield className="h-5 w-5 mr-2" />
                  Blockchain Identity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Public Key</label>
                    <div className="mt-1 p-3 bg-muted/20 rounded-lg border border-border/40">
                      <code className="text-sm text-foreground font-mono break-all">{user.publicKey}</code>
                    </div>
                  </div>
                  {user.dataHash && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Data Hash</label>
                      <div className="mt-1 p-3 bg-muted/20 rounded-lg border border-border/40">
                        <code className="text-sm text-foreground font-mono break-all">{user.dataHash}</code>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Activity Summary */}
            <Card className="bg-card/50 border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <FileText className="h-5 w-5 mr-2" />
                  Activity Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/10 rounded-lg border border-border/20">
                    <div className="text-2xl font-bold text-primary">0</div>
                    <div className="text-sm text-muted-foreground">Transactions</div>
                  </div>
                  <div className="text-center p-4 bg-muted/10 rounded-lg border border-border/20">
                    <div className="text-2xl font-bold text-primary">0</div>
                    <div className="text-sm text-muted-foreground">Products Tracked</div>
                  </div>
                  <div className="text-center p-4 bg-muted/10 rounded-lg border border-border/20">
                    <div className="text-2xl font-bold text-primary">{user.isVerified ? "100%" : "0%"}</div>
                    <div className="text-sm text-muted-foreground">Verification Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
