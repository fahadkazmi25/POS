"use client"

import { useState, useEffect } from "react"
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/firebase/config"
import type { Sale, Product } from "@/types/firestore"
import { useToast } from "@/components/ui/use-toast"

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const q = query(collection(db, "sales"), orderBy("date", "desc"))

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const salesData: Sale[] = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          salesData.push({
            id: doc.id,
            saleNumber: data.saleNumber,
            date: data.date,
            customer: data.customer,
            items: data.items,
            subtotal: data.subtotal,
            discount: data.discount,
            tax: data.tax,
            total: data.total,
            paymentMethod: data.paymentMethod,
            notes: data.notes,
            status: data.status,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          })
        })
        setSales(salesData)
        setLoading(false)
      },
      (err) => {
        console.error("Error fetching sales:", err)
        setError("Failed to load sales data")
        setLoading(false)
        toast({
          title: "Error",
          description: "Failed to load sales data",
          variant: "destructive",
        })
      },
    )

    return () => unsubscribe()
  }, [toast])

  const addSale = async (saleData: Omit<Sale, "id">): Promise<string> => {
    try {
      // Sanitize data to replace undefined with null
      const sanitizedSale = Object.entries(saleData).reduce(
        (acc, [key, value]) => {
          acc[key] = value === undefined ? null : value
          return acc
        },
        {} as Record<string, any>,
      )

      // Ensure date is properly formatted
      if (!(sanitizedSale.date instanceof Timestamp)) {
        sanitizedSale.date = Timestamp.fromDate(
          sanitizedSale.date instanceof Date ? sanitizedSale.date : new Date(sanitizedSale.date),
        )
      }

      // Add created timestamp
      sanitizedSale.createdAt = serverTimestamp()

      // Add the sale document
      const docRef = await addDoc(collection(db, "sales"), sanitizedSale)

      // Update product stock levels
      await runTransaction(db, async (transaction) => {
        for (const item of saleData.items) {
          const productRef = doc(db, "products", item.productId)
          const productDoc = await transaction.get(productRef)

          if (!productDoc.exists()) {
            throw new Error(`Product ${item.productId} not found`)
          }

          const productData = productDoc.data() as Product
          const newStock = (productData.stock || 0) - item.quantity

          if (newStock < 0) {
            throw new Error(`Insufficient stock for ${productData.name}`)
          }

          transaction.update(productRef, { stock: newStock })
        }
      })

      toast({
        title: "Sale Completed",
        description: `Sale #${saleData.saleNumber} has been completed successfully`,
      })

      return docRef.id
    } catch (error) {
      console.error("Error adding sale:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to complete sale"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw error
    }
  }

  const getSale = async (id: string): Promise<Sale | null> => {
    try {
      const docRef = doc(db, "sales", id)
      const docSnap = await getDocs(query(collection(db, "sales"), where("__name__", "==", id)))

      if (!docSnap.empty) {
        const data = docSnap.docs[0].data()
        return {
          id: docSnap.docs[0].id,
          saleNumber: data.saleNumber,
          date: data.date,
          customer: data.customer,
          items: data.items,
          subtotal: data.subtotal,
          discount: data.discount,
          tax: data.tax,
          total: data.total,
          paymentMethod: data.paymentMethod,
          notes: data.notes || null,
          status: data.status,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        }
      }
      return null
    } catch (error) {
      console.error("Error getting sale:", error)
      toast({
        title: "Error",
        description: "Failed to load sale details",
        variant: "destructive",
      })
      return null
    }
  }

  const updateSale = async (id: string, saleData: Partial<Sale>): Promise<boolean> => {
    try {
      // Sanitize data to replace undefined with null
      const sanitizedData = Object.entries(saleData).reduce(
        (acc, [key, value]) => {
          acc[key] = value === undefined ? null : value
          return acc
        },
        {} as Record<string, any>,
      )

      // Ensure date is properly formatted if it exists
      if (sanitizedData.date && !(sanitizedData.date instanceof Timestamp)) {
        sanitizedData.date = Timestamp.fromDate(
          sanitizedData.date instanceof Date ? sanitizedData.date : new Date(sanitizedData.date),
        )
      }

      // Add updated timestamp
      sanitizedData.updatedAt = serverTimestamp()

      const saleRef = doc(db, "sales", id)
      await updateDoc(saleRef, sanitizedData)

      toast({
        title: "Sale Updated",
        description: "Sale details have been updated successfully",
      })

      return true
    } catch (error) {
      console.error("Error updating sale:", error)
      toast({
        title: "Error",
        description: "Failed to update sale",
        variant: "destructive",
      })
      return false
    }
  }

  const deleteSale = async (id: string): Promise<boolean> => {
    try {
      // Get the sale to restore stock
      const saleRef = doc(db, "sales", id)
      const saleDoc = await getDocs(query(collection(db, "sales"), where("__name__", "==", id)))

      if (saleDoc.empty) {
        throw new Error("Sale not found")
      }

      const saleData = saleDoc.docs[0].data()

      // Restore product stock levels
      await runTransaction(db, async (transaction) => {
        for (const item of saleData.items) {
          const productRef = doc(db, "products", item.productId)
          const productDoc = await transaction.get(productRef)

          if (productDoc.exists()) {
            const productData = productDoc.data() as Product
            const newStock = (productData.stock || 0) + item.quantity
            transaction.update(productRef, { stock: newStock })
          }
        }

        // Delete the sale
        transaction.delete(saleRef)
      })

      toast({
        title: "Sale Deleted",
        description: "Sale has been deleted and stock has been restored",
      })

      return true
    } catch (error) {
      console.error("Error deleting sale:", error)
      toast({
        title: "Error",
        description: "Failed to delete sale",
        variant: "destructive",
      })
      return false
    }
  }

  const getRecentSales = (limit = 5): Sale[] => {
    return sales.slice(0, limit)
  }

  const getSalesByCustomer = (customerId: string): Sale[] => {
    return sales.filter((sale) => sale.customer.id === customerId)
  }

  const getSalesByDateRange = (startDate: Date, endDate: Date): Sale[] => {
    return sales.filter((sale) => {
      const saleDate = sale.date.toDate()
      return saleDate >= startDate && saleDate <= endDate
    })
  }

  // Helper function to format Timestamp to Date for display
  const formatTimestampToDate = (timestamp: Timestamp): Date => {
    return timestamp.toDate()
  }

  return {
    sales,
    loading,
    error,
    addSale,
    getSale,
    updateSale,
    deleteSale,
    getRecentSales,
    getSalesByCustomer,
    getSalesByDateRange,
    formatTimestampToDate,
  }
}
