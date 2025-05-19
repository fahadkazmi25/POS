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
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/firebase/config"
import type { Product } from "@/types/firestore"
import { useToast } from "@/components/ui/use-toast"

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("name"))

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const productsData: Product[] = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          productsData.push({
            id: doc.id,
            name: data.name,
            description: data.description,
            price: data.price,
            cost: data.cost,
            sku: data.sku,
            barcode: data.barcode,
            category: data.category,
            stock: data.stock,
            lowStockThreshold: data.lowStockThreshold,
            imageUrl: data.imageUrl,
            imageBase64: data.imageBase64,
            isActive: data.isActive,
            attributes: data.attributes,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          })
        })
        setProducts(productsData)
        setLoading(false)
      },
      (err) => {
        console.error("Error fetching products:", err)
        setError("Failed to load products data")
        setLoading(false)
        toast({
          title: "Error",
          description: "Failed to load products data",
          variant: "destructive",
        })
      },
    )

    return () => unsubscribe()
  }, [toast])

  const addProduct = async (productData: Omit<Product, "id">): Promise<string> => {
    try {
      // Sanitize data to replace undefined with null
      const sanitizedProduct = Object.entries(productData).reduce(
        (acc, [key, value]) => {
          acc[key] = value === undefined ? null : value
          return acc
        },
        {} as Record<string, any>,
      )

      // Add created timestamp
      sanitizedProduct.createdAt = serverTimestamp()

      // Add the product document
      const docRef = await addDoc(collection(db, "products"), sanitizedProduct)

      toast({
        title: "Product Added",
        description: `${productData.name} has been added successfully`,
      })

      return docRef.id
    } catch (error) {
      console.error("Error adding product:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to add product"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw error
    }
  }

  const getProduct = async (id: string): Promise<Product | null> => {
    try {
      const docRef = doc(db, "products", id)
      const docSnap = await getDocs(query(collection(db, "products"), where("__name__", "==", id)))

      if (!docSnap.empty) {
        const data = docSnap.docs[0].data()
        return {
          id: docSnap.docs[0].id,
          name: data.name,
          description: data.description,
          price: data.price,
          cost: data.cost,
          sku: data.sku,
          barcode: data.barcode,
          category: data.category,
          stock: data.stock,
          lowStockThreshold: data.lowStockThreshold,
          imageUrl: data.imageUrl,
          imageBase64: data.imageBase64,
          isActive: data.isActive,
          attributes: data.attributes,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        }
      }
      return null
    } catch (error) {
      console.error("Error getting product:", error)
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive",
      })
      return null
    }
  }

  const updateProduct = async (id: string, productData: Partial<Product>): Promise<boolean> => {
    try {
      // Sanitize data to replace undefined with null
      const sanitizedData = Object.entries(productData).reduce(
        (acc, [key, value]) => {
          acc[key] = value === undefined ? null : value
          return acc
        },
        {} as Record<string, any>,
      )

      // Add updated timestamp
      sanitizedData.updatedAt = serverTimestamp()

      const productRef = doc(db, "products", id)
      await updateDoc(productRef, sanitizedData)

      toast({
        title: "Product Updated",
        description: "Product details have been updated successfully",
      })

      return true
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      })
      return false
    }
  }

  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      const productRef = doc(db, "products", id)
      await deleteDoc(productRef)

      toast({
        title: "Product Deleted",
        description: "Product has been deleted successfully",
      })

      return true
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      })
      return false
    }
  }

  const getLowStockProducts = (): Product[] => {
    return products.filter((product) => {
      return (
        product.stock !== undefined &&
        product.lowStockThreshold !== undefined &&
        product.stock <= product.lowStockThreshold
      )
    })
  }

  const getOutOfStockProducts = (): Product[] => {
    return products.filter((product) => {
      return product.stock !== undefined && product.stock <= 0
    })
  }

  const getProductsByCategory = (category: string): Product[] => {
    return products.filter((product) => product.category === category)
  }

  return {
    products,
    loading,
    error,
    addProduct,
    getProduct,
    updateProduct,
    deleteProduct,
    getLowStockProducts,
    getOutOfStockProducts,
    getProductsByCategory,
  }
}
