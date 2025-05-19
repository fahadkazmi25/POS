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
import type { Customer } from "@/types/firestore"
import { useToast } from "@/components/ui/use-toast"

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const q = query(collection(db, "customers"), orderBy("name"))

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const customersData: Customer[] = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          customersData.push({
            id: doc.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
            country: data.country,
            notes: data.notes,
            totalPurchases: data.totalPurchases,
            lastPurchaseDate: data.lastPurchaseDate,
            status: data.status || "active",
            vehicles: data.vehicles || [],
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          })
        })
        setCustomers(customersData)
        setLoading(false)
      },
      (err) => {
        console.error("Error fetching customers:", err)
        setError("Failed to load customers data")
        setLoading(false)
        toast({
          title: "Error",
          description: "Failed to load customers data",
          variant: "destructive",
        })
      },
    )

    return () => unsubscribe()
  }, [toast])

  const addCustomer = async (customerData: Omit<Customer, "id">): Promise<string> => {
    try {
      // Sanitize data to replace undefined with null
      const sanitizedCustomer = Object.entries(customerData).reduce(
        (acc, [key, value]) => {
          acc[key] = value === undefined ? null : value
          return acc
        },
        {} as Record<string, any>,
      )

      // Ensure lastPurchaseDate is properly formatted if it exists
      if (sanitizedCustomer.lastPurchaseDate instanceof Date) {
        sanitizedCustomer.lastPurchaseDate = Timestamp.fromDate(sanitizedCustomer.lastPurchaseDate)
      }

      // Add created timestamp
      sanitizedCustomer.createdAt = serverTimestamp()

      // Add the customer document
      const docRef = await addDoc(collection(db, "customers"), sanitizedCustomer)

      toast({
        title: "Customer Added",
        description: `${customerData.name} has been added successfully`,
      })

      return docRef.id
    } catch (error) {
      console.error("Error adding customer:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to add customer"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw error
    }
  }

  const getCustomer = async (id: string): Promise<Customer | null> => {
    try {
      const docRef = doc(db, "customers", id)
      const docSnap = await getDocs(query(collection(db, "customers"), where("__name__", "==", id)))

      if (!docSnap.empty) {
        const data = docSnap.docs[0].data()
        return {
          id: docSnap.docs[0].id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country,
          notes: data.notes,
          totalPurchases: data.totalPurchases,
          lastPurchaseDate: data.lastPurchaseDate,
          status: data.status || "active",
          vehicles: data.vehicles || [],
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        }
      }
      return null
    } catch (error) {
      console.error("Error getting customer:", error)
      toast({
        title: "Error",
        description: "Failed to load customer details",
        variant: "destructive",
      })
      return null
    }
  }

  const updateCustomer = async (id: string, customerData: Partial<Customer>): Promise<boolean> => {
    try {
      // Sanitize data to replace undefined with null
      const sanitizedData = Object.entries(customerData).reduce(
        (acc, [key, value]) => {
          acc[key] = value === undefined ? null : value
          return acc
        },
        {} as Record<string, any>,
      )

      // Ensure lastPurchaseDate is properly formatted if it exists
      if (sanitizedData.lastPurchaseDate instanceof Date) {
        sanitizedData.lastPurchaseDate = Timestamp.fromDate(sanitizedData.lastPurchaseDate)
      }

      // Add updated timestamp
      sanitizedData.updatedAt = serverTimestamp()

      const customerRef = doc(db, "customers", id)
      await updateDoc(customerRef, sanitizedData)

      toast({
        title: "Customer Updated",
        description: "Customer details have been updated successfully",
      })

      return true
    } catch (error) {
      console.error("Error updating customer:", error)
      toast({
        title: "Error",
        description: "Failed to update customer",
        variant: "destructive",
      })
      return false
    }
  }

  const deleteCustomer = async (id: string): Promise<boolean> => {
    try {
      const customerRef = doc(db, "customers", id)
      await deleteDoc(customerRef)

      toast({
        title: "Customer Deleted",
        description: "Customer has been deleted successfully",
      })

      return true
    } catch (error) {
      console.error("Error deleting customer:", error)
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive",
      })
      return false
    }
  }

  const getRecentCustomers = (limit = 5): Customer[] => {
    return [...customers]
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt.seconds * 1000) : new Date(0)
        const dateB = b.createdAt ? new Date(b.createdAt.seconds * 1000) : new Date(0)
        return dateB.getTime() - dateA.getTime()
      })
      .slice(0, limit)
  }

  const getTopCustomers = (limit = 5): Customer[] => {
    return [...customers].sort((a, b) => (b.totalPurchases || 0) - (a.totalPurchases || 0)).slice(0, limit)
  }

  const getCustomersByStatus = (status: "active" | "inactive" | "blocked"): Customer[] => {
    return customers.filter((customer) => customer.status === status)
  }

  return {
    customers,
    loading,
    error,
    addCustomer,
    getCustomer,
    updateCustomer,
    deleteCustomer,
    getRecentCustomers,
    getTopCustomers,
    getCustomersByStatus,
  }
}
