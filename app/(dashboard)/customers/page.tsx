"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Filter, Plus, Search, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCustomers } from "@/hooks/use-customers"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function CustomersPage() {
  const { customers, loading, error, deleteCustomer } = useCustomers()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [balanceFilter, setBalanceFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  const itemsPerPage = 10

  // Filter customers based on search term, status, and balance
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.phone && customer.phone.includes(searchTerm))

    const matchesStatus = statusFilter === "all" || customer.status === statusFilter

    const matchesBalance =
      balanceFilter === "all" ||
      (balanceFilter === "with-balance" && customer.outstandingBalance > 0) ||
      (balanceFilter === "no-balance" && customer.outstandingBalance === 0)

    return matchesSearch && matchesStatus && matchesBalance
  })

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, balanceFilter])

  // Handle customer deletion
  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return

    try {
      await deleteCustomer(customerToDelete)
      setCustomerToDelete(null)
    } catch (error) {
      console.error("Error deleting customer:", error)
    }
  }

  // Format date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A"

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center text-center">
              <h3 className="text-lg font-semibold text-destructive">Error loading customers</h3>
              <p className="mt-2 text-muted-foreground">{error}</p>
              <Button className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
        <Button asChild>
          <Link href="/customers/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New Customer
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Management</CardTitle>
          <CardDescription>
            Manage your customers, view purchase history, and track outstanding balances.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <div className="w-[180px]">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-[180px]">
                  <Select value={balanceFilter} onValueChange={setBalanceFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Balance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Balances</SelectItem>
                      <SelectItem value="with-balance">With Balance</SelectItem>
                      <SelectItem value="no-balance">No Balance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                  <span className="sr-only">Filter</span>
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Total Purchases</TableHead>
                    <TableHead>Last Purchase</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    // Loading skeleton
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Skeleton className="h-6 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-10 w-40" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-8 w-8 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : paginatedCustomers.length > 0 ? (
                    paginatedCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm">{customer.email}</span>
                            <span className="text-sm text-muted-foreground">{customer.phone}</span>
                          </div>
                        </TableCell>
                        <TableCell>${customer.totalPurchases?.toFixed(2) || "0.00"}</TableCell>
                        <TableCell>{customer.lastPurchase ? formatDate(customer.lastPurchase) : "Never"}</TableCell>
                        <TableCell>
                          <Badge variant={customer.status === "active" ? "default" : "secondary"}>
                            {customer.status?.charAt(0).toUpperCase() + customer.status?.slice(1) || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {customer.outstandingBalance > 0 ? (
                            <span className="text-destructive font-medium">
                              ${customer.outstandingBalance.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">$0.00</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/customers/${customer.id}`}>View Details</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/customers/${customer.id}/edit`}>Edit Customer</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/pos?customer=${customer.id}`}>New Sale</Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onSelect={(e) => {
                                      e.preventDefault()
                                      setCustomerToDelete(customer.id)
                                    }}
                                  >
                                    Delete Customer
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the customer and all
                                      associated data.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setCustomerToDelete(null)}>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteCustomer}>Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No customers found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {filteredCustomers.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing <strong>{startIndex + 1}</strong> to{" "}
                  <strong>{Math.min(startIndex + itemsPerPage, filteredCustomers.length)}</strong> of{" "}
                  <strong>{filteredCustomers.length}</strong> customers
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                      let pageNumber = i + 1

                      // Adjust page numbers for pagination with many pages
                      if (totalPages > 5) {
                        if (currentPage > 3 && currentPage < totalPages - 1) {
                          pageNumber = currentPage - 2 + i
                        } else if (currentPage >= totalPages - 1) {
                          pageNumber = totalPages - 4 + i
                        }
                      }

                      return (
                        <PaginationItem key={i}>
                          <PaginationLink
                            onClick={() => setCurrentPage(pageNumber)}
                            isActive={currentPage === pageNumber}
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    })}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || totalPages === 0}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
