"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { useSidebar } from "@/components/sidebar-provider"
import { UserNav } from "@/components/user-nav"
import { cn } from "@/lib/utils"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isOpen } = useSidebar()
  const pathname = usePathname()

  // Don't render the layout on the login page
  if (pathname === "/login") {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className={cn("flex-1 transition-all duration-300", isOpen ? "md:ml-64" : "md:ml-[70px]")}>
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <div className="flex-1" />
          <UserNav />
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
