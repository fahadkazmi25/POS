import type React from "react"
import MainLayout from "@/components/main-layout"
import { ProtectedRoute } from "@/components/protected-route"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return  <ProtectedRoute><MainLayout>{children}</MainLayout></ProtectedRoute>
}
