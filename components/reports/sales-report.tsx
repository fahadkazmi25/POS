"use client"

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Bar,
  BarChart,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Sample data
const dailySalesData = [
  { date: "May 1", sales: 1245.67 },
  { date: "May 2", sales: 1345.89 },
  { date: "May 3", sales: 1567.23 },
  { date: "May 4", sales: 1298.45 },
  { date: "May 5", sales: 1876.12 },
  { date: "May 6", sales: 1456.78 },
  { date: "May 7", sales: 1234.56 },
  { date: "May 8", sales: 1789.23 },
  { date: "May 9", sales: 1678.9 },
  { date: "May 10", sales: 1456.78 },
  { date: "May 11", sales: 1567.89 },
  { date: "May 12", sales: 1345.67 },
  { date: "May 13", sales: 1234.56 },
  { date: "May 14", sales: 1678.9 },
]

const categorySalesData = [
  { category: "Filters", sales: 4567.89 },
  { category: "Brakes", sales: 6789.12 },
  { category: "Exterior", sales: 3456.78 },
  { category: "Ignition", sales: 2345.67 },
  { category: "Fluids", sales: 5678.9 },
  { category: "Lighting", sales: 1234.56 },
]

const topProductsData = [
  { product: "Premium Oil Filter", quantity: 145, revenue: 1885.55 },
  { product: "Brake Pads (Front)", quantity: 87, revenue: 4349.13 },
  { product: "Synthetic Oil 5W-30", quantity: 132, revenue: 4354.68 },
  { product: "Air Filter", quantity: 98, revenue: 1567.02 },
  { product: "Windshield Wipers", quantity: 76, revenue: 1899.24 },
]

export function SalesReport({ dateRange }: { dateRange: { from: Date | undefined; to: Date | undefined } }) {
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
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$24,567.89</div>
            <p className="text-xs text-muted-foreground">+12.5% from previous period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">487</div>
            <p className="text-xs text-muted-foreground">+8.2% from previous period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Sale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$50.45</div>
            <p className="text-xs text-muted-foreground">+3.7% from previous period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,245</div>
            <p className="text-xs text-muted-foreground">+5.9% from previous period</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Trend</CardTitle>
          <CardDescription>Daily sales for {formatDateRange()}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailySalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value) => [`$${value}`, "Sales"]} />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#0088FE" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>Revenue breakdown by product category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categorySalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip formatter={(value) => [`$${value}`, "Sales"]} />
                  <Legend />
                  <Bar dataKey="sales" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>Best performing products by revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProductsData.map((product) => (
                  <TableRow key={product.product}>
                    <TableCell className="font-medium">{product.product}</TableCell>
                    <TableCell className="text-right">{product.quantity}</TableCell>
                    <TableCell className="text-right">${product.revenue.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
