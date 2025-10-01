'use client'

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { Shield, Users, Truck, CheckCircle, ArrowRight, LogOut, Leaf, QrCode, Eye, TrendingUp, Award, Zap } from "lucide-react"

export default function Home() {
  const { isAuthenticated, logout } = useAuth()

  return (
    <div className="min-h-screen bg-white text-gray-900 force-light-mode">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

      <header className="relative z-10 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-sm flex items-center justify-center">
                <Leaf className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">AgriChain</h1>
            </div>
            <div className="flex items-center space-x-4">
              {!isAuthenticated ? (
                <>
                  <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Sign in
                  </Link>
                  <Button asChild size="sm" className="bg-green-600 text-white hover:bg-green-700">
                    <Link href="/register">Get Started</Link>
                  </Button>
                </>
              ) : (
                <div>
                  <Button asChild size="sm">
                    <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Dashboard</Link>
                  </Button>
                  <Button variant="outline" size="sm" className="ml-2" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="pt-16 pb-16 lg:pt-24 lg:pb-20">
            <div className="max-w-4xl">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight text-balance">
                Blockchain-powered <span className="text-green-600">agricultural transparency</span> from farm to table.
              </h1>
              <p className="mt-8 text-lg lg:text-xl text-gray-600 max-w-3xl text-pretty">
                Track agricultural produce with complete transparency in pricing, quality, and origin. Our blockchain-based 
                platform ensures fair pricing for farmers, authentic products for consumers, and verifiable transactions 
                for all stakeholders in the supply chain.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                {!isAuthenticated ? (
                  <>
                    <Button asChild size="lg" className="bg-green-600 text-white hover:bg-green-700">
                      <Link href="/register" className="flex items-center gap-2">
                        Get Started
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white"
                    >
                      <Link href="/login">Sign In</Link>
                    </Button>
                  </>
                ) : (
                  <div>
                    <Button asChild size="lg" className="bg-green-600 text-white hover:bg-green-700">
                      <Link href="/dashboard" className="flex items-center gap-2">
                        Go to Dashboard
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Why Choose AgriChain?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our platform delivers measurable results for transparency and efficiency
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600 mb-1">100%</div>
                <div className="text-sm font-medium text-gray-900 mb-1">Transparent Tracking</div>
                <div className="text-xs text-gray-500">from farm to consumer</div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QrCode className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-1">QR</div>
                <div className="text-sm font-medium text-gray-900 mb-1">Code Verification</div>
                <div className="text-xs text-gray-500">instant product history</div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-600 mb-1">AI</div>
                <div className="text-sm font-medium text-gray-900 mb-1">Powered Validation</div>
                <div className="text-xs text-gray-500">harvest & invoice verification</div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-orange-600 mb-1">Low</div>
                <div className="text-sm font-medium text-gray-900 mb-1">Cost Deployment</div>
                <div className="text-xs text-gray-500">Polygon blockchain network</div>
              </div>
            </div>
          </div>
        </div>

        <div className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 text-balance">
                  Solving Agricultural Supply Chain Challenges
                </h2>
                <p className="mt-6 text-lg text-gray-600 text-pretty">
                  Eliminate fraud, ensure fair pricing, and create complete transparency from farm to consumer. 
                  Our blockchain-based platform reduces exploitation, builds trust, and empowers every stakeholder 
                  in the agricultural supply chain.
                </p>
                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-600">Immutable transaction records</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-600">Smart contract automation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-600">Real-time quality tracking</span>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Leaf className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Fair Pricing for Farmers</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Eliminate middleman exploitation with transparent pricing and direct market access.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <QrCode className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Consumer Verification</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      QR code scanning reveals complete product history, quality reports, and origin details.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Blockchain Security</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Tamper-proof records on Polygon network ensure data integrity and reduce fraud.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Award className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">AI-Powered Validation</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Automated verification of harvest images and invoices using advanced AI technology.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 text-balance">
                Benefits for Every Stakeholder
              </h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Our platform creates value across the entire agricultural supply chain ecosystem.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Farmers</h3>
                <p className="text-sm text-gray-600">
                  Fair pricing, reduced exploitation, direct market access, and transparent transaction records.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Distributors</h3>
                <p className="text-sm text-gray-600">
                  Product authenticity proof, streamlined logistics, and enhanced customer trust.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Consumers</h3>
                <p className="text-sm text-gray-600">
                  Complete product transparency, quality verification, and origin traceability through QR codes.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Government</h3>
                <p className="text-sm text-gray-600">
                  Real-time market data, fraud detection, policy insights, and regulatory compliance monitoring.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="border-t border-border/20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
            <div className="text-center">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground text-balance mb-4">
                Ready to Transform Your Supply Chain?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Join thousands of stakeholders building a transparent, fair, and sustainable agricultural ecosystem.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {!isAuthenticated ? (
                  <>
                    <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white">
                      <Link href="/register" className="flex items-center gap-2">
                        Start Tracking Today
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="border-border text-foreground hover:bg-accent bg-transparent"
                    >
                      <Link href="/login">Stakeholder Login</Link>
                    </Button>
                  </>
                ) : (
                  <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white">
                    <Link href="/dashboard" className="flex items-center gap-2">
                      Access Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
              
              <div className="mt-12 text-center">
                <p className="text-sm text-muted-foreground mb-4">Supported by</p>
                <div className="flex items-center justify-center gap-8 opacity-60">
                  <div className="text-xs text-muted-foreground">Government of Odisha</div>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                  <div className="text-xs text-muted-foreground">Electronics & IT Department</div>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                  <div className="text-xs text-muted-foreground">SIH 2024</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
