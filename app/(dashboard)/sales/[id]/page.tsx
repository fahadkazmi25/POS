"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useSales } from "@/hooks/use-sales"
import { useInvoices } from "@/hooks/use-invoices"
import type { Sale, SaleItem } from "@/types/firestore"
import { Loader2, Printer, FileText, ArrowLeft, Check } from 'lucide-react'
import { format } from "date-fns"
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
import { Timestamp } from "firebase/firestore"

export default function SaleDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { getSale } = useSales()
  const { addInvoice, getInvoicesBySaleId } = useInvoices()
  const { toast } = useToast()
  const [sale, setSale] = useState<Sale | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generatingInvoice, setGeneratingInvoice] = useState(false)
  const [hasInvoice, setHasInvoice] = useState(false)
  const [invoiceId, setInvoiceId] = useState<string | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  // Fetch sale data
  useEffect(() => {
    const fetchSale = async () => {
      try {
        setLoading(true)
        const saleData = await getSale(id as string)
        if (saleData) {
          setSale(saleData)

          // Check if invoice already exists for this sale
          const invoices = await getInvoicesBySaleId(id as string)
          if (invoices && invoices.length > 0) {
            setHasInvoice(true)
            setInvoiceId(invoices[0].id)
          }
        } else {
          setError("Sale not found")
        }
      } catch (err) {
        console.error("Error fetching sale:", err)
        setError("Failed to load sale details")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchSale()
    }
  }, [id, getSale, getInvoicesBySaleId])

  // Helper function to format date
  const formatDate = (date: Date | Timestamp | string | number) => {
    if (date instanceof Timestamp) {
      return format(date.toDate(), "PPpp")
    }
    return format(new Date(date), "PPpp")
  }

  // Generate invoice from sale
  const handleGenerateInvoice = async () => {
    if (!sale) return

    try {
      setGeneratingInvoice(true)

      // Generate invoice number
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`

      // Calculate tax rate (if tax exists)
      const taxRate = sale.tax && sale.subtotal ? (sale.tax / (sale.subtotal - (sale.discount || 0))) * 100 : 0
      
      // Create invoice data from sale
      const invoiceData = {
        id: "", // This will be assigned by Firestore
        invoiceNumber,
        saleId: sale.id || "",
        date: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Due in 30 days
        customer: sale.customer || { id: "", name: "", email: "" },
        items: sale.items || [],
        subtotal: sale.subtotal || 0,
        discount: sale.discount || 0,
        tax: sale.tax || 0,
        taxRate: taxRate,
        taxAmount: sale.tax || 0,
        total: sale.total || 0,
        notes: sale.notes || null,
        status: "pending", // Default to pending
        paymentStatus: sale.paymentMethod === "cash" ? "paid" : "pending",
      }

      // Add invoice to Firestore
      const newInvoiceId = await addInvoice(invoiceData)

      setHasInvoice(true)
      setInvoiceId(newInvoiceId)

      toast({
        title: "Invoice Generated",
        description: `Invoice #${invoiceNumber} has been generated successfully.`,
      })
    } catch (err) {
      console.error("Error generating invoice:", err)
      toast({
        title: "Error",
        description: "Failed to generate invoice. Please try again.",
        variant: "destructive",
      })
    } finally {
      setGeneratingInvoice(false)
    }
  }

  // Handle print receipt
  const handlePrint = () => {
    if (!printRef.current) return

    const printContents = printRef.current.innerHTML
    const originalContents = document.body.innerHTML

    document.body.innerHTML = `
      <html>
        <head>
          <title>Sale Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .receipt { max-width: 800px; margin: 0 auto; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            th { border-top: 1px solid #ddd; }
            .header { text-align: center; margin-bottom: 20px; }
            .footer { margin-top: 30px; text-align: center; font-size: 14px; }
            .totals { margin-top: 20px; }
            .total-row { font-weight: bold; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            ${printContents}
          </div>
        </body>
      </html>
    `

    window.print()
    document.body.innerHTML = originalContents
  }

  // Navigate to invoice
  const viewInvoice = () => {
    if (invoiceId) {
      router.push(`/invoices/${invoiceId}`)
    }
  }

  // if (loading) {
  //   return (
  //     <div className="flex justify-center items-center h-[70vh]">
  //       <Loader2 className="h-8 w-8 animate-spin text-primary" />
  //     </div>
  //   )
  // }

  if (error || !sale) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          <h2 className="text-lg font-semibold">Error</h2>
          <p>{error || "Sale not found"}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/pos")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to POS
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <Button variant="outline" size="sm" className="mb-2" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Sale Details</h1>
          <p className="text-muted-foreground">
            Sale #{sale.saleNumber} • {formatDate(sale.date)}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Printer className="mr-2 h-4 w-4" />
                Print Receipt
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Print Preview</DialogTitle>
              </DialogHeader>
              <div className="max-h-[70vh] overflow-y-auto p-4 border rounded-md">
                <div ref={printRef}>
                  <div className="header">
                    <h2 className="text-2xl font-bold">RECEIPT</h2>
                    <p>Sale #{sale.saleNumber}</p>
                    <p>{formatDate(sale.date)}</p>
                  </div>

                  {sale.customer && (
                    <div className="customer-info mb-4">
                      <h3 className="font-semibold">Customer Information</h3>
                      <p>{sale.customer.name}</p>
                      <p>{sale.customer.email}</p>
                      {sale.customer.phone && <p>{sale.customer.phone}</p>}
                    </div>
                  )}

                  <table className="w-full">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th className="text-right">Price</th>
                        <th className="text-right">Qty</th>
                        <th className="text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sale.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.productId ? item.productId : item.name}</td>
                          <td className="text-right">${(item.price || 0).toFixed(2)}</td>
                          <td className="text-right">{item.quantity}</td>
                          <td className="text-right">${(item.subtotal || (item.price || 0) * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="totals ml-auto w-64">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${sale.subtotal.toFixed(2)}</span>
                    </div>
                    {sale.discount > 0 && (
                      <div className="flex justify-between">
                        <span>Discount:</span>
                        <span>-${sale.discount.toFixed(2)}</span>
                      </div>
                    )}
                    {sale.tax > 0 && (
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>${sale.tax.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                      <span>Total:</span>
                      <span>${sale.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="payment-info mt-6">
                    <p>
                      <strong>Payment Method:</strong> {sale.paymentMethod}
                    </p>
                    <p>
                      <strong>Status:</strong> {sale.status}
                    </p>
                    {sale.notes && (
                      <p>
                        <strong>Notes:</strong> {sale.notes}
                      </p>
                    )}
                  </div>

                  <div className="footer mt-8">
                    <p>Thank you for your business!</p>
                    <p>For questions or concerns, please contact us.</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handlePrint}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {hasInvoice ? (
            <Button onClick={viewInvoice}>
              <FileText className="mr-2 h-4 w-4" />
              View Invoice
            </Button>
          ) : (
            <Button onClick={handleGenerateInvoice} disabled={generatingInvoice}>
              {generatingInvoice ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Invoice
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Sale Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Item</th>
                      <th className="text-right py-2">Price</th>
                      <th className="text-right py-2">Quantity</th>
                      <th className="text-right py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sale.items.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3">{item.productId ? item.productId : (item as any).name}</td>
                        <td className="text-right py-3">${(item.price || 0).toFixed(2)}</td>
                        <td className="text-right py-3">{item.quantity}</td>
                        <td className="text-right py-3">${(item.subtotal || (item.price || 0) * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 ml-auto w-64">
                <div className="flex justify-between py-1">
                  <span>Subtotal</span>
                  <span>${sale.subtotal.toFixed(2)}</span>
                </div>
                {sale.discount > 0 && (
                  <div className="flex justify-between py-1 text-muted-foreground">
                    <span>Discount</span>
                    <span>-${sale.discount.toFixed(2)}</span>
                  </div>
                )}
                {sale.tax > 0 && (
                  <div className="flex justify-between py-1 text-muted-foreground">
                    <span>Tax</span>
                    <span>${sale.tax.toFixed(2)}</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between py-1 font-bold">
                  <span>Total</span>
                  <span>${sale.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Sale Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Status</h3>
                <Badge variant={sale.status === "completed" ? "default" : "outline"}>
                  {sale.status === "completed" ? <Check className="mr-1 h-3 w-3" /> : null}
                  {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                </Badge>
              </div>

              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Sale Number</h3>
                <p>{sale.saleNumber}</p>
              </div>

              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Date</h3>
                <p>{formatDate(sale.date)}</p>
              </div>

              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Payment Method</h3>
                <p className="capitalize">{sale.paymentMethod}</p>
              </div>

              <Separator />

              {sale.customer && (
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Customer</h3>
                  <p className="font-medium">{sale.customer.name}</p>
                  <p className="text-sm text-muted-foreground">{sale.customer.email}</p>
                  {sale.customer.phone && (
                    <p className="text-sm text-muted-foreground">{sale.customer.phone}</p>
                  )}
                </div>
              )}

              {sale.notes && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Notes</h3>
                    <p className="text-sm">{sale.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}