"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  ClipboardList,
  CreditCard,
  FileText,
  Home,
  Menu,
  Package,
  ShoppingCart,
  Users,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useSidebar } from "@/components/sidebar-provider"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { isOpen, setIsOpen, isMobile } = useSidebar()

  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Products",
      icon: Package,
      href: "/products",
      active: pathname === "/products",
    },
    {
      label: "Add Product",
      icon: ClipboardList,
      href: "/products/new",
      active: pathname === "/products/new",
    },
    {
      label: "POS",
      icon: ShoppingCart,
      href: "/pos",
      active: pathname === "/pos",
    },
    {
      label: "Invoices",
      icon: FileText,
      href: "/invoices",
      active: pathname === "/invoices",
    },
    {
      label: "Customers",
      icon: Users,
      href: "/customers",
      active: pathname === "/customers",
    },
    {
      label: "Reports",
      icon: BarChart3,
      href: "/reports",
      active: pathname === "/reports",
    },
  ]

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <div className="flex h-16 items-center border-b px-4">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <CreditCard className="h-6 w-6" />
              <span>POS System</span>
            </Link>
            <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <div className="flex flex-col gap-2 p-4">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
                    route.active ? "bg-muted font-medium text-primary" : "text-muted-foreground",
                  )}
                >
                  <route.icon className="h-4 w-4" />
                  {route.label}
                </Link>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div className={cn("flex flex-col", className)}>
      <div
        className={cn(
          "group fixed z-30 flex h-screen flex-col border-r bg-background transition-all duration-300",
          isOpen ? "w-64" : "w-[70px]",
        )}
      >
        <div className="flex h-16 items-center border-b px-4">
         {isOpen && <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <CreditCard className="h-6 w-6" />
             <span>POS System</span>
          </Link>}
          <Button variant="ghost" size="icon" className="ml-auto" onClick={toggleSidebar}>
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-2 p-4">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
                  route.active ? "bg-muted font-medium text-primary" : "text-muted-foreground",
                )}
              >
                <route.icon className="h-4 w-4" />
                {isOpen && route.label}
              </Link>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
