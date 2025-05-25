"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useProducts } from "@/hooks/use-products"
import { useCustomers } from "@/hooks/use-customers"
import { useSales } from "@/hooks/use-sales"
import { useInvoices } from "@/hooks/use-invoices"
import type { Product, Customer, SaleItem } from "@/types/firestore"
import { Loader2, Search, Plus, Trash2, AlertCircle, ShoppingCart, User, Receipt } from "lucide-react"
import { Timestamp } from "firebase/firestore"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type CartItem = {
  product: Product
  quantity: number
  subtotal: number
}

export default function POSPage() {
  const { products, loading: productsLoading } = useProducts()
  const { customers, loading: customersLoading } = useCustomers()
  const { addSale } = useSales()
  const { addInvoice } = useInvoices()
  const { toast } = useToast()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerSearchQuery, setCustomerSearchQuery] = useState("")
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [notes, setNotes] = useState("")
  const [isCompletingSale, setIsCompletingSale] = useState(false)
  const [saleError, setSaleError] = useState<string | null>(null)
  const [discount, setDiscount] = useState(0)
  const [tax, setTax] = useState(0)

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0)
  const discountAmount = (subtotal * discount) / 100
  const taxAmount = ((subtotal - discountAmount) * tax) / 100
  const total = subtotal - discountAmount + taxAmount

  // Filter products based on search and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeTab === "all" || product.category === activeTab
    return matchesSearch && matchesCategory
  })

  // Get unique categories for tabs
  const categories = ["all", ...new Set(products.map((product) => product.category || "uncategorized"))]

  // Filter customers based on search
  const filteredCustomers = customers.filter((customer) => {
    return (
      customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
      customer.phone.toLowerCase().includes(customerSearchQuery.toLowerCase())
    )
  })

  // Handle customer selection
  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setCustomerSearchQuery("")
    setCustomerDialogOpen(false) // Close the dialog after selection
  }

  // Add product to cart
  const addToCart = (product: Product) => {
    if (!product.stock || product.stock <= 0) {
      toast({
        title: "Out of Stock",
        description: `${product.name} is currently out of stock.`,
        variant: "destructive",
      })
      return
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id)

      if (existingItem) {
        // Check if adding one more would exceed stock
        if (existingItem.quantity + 1 > (product.stock || 0)) {
          toast({
            title: "Insufficient Stock",
            description: `Only ${product.stock} units of ${product.name} available.`,
            variant: "destructive",
          })
          return prevCart
        }

        // Update quantity of existing item
        return prevCart.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * (product.price || 0),
              }
            : item,
        )
      } else {
        // Add new item to cart
        return [
          ...prevCart,
          {
            product,
            quantity: 1,
            subtotal: product.price || 0,
          },
        ]
      }
    })
  }

  // Update cart item quantity
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.product.id === productId) {
          // Check if new quantity exceeds stock
          if (newQuantity > (item.product.stock || 0)) {
            toast({
              title: "Insufficient Stock",
              description: `Only ${item.product.stock} units of ${item.product.name} available.`,
              variant: "destructive",
            })
            return item
          }

          return {
            ...item,
            quantity: newQuantity,
            subtotal: newQuantity * (item.product.price || 0),
          }
        }
        return item
      })
    })
  }

  // Remove item from cart
  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId))
  }

  // Clear the cart
  const clearCart = () => {
    setCart([])
    setSelectedCustomer(null)
    setPaymentMethod("cash")
    setNotes("")
    setDiscount(0)
    setTax(0)
    setSaleError(null)
  }

  // Handle complete sale
  const handleCompleteSale = async () => {
    // Reset any previous errors
    setSaleError(null)

    // Validate customer selection
    if (!selectedCustomer) {
      toast({
        title: "Customer Required",
        description: "Please select a customer before completing the sale.",
        variant: "destructive",
      })
      return
    }

    // Validate cart is not empty
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add products to the cart before completing the sale.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsCompletingSale(true)

      // Generate sale number
      const saleNumber = `SALE-${Date.now().toString().slice(-6)}`

      // Generate invoice number
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`

      // Prepare sale items
      const saleItems: SaleItem[] = cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price || 0,
        quantity: item.quantity,
        subtotal: item.subtotal,
      }))

      // Prepare customer data
      const customerData = {
        id: selectedCustomer.id,
        name: selectedCustomer.name,
        email: selectedCustomer.email,
        phone: selectedCustomer.phone,
      }

      // Prepare sale data
      const saleData = {
        saleNumber,
        date: Timestamp.now(),
        customer: customerData,
        items: saleItems,
        subtotal,
        discount: discountAmount,
        tax: taxAmount,
        total,
        paymentMethod,
        notes: notes || null,
        status: "completed" as const,
      }

      console.log("Completing sale with data:", saleData)

      // Add sale to Firestore
      const saleId = await addSale(saleData)

      console.log("Sale completed successfully with ID:", saleId)

      // Calculate tax rate
      const taxRate = subtotal > 0 ? (taxAmount / (subtotal - discountAmount)) * 100 : 0

      // Prepare invoice data
      const invoiceData = {
        invoiceNumber,
        saleId,
        date: Timestamp.now(),
        dueDate: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // Due in 30 days
        customer: customerData,
        items: saleItems,
        subtotal,
        discount: discountAmount,
        tax: taxAmount,
        taxRate,
        total,
        notes: notes || null,
        status: "sent" as const,
        paymentStatus: paymentMethod === "cash" ? "paid" : ("pending" as const),
      }

      // Add invoice to Firestore
      const invoiceId = await addInvoice(invoiceData)

      console.log("Invoice created successfully with ID:", invoiceId)

      // Show success message
      toast({
        title: "Sale Completed",
        description: `Sale #${saleNumber} has been completed successfully.`,
      })

      // Clear the cart and reset form
      clearCart()

      // Navigate to invoice details
      router.push(`/invoices/${invoiceId}`)
    } catch (error) {
      console.error("Error completing sale:", error)

      // Set error message
      setSaleError(error instanceof Error ? error.message : "An unknown error occurred")

      // Show error toast
      toast({
        title: "Sale Failed",
        description: "There was an error completing the sale. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCompletingSale(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Point of Sale</h1>

      {saleError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{saleError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2">
          <Card className="shadow-md">
            <CardHeader className=" ">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <CardTitle>Products</CardTitle>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4 flex justify-start">
                  {categories.map((category) => (
                    <TabsTrigger key={category} value={category} className="capitalize">
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <TabsContent value={activeTab} className="mt-0">
                  {productsLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No products found. Try a different search or category.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {filteredProducts.map((product) => (
                        <Card
                          key={product.id}
                          className={`cursor-pointer hover:bg-accent transition-colors ${
                            !product.stock || product.stock <= 0 ? "opacity-50" : ""
                          }`}
                          onClick={() => addToCart(product)}
                        >
                          <CardContent className="p-3">
                            <div className="aspect-square relative mb-2 bg-muted rounded-md overflow-hidden">
                              {product.imageUrl || product.imageBase64 ? (
                                <img
                                  src={product.imageUrl || product.imageBase64 || "/placeholder.svg"}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-secondary/20">
                                  <span className="text-muted-foreground">No image</span>
                                </div>
                              )}
                              {(!product.stock || product.stock <= 0) && (
                                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                  <Badge variant="destructive">Out of Stock</Badge>
                                </div>
                              )}
                              {product.stock && product.stock <= 5 && product.stock > 0 && (
                                <Badge variant="secondary" className="absolute top-1 right-1">
                                  Low Stock: {product.stock}
                                </Badge>
                              )}
                            </div>
                            <h3 className="font-medium line-clamp-1">{product.name}</h3>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-primary font-bold">Rs.{product.price}</span>
                              <span className="text-xs text-muted-foreground">
                                {product.stock ? `${product.stock} in stock` : "No stock"}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Cart Section */}
        <div>
          <Card className="sticky top-6 shadow-md border-primary/10">
            <CardHeader className="bg-primary/5">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Cart
                </CardTitle>
                {cart.length > 0 && (
                  <Button variant="outline" size="sm" onClick={clearCart}>
                    Clear
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {/* Customer Selection */}
              <div className="mb-4">
                <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant={selectedCustomer ? "outline" : "default"}
                      className={`w-full justify-start `}
                    >
                      {selectedCustomer ? (
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          <span className="truncate">
                            {selectedCustomer.name} ({selectedCustomer.phone})
                          </span>
                        </div>
                      ) : (
                        <span className="flex items-center">
                          <Plus className="mr-2 h-4 w-4" />
                          Select Customer *
                        </span>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Select Customer</DialogTitle>
                    </DialogHeader>
                    <div className="relative mb-4">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search customers..."
                        className="pl-8"
                        value={customerSearchQuery}
                        onChange={(e) => setCustomerSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {customersLoading ? (
                        <div className="flex justify-center items-center h-20">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : filteredCustomers.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground">
                          No customers found. Try a different search.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {filteredCustomers.map((customer) => (
                            <div
                              key={customer.id}
                              className="p-2 rounded-md hover:bg-accent cursor-pointer"
                              onClick={() => handleSelectCustomer(customer)}
                            >
                              <div className="font-medium">{customer.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {customer.phone} • {customer.email}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button asChild>
                        <DialogClose>Cancel</DialogClose>
                      </Button>
                      <Button asChild>
                        <a href="/customers/new" target="_blank" rel="noreferrer">
                          Add New Customer
                        </a>
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {!selectedCustomer && (
                  <p className="text-destructive text-sm mt-1">* Customer selection is required to complete the sale</p>
                )}
              </div>

              {/* Cart Items */}
              {cart.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Cart is empty. Add products to begin.</div>
              ) : (
                <div className="space-y-4">
                  <div className="max-h-[300px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cart.map((item) => (
                          <TableRow key={item.product.id}>
                            <TableCell className="font-medium">{item.product.name}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                >
                                  -
                                </Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                >
                                  +
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">Rs.{item.subtotal}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive"
                                onClick={() => removeFromCart(item.product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Cart Summary */}
                  <div className="space-y-2 bg-muted/30 p-3 rounded-md">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>Rs.{subtotal}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Discount (%)</span>
                      <Input
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                        className="w-20 text-right"
                        min="0"
                        max="100"
                      />
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Discount Amount</span>
                        <span>-Rs.{discountAmount}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span>Tax (%)</span>
                      <Input
                        type="number"
                        value={tax}
                        onChange={(e) => setTax(Number(e.target.value))}
                        className="w-20 text-right"
                        min="0"
                      />
                    </div>
                    {tax > 0 && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Tax Amount</span>
                        <span>Rs.{taxAmount}</span>
                      </div>
                    )}
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>Rs.{total}</span>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Payment Method</label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="credit">Credit Card</SelectItem>
                        <SelectItem value="debit">Debit Card</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notes (Optional)</label>
                    <Textarea
                      placeholder="Add notes about this sale..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  {/* Complete Sale Button */}
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleCompleteSale}
                    disabled={isCompletingSale || !selectedCustomer || cart.length === 0}
                  >
                    {isCompletingSale ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Receipt className="mr-2 h-5 w-5" />
                        Complete Sale
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
