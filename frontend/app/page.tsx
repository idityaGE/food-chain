'use client'

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { Shield, Users, Truck, CheckCircle, ArrowRight, LogOut } from "lucide-react"

export default function Home() {
  const { isAuthenticated, logout } = useAuth()

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

      <header className="relative z-10 border-b border-border/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
                <Shield className="h-4 w-4 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">Food Chain</h1>
            </div>
            <div className="flex items-center space-x-4">
              {!isAuthenticated ? (
                <>
                  <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Sign in
                  </Link>
                  <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link href="/register">Get Started</Link>
                  </Button>
                </>
              ) : (
                <div>
                  <Button asChild size="sm">
                    <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
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
          <div className="pt-20 pb-16 lg:pt-32 lg:pb-24">
            <div className="max-w-4xl">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
                The complete platform to track your <span className="text-muted-foreground">food supply chain.</span>
              </h1>
              <p className="mt-8 text-lg lg:text-xl text-muted-foreground max-w-2xl text-pretty">
                Your team's toolkit to stop guessing and start tracking. Securely monitor, verify, and scale transparent
                food experiences with blockchain technology.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                {!isAuthenticated ? (
                  <>
                    <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <Link href="/register" className="flex items-center gap-2">
                        Get Started
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="border-border text-foreground hover:bg-accent bg-transparent"
                    >
                      <Link href="/login">Sign In</Link>
                    </Button>
                  </>
                ) : (
                  <div>
                    <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
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

        <div className="border-t border-border/20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="border border-border/20 rounded-lg p-6 bg-card/50">
                <div className="text-2xl font-bold text-foreground">99.9%</div>
                <div className="text-sm text-muted-foreground mt-1">uptime guaranteed</div>
                <div className="text-xs text-muted-foreground/60 mt-2">for supply chain tracking.</div>
                <div className="mt-4 flex items-center justify-center h-8">
                  <Shield className="h-6 w-6 text-muted-foreground/40" />
                </div>
              </div>

              <div className="border border-border/20 rounded-lg p-6 bg-card/50">
                <div className="text-2xl font-bold text-foreground">50%</div>
                <div className="text-sm text-muted-foreground mt-1">faster verification</div>
                <div className="text-xs text-muted-foreground/60 mt-2">time to market.</div>
                <div className="mt-4 flex items-center justify-center h-8">
                  <CheckCircle className="h-6 w-6 text-muted-foreground/40" />
                </div>
              </div>

              <div className="border border-border/20 rounded-lg p-6 bg-card/50">
                <div className="text-2xl font-bold text-foreground">200%</div>
                <div className="text-sm text-muted-foreground mt-1">increase in transparency</div>
                <div className="text-xs text-muted-foreground/60 mt-2">across the supply chain.</div>
                <div className="mt-4 flex items-center justify-center h-8">
                  <Users className="h-6 w-6 text-muted-foreground/40" />
                </div>
              </div>

              <div className="border border-border/20 rounded-lg p-6 bg-card/50">
                <div className="text-2xl font-bold text-foreground">3x</div>
                <div className="text-sm text-muted-foreground mt-1">faster to deploy</div>
                <div className="text-xs text-muted-foreground/60 mt-2">blockchain tracking.</div>
                <div className="mt-4 flex items-center justify-center h-8">
                  <Truck className="h-6 w-6 text-muted-foreground/40" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground text-balance">
                  Faster tracking. More transparency.
                </h2>
                <p className="mt-6 text-lg text-muted-foreground text-pretty">
                  The platform for seamless progress. Let your team focus on delivering quality food instead of managing
                  complex supply chains with automated tracking, built-in verification, and integrated collaboration.
                </p>
              </div>

              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Make teamwork seamless.</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Tools for your team and stakeholders to share feedback and iterate faster.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Automated verification.</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Streamline food safety with automated verification and blockchain security.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">End-to-end tracking.</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Monitor your products from farm to table with complete transparency.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
