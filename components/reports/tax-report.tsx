"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Sample data
const monthlyTaxData = [
  { month: "Jan", collected: 1245.67 },
  { month: "Feb", collected: 1345.89 },
  { month: "Mar", collected: 1567.23 },
  { month: "Apr", collected: 1298.45 },
  { month: "May", collected: 1876.12 },
]

const taxBreakdownData = [
  { category: "State Sales Tax (6%)", amount: 1456.78 },
  { category: "County Sales Tax (1.5%)", amount: 364.2 },
  { category: "City Sales Tax (0.75%)", amount: 182.1 },
  { category: "Special District Tax (0.25%)", amount: 60.7 },
]

export function TaxReport({ dateRange }: { dateRange: { from: Date | undefined; to: Date | undefined } }) {
  // Format date range for display
  const formatDateRange = () => {
    if (!dateRange.from || !dateRange.to) return "Custom Date Range"

    const from = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(dateRange.from)

    const to = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(dateRange.to)

    return `${from} - ${to}`
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tax Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,063.78</div>
            <p className="text-xs text-muted-foreground">For {formatDateRange()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxable Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$24,567.89</div>
            <p className="text-xs text-muted-foreground">For {formatDateRange()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Non-Taxable Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,234.56</div>
            <p className="text-xs text-muted-foreground">For {formatDateRange()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Effective Tax Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.4%</div>
            <p className="text-xs text-muted-foreground">Average for all sales</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Tax Collection</CardTitle>
          <CardDescription>Tax collected over the past 5 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTaxData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value) => [`$${value}`, "Tax Collected"]} />
                <Legend />
                <Line type="monotone" dataKey="collected" stroke="#FF8042" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tax Breakdown</CardTitle>
          <CardDescription>Breakdown of collected taxes by type</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tax Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxBreakdownData.map((item) => (
                <TableRow key={item.category}>
                  <TableCell className="font-medium">{item.category}</TableCell>
                  <TableCell className="text-right">${item.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{((item.amount / 2063.78) * 100).toFixed(1)}%</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell className="font-bold">Total</TableCell>
                <TableCell className="text-right font-bold">$2,063.78</TableCell>
                <TableCell className="text-right font-bold">100.0%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
