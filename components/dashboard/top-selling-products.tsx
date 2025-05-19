"use client"

import { useEffect, useState } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { subscribeToCollection } from "@/firebase/firestore"
import type { Sale } from "@/types/firestore"

type TopProduct = {
  name: string
  value: number
  quantity: number
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export function TopSellingProducts() {
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = subscribeToCollection<Sale>(
      "sales",
      (data) => {
        // Process sales data to get top selling products
        const productMap = new Map<string, { name: string; value: number; quantity: number }>()

        // Iterate through all sales and their items
        data.forEach((sale) => {
          sale.items.forEach((item) => {
            if (!item.product || !item.product.id || !item.product.name) {
              // Skip items with missing product data
              return
            }
            const productId = item.product.id
            const productName = item.product.name
            const productTotal = item.total
            const productQuantity = item.quantity

            if (productMap.has(productId)) {
              const existing = productMap.get(productId)!
              productMap.set(productId, {
                name: productName,
                value: existing.value + productTotal,
                quantity: existing.quantity + productQuantity,
              })
            } else {
              productMap.set(productId, {
                name: productName,
                value: productTotal,
                quantity: productQuantity,
              })
            }
          })
        })

        // Convert map to array and sort by value (revenue)
        const productsArray = Array.from(productMap.values())
          .sort((a, b) => b.value - a.value)
          .slice(0, 5) // Take top 5

        setTopProducts(productsArray)
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
      <div className="h-[300px] w-full flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (topProducts.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
        No sales data available
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={topProducts}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {topProducts.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
            labelFormatter={(name) => `${name}`}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
