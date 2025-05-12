"use client"

import { useState } from "react"
import Image from "next/image"
import { Minus, Plus, Search, ShoppingCart, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Sample product data
const products = [
  {
    id: 1,
    name: "Premium Oil Filter",
    category: "Filters",
    price: 12.99,
    image: "/placeholder.svg",
  },
  {
    id: 2,
    name: "Brake Pads (Front)",
    category: "Brakes",
    price: 49.99,
    image: "/placeholder.svg",
  },
  {
    id: 3,
    name: "Windshield Wipers",
    category: "Exterior",
    price: 24.99,
    image: "/placeholder.svg",
  },
  {
    id: 4,
    name: "Air Filter",
    category: "Filters",
    price: 15.99,
    image: "/placeholder.svg",
  },
  {
    id: 5,
    name: "Spark Plugs",
    category: "Ignition",
    price: 8.99,
    image: "/placeholder.svg",
  },
  {
    id: 6,
    name: "Engine Oil 5W-30",
    category: "Fluids",
    price: 32.99,
    image: "/placeholder.svg",
  },
  {
    id: 7,
    name: "Headlight Bulbs",
    category: "Lighting",
    price: 19.99,
    image: "/placeholder.svg",
  },
  {
    id: 8,
    name: "Transmission Fluid",
    category: "Fluids",
    price: 22.99,
    image: "/placeholder.svg",
  },
]

// Sample customer data
const customers = [
  { id: 1, name: "John Smith", email: "john.smith@example.com", phone: "555-123-4567" },
  { id: 2, name: "Jane Doe", email: "jane.doe@example.com", phone: "555-987-6543" },
  { id: 3, name: "Bob Johnson", email: "bob.johnson@example.com", phone: "555-456-7890" },
]

// Sample categories
const categories = ["All", "Filters", "Brakes", "Exterior", "Ignition", "Fluids", "Lighting"]

type CartItem = {
  id: number
  name: string
  price: number
  quantity: number
  image: string
}

export default function POSPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)
  const [discountPercent, setDiscountPercent] = useState(0)
  const [taxPercent, setTaxPercent] = useState(8.25) // Default tax rate
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [isCompletingSale, setIsCompletingSale] = useState(false)

  // Filter products based on search term and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Add product to cart
  const addToCart = (product: (typeof products)[0]) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)

      if (existingItem) {
        return prevCart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      } else {
        return [...prevCart, { ...product, quantity: 1 }]
      }
    })
  }

  // Update cart item quantity
  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }

    setCart((prevCart) => prevCart.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  // Remove item from cart
  const removeFromCart = (id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
  }

  // Calculate subtotal
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Calculate discount amount
  const discountAmount = (subtotal * discountPercent) / 100

  // Calculate tax amount
  const taxableAmount = subtotal - discountAmount
  const taxAmount = (taxableAmount * taxPercent) / 100

  // Calculate total
  const total = taxableAmount + taxAmount

  // Handle complete sale
  const handleCompleteSale = () => {
    setIsCompletingSale(true)

    // Simulate processing payment
    setTimeout(() => {
      // Reset cart and state after successful sale
      setCart([])
      setSelectedCustomer(null)
      setDiscountPercent(0)
      setIsCompletingSale(false)
    }, 1500)
  }

  // Handle cancel sale
  const handleCancelSale = () => {
    if (cart.length === 0) return

    if (confirm("Are you sure you want to cancel this sale?")) {
      setCart([])
      setSelectedCustomer(null)
      setDiscountPercent(0)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Point of Sale</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Product Selection Section */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Products</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative w-full max-w-[240px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <CardDescription>Select products to add to the current sale.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="All" className="w-full">
                <TabsList className="mb-4 flex h-auto flex-wrap justify-start gap-2">
                  {categories.map((category) => (
                    <TabsTrigger
                      key={category}
                      value={category}
                      onClick={() => setSelectedCategory(category)}
                      className="rounded-md px-3 py-1.5"
                    >
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value={selectedCategory} className="mt-0">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {filteredProducts.map((product) => (
                      <Card
                        key={product.id}
                        className="cursor-pointer overflow-hidden transition-all hover:shadow-md"
                        onClick={() => addToCart(product)}
                      >
                        <div className="aspect-square w-full overflow-hidden">
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            width={200}
                            height={200}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <CardContent className="p-3">
                          <h3 className="font-medium line-clamp-1">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                          <p className="mt-1 font-semibold">${product.price.toFixed(2)}</p>
                        </CardContent>
                      </Card>
                    ))}

                    {filteredProducts.length === 0 && (
                      <div className="col-span-full flex h-40 items-center justify-center text-muted-foreground">
                        No products found.
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Cart Section */}
        <div className="flex flex-col gap-4">
          <Card className="flex flex-1 flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Current Sale</CardTitle>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm">
                      Select Customer
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Select Customer</SheetTitle>
                      <SheetDescription>Choose a customer for this sale or add a new one.</SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-4">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search customers..." className="pl-8" />
                      </div>
                      <div className="space-y-2">
                        {customers.map((customer) => (
                          <Card
                            key={customer.id}
                            className="cursor-pointer hover:bg-muted"
                            onClick={() => setSelectedCustomer(customer.name)}
                          >
                            <CardContent className="p-3">
                              <div className="font-medium">{customer.name}</div>
                              <div className="text-sm text-muted-foreground">{customer.email}</div>
                              <div className="text-sm text-muted-foreground">{customer.phone}</div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      <Button className="w-full">Add New Customer</Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
              <CardDescription>
                {selectedCustomer ? `Customer: ${selectedCustomer}` : "No customer selected"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              {cart.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                  <ShoppingCart className="h-10 w-10 opacity-50" />
                  <p>Your cart is empty</p>
                  <p className="text-sm">Add products to begin a sale</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-md">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                          <span className="sr-only">Decrease</span>
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                          <span className="sr-only">Increase</span>
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <Separator />
            <CardContent className="pt-4">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                      className="h-7 w-16 text-right"
                    />
                    <span>%</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax ({taxPercent}%)</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <div className="w-full">
                <Label htmlFor="payment-method" className="mb-1 block">
                  Payment Method
                </Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="payment-method">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="credit">Credit Card</SelectItem>
                    <SelectItem value="debit">Debit Card</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-full gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCancelSale}
                  disabled={cart.length === 0 || isCompletingSale}
                >
                  Cancel Sale
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="flex-1" disabled={cart.length === 0 || isCompletingSale}>
                      {isCompletingSale ? "Processing..." : "Complete Sale"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Complete Sale</DialogTitle>
                      <DialogDescription>Review the sale details before completing.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="rounded-md border p-4">
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="font-medium">Subtotal:</span>
                            <span>${subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Discount ({discountPercent}%):</span>
                            <span>-${discountAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Tax ({taxPercent}%):</span>
                            <span>${taxAmount.toFixed(2)}</span>
                          </div>
                          <Separator className="my-2" />
                          <div className="flex justify-between text-lg font-semibold">
                            <span>Total:</span>
                            <span>${total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">Payment Method:</p>
                        <p className="capitalize">{paymentMethod}</p>
                      </div>
                      {selectedCustomer && (
                        <div>
                          <p className="font-medium">Customer:</p>
                          <p>{selectedCustomer}</p>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" type="button">
                        Print Receipt
                      </Button>
                      <Button type="button" onClick={handleCompleteSale}>
                        Confirm Payment
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
