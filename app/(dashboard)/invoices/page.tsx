"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useInvoices } from "@/hooks/use-invoices"
// import { format } from "date-fns"
import { Loader2, Search, Eye, AlertCircle, Check } from "lucide-react"
import { DateRangePicker } from "@/components/date-range-picker"
import type { DateRange } from "react-day-picker"
import { format, isValid, parseISO } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function InvoicesPage() {
  const { invoices, loading } = useInvoices()
  const router = useRouter()
  const searchParams = useSearchParams()
  const saleId = searchParams.get("saleId")

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  // Filter invoices based on search, status, payment status, and date range
  const filteredInvoices = invoices.filter((invoice) => {
    // Filter by sale ID if provided
    if (saleId && invoice.saleId !== saleId) {
      return false
    }

    // Search filter
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customer.email.toLowerCase().includes(searchQuery.toLowerCase())

    // Status filter
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter

    // Payment status filter
    const matchesPaymentStatus = paymentStatusFilter === "all" || invoice.paymentStatus === paymentStatusFilter

    // Date range filter
    let matchesDateRange = true
    if (dateRange?.from) {
      const invoiceDate = new Date(invoice.date)
      matchesDateRange = invoiceDate >= dateRange.from

      if (dateRange.to) {
        matchesDateRange = matchesDateRange && invoiceDate <= dateRange.to
      }
    }

    return matchesSearch && matchesStatus && matchesPaymentStatus && matchesDateRange
  })

  // View invoice details
  const viewInvoice = (id: string) => {
    router.push(`/invoices/${id}`)
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Invoices</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by payment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <DateRangePicker date={dateRange} onDateChange={setDateRange} align="start" locale="en-US" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No invoices found. Try adjusting your filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      {/* <TableCell>{format(new Date(invoice.date), "PP")}</TableCell>
                      <TableCell>{format(new Date(invoice.dueDate), "PP")}</TableCell> */}
                      <TableCell>{invoice.customer.name}</TableCell>
                      <TableCell className="text-right">${invoice.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            invoice.status === "paid"
                              ? "success"
                              : invoice.status === "overdue"
                                ? "destructive"
                                : "outline"
                          }
                        >
                          {invoice.status === "paid" && <Check className="mr-1 h-3 w-3" />}
                          {invoice.status === "overdue" && <AlertCircle className="mr-1 h-3 w-3" />}
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            invoice.paymentStatus === "paid"
                              ? "success"
                              : invoice.paymentStatus === "overdue"
                                ? "destructive"
                                : "outline"
                          }
                        >
                          {invoice.paymentStatus === "paid" && <Check className="mr-1 h-3 w-3" />}
                          {invoice.paymentStatus === "overdue" && <AlertCircle className="mr-1 h-3 w-3" />}
                          {invoice.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" onClick={() => viewInvoice(invoice.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
