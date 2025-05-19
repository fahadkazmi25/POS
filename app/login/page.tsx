"use client"

import type React from "react"
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth"
import { auth } from "@/firebase/config"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CreditCard, Eye, EyeOff, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import toast from "react-hot-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
// import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const router = useRouter()
  // const { toast } = useToast()
  const { user } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetEmail, setResetEmail] = useState("")
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // Basic validation
    if (!email || !password) {
      setError("Please enter both email and password")
      setIsLoading(false)
      return
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      setIsLoading(false)
      return
    }

    try {
      // Attempt to sign in with Firebase
      await signInWithEmailAndPassword(auth, email, password)

      // Set auth token cookie
      document.cookie = `authToken=${auth.currentUser?.uid}; path=/; max-age=${60 * 60 * 24 }; SameSite=Strict; Secure`

      // Success toast notification
      toast.success("Login successful", {
        duration: 3000,
      })
      

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error: any) {
      // Handle specific Firebase auth errors
      switch (error.code) {
        case "auth/user-not-found":
          setError("No account found with this email address")
          break
        case "auth/wrong-password":
          setError("Incorrect password")
          break
        case "auth/invalid-email":
          setError("Invalid email format")
          break
        case "auth/user-disabled":
          setError("This account has been disabled")
          break
        case "auth/too-many-requests":
          setError("Too many failed login attempts. Please try again later")
          break
        default:
          setError("Failed to login. Please try again")
          console.error("Login error:", error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    // Basic validation
    if (!resetEmail) {
      toast.error("Please enter your email address", {
        duration: 3000,
      })
      return
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(resetEmail)) {
      toast.error("Please enter a valid email address", {
        duration: 3000,
      })
      return
    }

    setIsResettingPassword(true)

    try {
      await sendPasswordResetEmail(auth, resetEmail)
      toast.success("Password reset email sent. Please check your inbox", {
        duration: 3000,
      })

      setIsResetDialogOpen(false)
    } catch (error: any) {
      // Handle specific Firebase auth errors for password reset
      let errorMessage = "Failed to send reset email. Please try again"

      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email address"
      }

      toast.error(errorMessage, {
        duration: 3000,
      })

    } finally {
      setIsResettingPassword(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <CreditCard className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">POS System</CardTitle>
          <CardDescription className="text-center">Enter your credentials to access the dashboard</CardDescription>
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button
                  variant="link"
                  className="p-0 h-auto text-xs"
                  type="button"
                  onClick={() => {
                    setResetEmail(email)
                    setIsResetDialogOpen(true)
                  }}
                >
                  Forgot password?
                </Button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
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
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Password Reset Dialog */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetDialogOpen(false)} disabled={isResettingPassword}>
              Cancel
            </Button>
            <Button onClick={handlePasswordReset} disabled={isResettingPassword}>
              {isResettingPassword ? "Sending..." : "Send Reset Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
