"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useProducts } from "@/hooks/use-products"
import type { Product } from "@/types/firestore"
import { useToast } from "@/components/ui/use-toast"
import { processImageForFirestore } from "@/utils/image-utils"

export default function AddProductPage() {
  const router = useRouter()
  const { addProduct } = useProducts()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [formData, setFormData] = useState<Omit<Product, "id" | "createdAt" | "updatedAt">>({
    name: "",
    sku: "",
    category: "",
    description: "",
    price: 0,
    purchasePrice: 0,
    stock: 0,
    reorderLevel: 0,
    supplier: "",
    supplierContact: "",
    vehicleCompatibility: "",
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: ["price", "purchasePrice", "stock", "reorderLevel"].includes(id) ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let imageBase64 = null

      // Process image if selected
      if (imageFile) {
        try {
          imageBase64 = await processImageForFirestore(imageFile)

          if (!imageBase64) {
            toast({
              title: "Image Processing Failed",
              description: "The image could not be processed. It may be too large.",
              variant: "destructive",
            })
          }
        } catch (error) {
          console.error("Error processing image:", error)
          toast({
            title: "Image Processing Failed",
            description: "There was an error processing the image.",
            variant: "destructive",
          })
        }
      }

      // Add product to Firestore
      await addProduct({
        ...formData,
        imageBase64: imageBase64 || null,
      })

      toast({
        title: "Product Added",
        description: "The product has been successfully added.",
      })

      // Navigate back to products page
      router.push("/products")
    } catch (error) {
      console.error("Error adding product:", error)
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Add New Product</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
              <CardDescription>Enter the basic details about the product.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  placeholder="Enter product name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU/Product Code</Label>
                <Input
                  id="sku"
                  placeholder="Enter SKU or product code"
                  required
                  value={formData.sku}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter product description"
                  className="min-h-[120px]"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Filters">Filters</SelectItem>
                    <SelectItem value="Brakes">Brakes</SelectItem>
                    <SelectItem value="Exterior">Exterior</SelectItem>
                    <SelectItem value="Ignition">Ignition</SelectItem>
                    <SelectItem value="Fluids">Fluids</SelectItem>
                    <SelectItem value="Lighting">Lighting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Inventory</CardTitle>
                <CardDescription>Set the pricing and inventory details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">Purchase Price</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2 pb-[2px] text-muted-foreground">Rs</span>
                    <Input
                      id="purchasePrice"
                      type="number"
                      step="0"
                      min="0"
                      className="pl-7"
                      placeholder="0"
                      required
                      value={formData.purchasePrice || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Selling Price</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2 pb-[2px] text-muted-foreground">Rs</span>
                    <Input
                      id="price"
                      type="number"
                      step="0"
                      min="0"
                      className="pl-7"
                      placeholder="0"
                      required
                      value={formData.price || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Quantity in Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    placeholder="0"
                    required
                    value={formData.stock || ""}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reorderLevel">Reorder Level</Label>
                  <Input
                    id="reorderLevel"
                    type="number"
                    min="0"
                    placeholder="0"
                    required
                    value={formData.reorderLevel || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Image</CardTitle>
                <CardDescription>Upload an image of the product (max 500KB after compression).</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="flex h-40 w-40 items-center justify-center rounded-md border border-dashed">
                    {imagePreview ? (
                      <Image
                        src={imagePreview || "/placeholder.svg"}
                        alt="Product preview"
                        width={160}
                        height={160}
                        className="h-full w-full rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center">
                        <Upload className="mb-2 h-10 w-10 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Drag & drop or click to upload</p>
                      </div>
                    )}
                  </div>
                  <div className="flex w-full items-center justify-center">
                    <Label htmlFor="image-upload" className="cursor-pointer text-sm text-primary hover:underline">
                      Select Image
                    </Label>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Enter any additional details about the product.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  placeholder="Enter supplier name"
                  value={formData.supplier}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplierContact">Supplier Contact</Label>
                <Input
                  id="supplierContact"
                  placeholder="Enter supplier contact"
                  value={formData.supplierContact}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleCompatibility">Vehicle Compatibility</Label>
              <Textarea
                id="vehicleCompatibility"
                placeholder="Enter vehicle compatibility information"
                className="min-h-[80px]"
                value={formData.vehicleCompatibility}
                onChange={handleInputChange}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.push("/products")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Product"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
