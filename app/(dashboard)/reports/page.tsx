"use client"

import { useState } from "react"
import { Download, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SalesReport } from "@/components/reports/sales-report"
import { InventoryReport } from "@/components/reports/inventory-report"
import { TaxReport } from "@/components/reports/tax-report"
import { ProfitReport } from "@/components/reports/profit-report"
import { DateRangePicker } from "@/components/date-range-picker"

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Reports & Analytics</CardTitle>
              <CardDescription>View and analyze your business performance</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <DateRangePicker date={dateRange} onDateChange={setDateRange} />
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filter</span>
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sales" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="tax">Tax</TabsTrigger>
              <TabsTrigger value="profit">Profit</TabsTrigger>
            </TabsList>
            <TabsContent value="sales" className="mt-4 space-y-4">
              <SalesReport dateRange={dateRange} />
            </TabsContent>
            <TabsContent value="inventory" className="mt-4 space-y-4">
              <InventoryReport />
            </TabsContent>
            <TabsContent value="tax" className="mt-4 space-y-4">
              <TaxReport dateRange={dateRange} />
            </TabsContent>
            <TabsContent value="profit" className="mt-4 space-y-4">
              <ProfitReport dateRange={dateRange} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
