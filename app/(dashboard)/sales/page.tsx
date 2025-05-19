"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useSales } from "@/hooks/use-sales"
import { format } from "date-fns"
import { Loader2, Search, FileText, Eye } from "lucide-react"
import { DateRangePicker } from "@/components/date-range-picker"
import type { DateRange } from "react-day-picker"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SalesPage() {
  const { sales, loading } = useSales()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  // Filter sales based on search, status, and date range
  const filteredSales = sales.filter((sale) => {
    // Search filter
    const matchesSearch =
      sale.saleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.customer?.email?.toLowerCase().includes(searchQuery.toLowerCase())

    // Status filter
    const matchesStatus = statusFilter === "all" || sale.status === statusFilter

    // Date range filter
    let matchesDateRange = true
    if (dateRange?.from) {
      const saleDate = new Date(sale?.date)
      matchesDateRange = saleDate >= dateRange.from

      if (dateRange.to) {
        matchesDateRange = matchesDateRange && saleDate <= dateRange.to
      }
    }

    return matchesSearch && matchesStatus && matchesDateRange
  })

  // View sale details
  const viewSale = (id: string) => {
    router.push(`/sales/${id}`)
  }

  // View invoice for a sale
  const viewInvoice = (saleId: string) => {
    // This would need to be implemented to find the invoice by sale ID
    // For now, we'll just navigate to the invoices page
    router.push(`/invoices?saleId=${saleId}`)
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Sales</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sales..."
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
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
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
          ) : filteredSales.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No sales found. Try adjusting your filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sale #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.saleNumber}</TableCell>
                      {/* <TableCell>{format(new Date(sale.date), "PP")}</TableCell> */}
                      <TableCell>{sale.customer.name}</TableCell>
                      <TableCell>{sale.items.length} items</TableCell>
                      <TableCell className="text-right">${sale.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            sale.status === "completed"
                              ? "success"
                              : sale.status === "cancelled"
                                ? "destructive"
                                : "outline"
                          }
                        >
                          {sale.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">{sale.paymentMethod}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => viewSale(sale.id)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => viewInvoice(sale.id)}>
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
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
