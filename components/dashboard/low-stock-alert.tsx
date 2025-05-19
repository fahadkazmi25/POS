"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { subscribeToCollection, type FirestoreData } from "@/firebase/firestore"
import type { Product } from "@/types/firestore"

export function LowStockAlert() {
  const [lowStockProducts, setLowStockProducts] = useState<FirestoreData<Product>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = subscribeToCollection<Product>(
      "products",
      (data) => {
        // Filter products with stock below or equal to reorder level
        const lowStock = data
          .filter((product) => product.stock <= product.reorderLevel)
          .sort((a, b) => a.stock - b.stock) // Sort by stock level (lowest first)
          .slice(0, 5) // Take only the first 5

        setLowStockProducts(lowStock)
        setLoading(false)
      },
      undefined,
      "stock",
      "asc",
    )

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Current Stock</TableHead>
            <TableHead>Reorder Level</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(4)].map((_, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">
                <div className="h-4 w-32 rounded bg-muted"></div>
              </TableCell>
              <TableCell>
                <div className="h-4 w-8 rounded bg-muted"></div>
              </TableCell>
              <TableCell>
                <div className="h-4 w-8 rounded bg-muted"></div>
              </TableCell>
              <TableCell>
                <div className="h-6 w-16 rounded bg-muted"></div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Current Stock</TableHead>
          <TableHead>Reorder Level</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lowStockProducts.map((product) => (
          <TableRow key={product.id}>
            <TableCell className="font-medium">{product.name}</TableCell>
            <TableCell>{product.stock}</TableCell>
            <TableCell>{product.reorderLevel}</TableCell>
            <TableCell>
              <Badge
                variant={
                  product.stock === 0
                    ? "destructive"
                    : product.stock < product.reorderLevel / 2
                      ? "destructive"
                      : "warning"
                }
              >
                {product.stock === 0 ? "Out of Stock" : product.stock < product.reorderLevel / 2 ? "Critical" : "Low"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
        {lowStockProducts.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
              No low stock products found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
