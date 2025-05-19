"use client"

import { useState, useEffect } from "react"
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/firebase/config"
import type { Invoice } from "@/types/firestore"
import { useToast } from "@/components/ui/use-toast"

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const q = query(collection(db, "invoices"), orderBy("date", "desc"))

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const invoicesData: Invoice[] = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          invoicesData.push({
            id: doc.id,
            invoiceNumber: data.invoiceNumber,
            saleId: data.saleId,
            date: data.date,
            dueDate: data.dueDate,
            customer: data.customer,
            items: data.items,
            subtotal: data.subtotal,
            discount: data.discount,
            tax: data.tax,
            taxRate: data.taxRate,
            total: data.total,
            notes: data.notes || null,
            status: data.status,
            paymentStatus: data.paymentStatus,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          })
        })
        setInvoices(invoicesData)
        setLoading(false)
      },
      (err) => {
        console.error("Error fetching invoices:", err)
        setError("Failed to load invoices data")
        setLoading(false)
        toast({
          title: "Error",
          description: "Failed to load invoices data",
          variant: "destructive",
        })
      },
    )

    return () => unsubscribe()
  }, [toast])

  const addInvoice = async (invoiceData: Omit<Invoice, "id">): Promise<string> => {
    try {
      // Sanitize data to replace undefined with null
      const sanitizedInvoice = Object.entries(invoiceData).reduce(
        (acc, [key, value]) => {
          acc[key] = value === undefined ? null : value
          return acc
        },
        {} as Record<string, any>,
      )

      // Ensure dates are properly formatted
      if (!(sanitizedInvoice.date instanceof Timestamp)) {
        sanitizedInvoice.date = Timestamp.fromDate(
          sanitizedInvoice.date instanceof Date ? sanitizedInvoice.date : new Date(sanitizedInvoice.date),
        )
      }

      if (!(sanitizedInvoice.dueDate instanceof Timestamp)) {
        sanitizedInvoice.dueDate = Timestamp.fromDate(
          sanitizedInvoice.dueDate instanceof Date ? sanitizedInvoice.dueDate : new Date(sanitizedInvoice.dueDate),
        )
      }

      // Add created timestamp
      sanitizedInvoice.createdAt = serverTimestamp()

      // Add the invoice document
      const docRef = await addDoc(collection(db, "invoices"), sanitizedInvoice)

      toast({
        title: "Invoice Created",
        description: `Invoice #${invoiceData.invoiceNumber} has been created successfully`,
      })

      return docRef.id
    } catch (error) {
      console.error("Error adding invoice:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to create invoice"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw error
    }
  }

  const getInvoice = async (id: string): Promise<Invoice | null> => {
    try {
      const docRef = doc(db, "invoices", id)
      const docSnap = await getDocs(query(collection(db, "invoices"), where("__name__", "==", id)))

      if (!docSnap.empty) {
        const data = docSnap.docs[0].data()
        return {
          id: docSnap.docs[0].id,
          invoiceNumber: data.invoiceNumber,
          saleId: data.saleId,
          date: data.date,
          dueDate: data.dueDate,
          customer: data.customer,
          items: data.items,
          subtotal: data.subtotal,
          discount: data.discount,
          tax: data.tax,
          taxRate: data.taxRate,
          total: data.total,
          notes: data.notes || null,
          status: data.status,
          paymentStatus: data.paymentStatus,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        }
      }
      return null
    } catch (error) {
      console.error("Error getting invoice:", error)
      toast({
        title: "Error",
        description: "Failed to load invoice details",
        variant: "destructive",
      })
      return null
    }
  }

  const getInvoicesBySaleId = async (saleId: string): Promise<Invoice[]> => {
    try {
      const q = query(collection(db, "invoices"), where("saleId", "==", saleId))
      const querySnapshot = await getDocs(q)

      const invoicesData: Invoice[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        invoicesData.push({
          id: doc.id,
          invoiceNumber: data.invoiceNumber,
          saleId: data.saleId,
          date: data.date,
          dueDate: data.dueDate,
          customer: data.customer,
          items: data.items,
          subtotal: data.subtotal,
          discount: data.discount,
          tax: data.tax,
          taxRate: data.taxRate,
          total: data.total,
          notes: data.notes || null,
          status: data.status,
          paymentStatus: data.paymentStatus,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        })
      })

      return invoicesData
    } catch (error) {
      console.error("Error getting invoices by sale ID:", error)
      toast({
        title: "Error",
        description: "Failed to load invoices for this sale",
        variant: "destructive",
      })
      return []
    }
  }

  const updateInvoice = async (id: string, invoiceData: Partial<Invoice>): Promise<boolean> => {
    try {
      // Sanitize data to replace undefined with null
      const sanitizedData = Object.entries(invoiceData).reduce(
        (acc, [key, value]) => {
          acc[key] = value === undefined ? null : value
          return acc
        },
        {} as Record<string, any>,
      )

      // Ensure dates are properly formatted if they exist
      if (sanitizedData.date && !(sanitizedData.date instanceof Timestamp)) {
        sanitizedData.date = Timestamp.fromDate(
          sanitizedData.date instanceof Date ? sanitizedData.date : new Date(sanitizedData.date),
        )
      }

      if (sanitizedData.dueDate && !(sanitizedData.dueDate instanceof Timestamp)) {
        sanitizedData.dueDate = Timestamp.fromDate(
          sanitizedData.dueDate instanceof Date ? sanitizedData.dueDate : new Date(sanitizedData.dueDate),
        )
      }

      // Add updated timestamp
      sanitizedData.updatedAt = serverTimestamp()

      const invoiceRef = doc(db, "invoices", id)
      await updateDoc(invoiceRef, sanitizedData)

      toast({
        title: "Invoice Updated",
        description: "Invoice details have been updated successfully",
      })

      return true
    } catch (error) {
      console.error("Error updating invoice:", error)
      toast({
        title: "Error",
        description: "Failed to update invoice",
        variant: "destructive",
      })
      return false
    }
  }

  const deleteInvoice = async (id: string): Promise<boolean> => {
    try {
      const invoiceRef = doc(db, "invoices", id)
      await deleteDoc(invoiceRef)

      toast({
        title: "Invoice Deleted",
        description: "Invoice has been deleted successfully",
      })

      return true
    } catch (error) {
      console.error("Error deleting invoice:", error)
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive",
      })
      return false
    }
  }

  const getRecentInvoices = (limit = 5): Invoice[] => {
    return invoices.slice(0, limit)
  }

  const getInvoicesByCustomer = (customerId: string): Invoice[] => {
    return invoices.filter((invoice) => invoice.customer.id === customerId)
  }

  const getInvoicesByStatus = (status: string): Invoice[] => {
    return invoices.filter((invoice) => invoice.status === status)
  }

  const getInvoicesByPaymentStatus = (paymentStatus: string): Invoice[] => {
    return invoices.filter((invoice) => invoice.paymentStatus === paymentStatus)
  }

  // Helper function to format Timestamp to Date for display
  const formatTimestampToDate = (timestamp: Timestamp): Date => {
    return timestamp.toDate()
  }

  return {
    invoices,
    loading,
    error,
    addInvoice,
    getInvoice,
    getInvoicesBySaleId,
    updateInvoice,
    deleteInvoice,
    getRecentInvoices,
    getInvoicesByCustomer,
    getInvoicesByStatus,
    getInvoicesByPaymentStatus,
    formatTimestampToDate,
  }
}
