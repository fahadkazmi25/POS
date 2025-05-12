"use client"

import { Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend, Line, ComposedChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Sample data
const monthlyProfitData = [
  { month: "Jan", revenue: 12456.78, cost: 7890.12, profit: 4566.66 },
  { month: "Feb", revenue: 13458.9, cost: 8123.45, profit: 5335.45 },
  { month: "Mar", revenue: 15672.34, cost: 9345.67, profit: 6326.67 },
  { month: "Apr", revenue: 12984.56, cost: 7654.32, profit: 5330.24 },
  { month: "May", revenue: 18761.23, cost: 10234.56, profit: 8526.67 },
]

const profitByCategory = [
  { category: "Filters", revenue: 4567.89, cost: 2345.67, profit: 2222.22, margin: 48.6 },
  { category: "Brakes", revenue: 6789.12, cost: 3456.78, profit: 3332.34, margin: 49.1 },
  { category: "Exterior", revenue: 3456.78, cost: 1789.23, profit: 1667.55, margin: 48.2 },
  { category: "Ignition", revenue: 2345.67, cost: 1234.56, profit: 1111.11, margin: 47.4 },
  { category: "Fluids", revenue: 5678.9, cost: 2987.65, profit: 2691.25, margin: 47.4 },
  { category: "Lighting", revenue: 1234.56, cost: 678.9, profit: 555.66, margin: 45.0 },
]

export function ProfitReport({ dateRange }: { dateRange: { from: Date | undefined; to: Date | undefined } }) {
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

  // Calculate totals
  const totalRevenue = profitByCategory.reduce((sum, item) => sum + item.revenue, 0)
  const totalCost = profitByCategory.reduce((sum, item) => sum + item.cost, 0)
  const totalProfit = profitByCategory.reduce((sum, item) => sum + item.profit, 0)
  const averageMargin = (totalProfit / totalRevenue) * 100

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">For {formatDateRange()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">For {formatDateRange()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalProfit.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">For {formatDateRange()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageMargin.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Average across all sales</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Profit Analysis</CardTitle>
          <CardDescription>Revenue, cost, and profit trends over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyProfitData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value) => [`$${value}`, ""]} />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                <Bar dataKey="cost" fill="#82ca9d" name="Cost" />
                <Line type="monotone" dataKey="profit" stroke="#ff7300" name="Profit" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profit by Category</CardTitle>
          <CardDescription>Breakdown of profit by product category</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="text-right">Profit</TableHead>
                <TableHead className="text-right">Margin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profitByCategory.map((item) => (
                <TableRow key={item.category}>
                  <TableCell className="font-medium">{item.category}</TableCell>
                  <TableCell className="text-right">${item.revenue.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${item.cost.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${item.profit.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{item.margin.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell className="font-bold">Total</TableCell>
                <TableCell className="text-right font-bold">${totalRevenue.toFixed(2)}</TableCell>
                <TableCell className="text-right font-bold">${totalCost.toFixed(2)}</TableCell>
                <TableCell className="text-right font-bold">${totalProfit.toFixed(2)}</TableCell>
                <TableCell className="text-right font-bold">{averageMargin.toFixed(1)}%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
