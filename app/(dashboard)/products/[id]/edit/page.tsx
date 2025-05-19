"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { useProducts } from "@/hooks/use-products"
import type { Product } from "@/types/firestore"
import { Loader2, ArrowLeft, Save, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function EditProductPage() {
  const { id } = useParams()
  const router = useRouter()
  const { getProduct, updateProduct, deleteProduct } = useProducts()
  const { toast } = useToast()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [cost, setCost] = useState("")
  const [sku, setSku] = useState("")
  const [barcode, setBarcode] = useState("")
  const [category, setCategory] = useState("")
  const [stock, setStock] = useState("")
  const [lowStockThreshold, setLowStockThreshold] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [isActive, setIsActive] = useState(true)

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const productData = await getProduct(id as string)
        if (productData) {
          setProduct(productData)
          // Initialize form state
          setName(productData.name || "")
          setDescription(productData.description || "")
          setPrice(productData.price?.toString() || "")
          setCost(productData.cost?.toString() || "")
          setSku(productData.sku || "")
          setBarcode(productData.barcode || "")
          setCategory(productData.category || "")
          setStock(productData.stock?.toString() || "")
          setLowStockThreshold(productData.lowStockThreshold?.toString() || "")
          setImageUrl(productData.imageUrl || "")
          setIsActive(productData.isActive !== false) // Default to true if undefined
        } else {
          setError("Product not found")
        }
      } catch (err) {
        console.error("Error fetching product:", err)
        setError("Failed to load product details")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProduct()
    }
  }, [id, getProduct])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name) {
      toast({
        title: "Validation Error",
        description: "Product name is required",
        variant: "destructive",
      })
      return
    }

    if (!price || isNaN(Number(price)) || Number(price) < 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid price",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)

      // Prepare product data
      const productData: Partial<Product> = {
        name,
        description: description || undefined,
        price: Number(price),
        cost: cost ? Number(cost) : undefined,
        sku: sku || undefined,
        barcode: barcode || undefined,
        category: category || undefined,
        stock: stock ? Number(stock) : undefined,
        lowStockThreshold: lowStockThreshold ? Number(lowStockThreshold) : undefined,
        imageUrl: imageUrl || undefined,
        isActive,
      }

      // Update product
      await updateProduct(id as string, productData)

      toast({
        title: "Product Updated",
        description: "Product has been updated successfully",
      })

      // Navigate back to product details
      router.push(`/products/${id}`)
    } catch (err) {
      console.error("Error updating product:", err)
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Handle product deletion
  const handleDelete = async () => {
    try {
      setDeleting(true)
      await deleteProduct(id as string)

      toast({
        title: "Product Deleted",
        description: "Product has been deleted successfully",
      })

      // Navigate back to products list
      router.push("/products")
    } catch (err) {
      console.error("Error deleting product:", err)
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      })
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          <h2 className="text-lg font-semibold">Error</h2>
          <p>{error || "Product not found"}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/products")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Products
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Button variant="outline" size="sm" className="mb-2" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Edit Product</h1>
        </div>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Product
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the product and remove it from the system.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground"
                >
                  {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Product Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter product description"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">
                      Price <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5">$</span>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                        className="pl-7"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cost">Cost</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5">$</span>
                      <Input
                        id="cost"
                        type="number"
                        step="0.01"
                        min="0"
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        placeholder="0.00"
                        className="pl-7"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Enter SKU" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="barcode">Barcode</Label>
                    <Input
                      id="barcode"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      placeholder="Enter barcode"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="clothing">Clothing</SelectItem>
                      <SelectItem value="food">Food & Beverages</SelectItem>
                      <SelectItem value="home">Home & Garden</SelectItem>
                      <SelectItem value="beauty">Beauty & Personal Care</SelectItem>
                      <SelectItem value="sports">Sports & Outdoors</SelectItem>
                      <SelectItem value="toys">Toys & Games</SelectItem>
                      <SelectItem value="books">Books & Media</SelectItem>
                      <SelectItem value="automotive">Automotive</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      step="1"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      placeholder="Enter stock quantity"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                    <Input
                      id="lowStockThreshold"
                      type="number"
                      min="0"
                      step="1"
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(e.target.value)}
                      placeholder="Enter low stock threshold"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-square bg-muted rounded-md overflow-hidden">
                  {imageUrl ? (
                    <img src={imageUrl || "/placeholder.svg"} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary/20">
                      <span className="text-muted-foreground">No image</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Enter image URL"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive" className="cursor-pointer">
                    Active
                    <p className="text-sm text-muted-foreground">Product will be available for sale</p>
                  </Label>
                  <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
