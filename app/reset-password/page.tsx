"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth"
import { auth } from "@/firebase/config"
import { CreditCard, Eye, EyeOff, ArrowLeft, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import toast from "react-hot-toast"
// import { useToast } from "@/components/ui/use-toast"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // const { toast } = useToast()

  const [oobCode, setOobCode] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(true)
  const [isLinkExpired, setIsLinkExpired] = useState(false)

  useEffect(() => {
    const code = searchParams.get("oobCode")
    if (!code) {
      setIsLinkExpired(true)
      setIsVerifying(false)
      return
    }

    setOobCode(code)

    // Verify the password reset code
    const verifyCode = async () => {
      try {
        const email = await verifyPasswordResetCode(auth, code)
        setEmail(email)
        setIsVerifying(false)
      } catch (error) {
        console.error("Invalid or expired reset link:", error)
        setIsLinkExpired(true)
        setIsVerifying(false)
      }
    }

    verifyCode()
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate passwords
    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!oobCode) {
      setError("Invalid reset link")
      return
    }

    setIsLoading(true)

    try {
      // Confirm password reset
      await confirmPasswordReset(auth, oobCode, password)

      toast.success("Password reset successfully. You can now log in with your new password.")

      // Redirect to login page
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (error: any) {
      console.error("Error resetting password:", error)

      switch (error.code) {
        case "auth/expired-action-code":
          setError("This reset link has expired. Please request a new one.")
          break
        case "auth/invalid-action-code":
          setError("Invalid reset link. Please request a new one.")
          break
        case "auth/weak-password":
          setError("Password is too weak. Please choose a stronger password.")
          break
        default:
          setError("Failed to reset password. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <CreditCard className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl text-center">Verifying Reset Link</CardTitle>
            <CardDescription className="text-center">Please wait while we verify your reset link...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLinkExpired) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <CreditCard className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl text-center">Invalid Reset Link</CardTitle>
            <CardDescription className="text-center">
              The password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Please request a new password reset link.</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <CreditCard className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">Create a new password for {email}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Password must be at least 8 characters long.</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Resetting Password..." : "Reset Password"}
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
