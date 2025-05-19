"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { subscribeToCollection } from "@/firebase/firestore"
import type { Sale } from "@/types/firestore"

type DailySales = {
  name: string
  total: number
}

export function Overview() {
  const [dailySales, setDailySales] = useState<DailySales[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const startOfDay = today.getTime()

    const unsubscribe = subscribeToCollection<Sale>(
      "sales",
      (data) => {
        // Process sales data to get hourly sales for today
        const hourlyMap = new Map<number, number>()

        // Initialize all hours with 0
        for (let hour = 9; hour <= 17; hour++) {
          hourlyMap.set(hour, 0)
        }

        // Filter sales for today and aggregate by hour
        data.forEach((sale) => {
          if (sale.date && sale.date.toMillis() >= startOfDay) {
            const saleDate = sale.date.toDate()
            const hour = saleDate.getHours()

            if (hourlyMap.has(hour)) {
              hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + sale.total)
            }
          }
        })

        // Convert map to array for chart
        const hourlyData = Array.from(hourlyMap.entries())
          .map(([hour, total]) => ({
            name: `${hour}${hour >= 12 ? "PM" : "AM"}`,
            total,
          }))
          .sort((a, b) => {
            const hourA = Number.parseInt(a.name)
            const hourB = Number.parseInt(b.name)
            return hourA - hourB
          })

        setDailySales(hourlyData)
        setLoading(false)
      },
      undefined,
      "date",
      "desc",
    )

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={dailySales}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <Tooltip
          formatter={(value: number) => [`$${value.toFixed(2)}`, "Sales"]}
          labelFormatter={(label) => `Time: ${label}`}
        />
        <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
      </BarChart>
    </ResponsiveContainer>
  )
}
