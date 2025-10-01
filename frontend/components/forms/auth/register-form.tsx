"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react"
import { toast } from "sonner"

import { type RegisterUser, RegisterUserSchema, type StakeholderRole } from "@/types/user"
import { Api, ApiError } from "@/utils/api"
import { useAuth } from "@/hooks/useAuth"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterUser>({
    resolver: zodResolver(RegisterUserSchema),
  })

  const selectedRole = watch("role")

  const onSubmit = async (data: RegisterUser) => {
    setIsLoading(true)
    try {
      const response = await Api.register(data)

      login(response.user, response.token)

      toast.success("Registration successful!", {
        description: "Welcome to the Food Chain platform.",
      })

      router.push("/dashboard")
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error("Registration failed", {
          description: error.message,
        })
      } else {
        toast.error("Registration failed", {
          description: "An unexpected error occurred. Please try again.",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        
        <div className="border border-amber-500/20 bg-amber-500/5 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-5 h-5 bg-amber-500/20 rounded-full flex items-center justify-center mt-0.5">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1">Prototype Notice</h3>
              <p className="text-xs leading-relaxed">
                Registration of farmers and distributors can only be done by an authorized officer in production.
                However, since this is a prototype, registration is open to everyone for demonstration purposes.
              </p>
            </div>
          </div>
        </div>

        <Card className="shadow-lg border-0 bg-card">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <UserPlus className="w-6 h-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Create account</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Join the Food Chain platform today
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  {...register("name")}
                  className={`transition-colors ${errors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register("email")}
                  className={`transition-colors ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone Number <span className="text-muted-foreground">(Optional)</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  {...register("phone")}
                  className={`transition-colors ${errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    {...register("password")}
                    className={`pr-10 transition-colors ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>

              {/* Role Field */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium">
                  Role
                </Label>
                <Select onValueChange={(value) => setValue("role", value as keyof typeof StakeholderRole)}>
                  <SelectTrigger
                    className={`transition-colors ${errors.role ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  >
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FARMER">🌾 Farmer</SelectItem>
                    <SelectItem value="DISTRIBUTOR">🚚 Distributor</SelectItem>
                    <SelectItem value="RETAILER">🏪 Retailer</SelectItem>
                    <SelectItem value="CONSUMER">👤 Consumer</SelectItem>
                    <SelectItem value="QUALITY_INSPECTOR">🔍 Quality Inspector</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
              </div>

              {/* Business Name Field (Conditional) */}
              {selectedRole && ["FARMER", "DISTRIBUTOR", "RETAILER"].includes(selectedRole) && (
                <div className="space-y-2">
                  <Label htmlFor="businessName" className="text-sm font-medium">
                    Business Name <span className="text-muted-foreground">(Optional)</span>
                  </Label>
                  <Input
                    id="businessName"
                    type="text"
                    placeholder="Enter your business name"
                    {...register("businessName")}
                    className={`transition-colors ${errors.businessName ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                  {errors.businessName && <p className="text-sm text-destructive">{errors.businessName.message}</p>}
                </div>
              )}

              {/* Location Field */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">
                  Location <span className="text-muted-foreground">(Optional)</span>
                </Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="Enter your location"
                  {...register("location")}
                  className={`transition-colors ${errors.location ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
              </div>

              <Button type="submit" disabled={isLoading} className="w-full h-11 font-medium">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Already have an account?</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                <Link href="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
                  Sign in instead
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
