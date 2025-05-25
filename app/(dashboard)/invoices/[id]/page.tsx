"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useInvoices } from "@/hooks/use-invoices"
import type { Invoice } from "@/types/firestore"
import { Loader2, Printer, ArrowLeft, Check, Download, Send } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import type { Timestamp } from "firebase/firestore"
import { jsPDF } from "jspdf"
import "jspdf-autotable"

export default function InvoiceDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { getInvoice, updateInvoice, formatTimestampToDate } = useInvoices()
  const { toast } = useToast()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  console.log(loading, "Loading state for invoice detail page")
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  // Fetch invoice data
useEffect(() => {
  if (!id) return;

  const fetchInvoice = async () => {
    setLoading(true);
    try {
      const data = await getInvoice(id);
      if (data) setInvoice(data);
      else setError("Invoice not found");
    } catch {
      setError("Failed to load invoice details");
    } finally {
      setLoading(false);
    }
  };

  fetchInvoice();
}, [id, getInvoice]);


  // Helper function to format date
  const formatDate = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return ""
    return format(formatTimestampToDate(timestamp), "PPP")
  }

  // Handle print invoice
  const handlePrint = () => {
  if (!printRef.current) return

  const printContents = printRef.current.innerHTML
  const newWindow = window.open("", "_blank", "width=800,height=600")
  if (!newWindow) return

  newWindow.document.write(`
    <html>
      <head>
        <title>Invoice #${invoice?.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .invoice { max-width: 800px; margin: 0 auto; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
          th { border-top: 1px solid #ddd; }
          .header { text-align: center; margin-bottom: 20px; }
          .footer { margin-top: 30px; text-align: center; font-size: 14px; }
          .totals { margin-top: 20px; }
          .total-row { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="invoice">${printContents}</div>
      </body>
    </html>
  `)
  newWindow.document.close()
  newWindow.focus()

  newWindow.print()
  newWindow.close()
}


  

  // Handle mark as paid
  const handleMarkAsPaid = async () => {
    if (!invoice) return

    try {
      setUpdating(true)
      await updateInvoice(invoice.id, {
        status: "paid",
        paymentStatus: "paid",
      })

      setInvoice({
        ...invoice,
        status: "paid",
        paymentStatus: "paid",
      })

      toast({
        title: "Invoice Updated",
        description: "Invoice has been marked as paid.",
      })
    } catch (error) {
      console.error("Error updating invoice:", error)
      toast({
        title: "Error",
        description: "Failed to update invoice status.",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          <h2 className="text-lg font-semibold">Error</h2>
          <p>{error || "Invoice not found"}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/invoices")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Invoices
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
          <h1 className="text-3xl font-bold">Invoice #{invoice.invoiceNumber}</h1>
          <p className="text-muted-foreground">
            Created on {formatDate(invoice.date)} • Due on {formatDate(invoice.dueDate)}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          {/* <Button variant="outline">
            <Send className="mr-2 h-4 w-4" />
            Email Invoice
          </Button> */}
          {invoice.paymentStatus !== "paid" && (
            <Button onClick={handleMarkAsPaid} disabled={updating}>
              {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
              Mark as Paid
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={printRef}>
                <div className="flex flex-col md:flex-row justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold">INVOICE</h2>
                    <p className="text-muted-foreground">#{invoice.invoiceNumber}</p>
                  </div>
                  <div className="text-right mt-4 md:mt-0">
                    <p>
                      <strong>Date:</strong> {formatDate(invoice.date)}
                    </p>
                    <p>
                      <strong>Due Date:</strong> {formatDate(invoice.dueDate)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="font-semibold mb-2">From</h3>
                    <p>City Autos</p>
                    <p>Near Iqra Academy</p>
                    <p>Hattian Bala, AJK</p>
                    <p>Phone: 0342-2520306</p>
                    <p></p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Bill To</h3>
                    <p>{invoice.customer.name}</p>
                    <p>{invoice.customer.email}</p>
                    <p>{invoice.customer.phone}</p>
                  </div>
                </div>

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
                      {invoice.items.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-3">{item.name}</td>
                          <td className="text-right py-3">Rs.{item.price}</td>
                          <td className="text-right py-3">{item.quantity}</td>
                          <td className="text-right py-3">Rs.{item.subtotal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 ml-auto w-64">
                  <div className="flex justify-between py-1">
                    <span>Subtotal</span>
                    <span>Rs.{invoice.subtotal}</span>
                  </div>
                  {invoice.discount > 0 && (
                    <div className="flex justify-between py-1 text-muted-foreground">
                      <span>Discount</span>
                      <span>-Rs.{invoice.discount}</span>
                    </div>
                  )}
                  {invoice.tax > 0 && (
                    <div className="flex justify-between py-1 text-muted-foreground">
                      <span>Tax</span>
                      <span>Rs.{invoice.tax}</span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between py-1 font-bold">
                    <span>Total</span>
                    <span>Rs.{invoice.total}</span>
                  </div>
                </div>

                {invoice.notes && (
                  <div className="mt-8">
                    <h3 className="font-semibold mb-2">Notes</h3>
                    <p className="text-sm">{invoice.notes}</p>
                  </div>
                )}

                <div className="mt-8 text-center text-sm text-muted-foreground">
                  <p>Thank you for your business!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Invoice Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Status</h3>
                <Badge
                  variant={
                    invoice.status === "paid" ? "default" : invoice.status === "overdue" ? "destructive" : "outline"
                  }
                >
                  {invoice.status === "paid" ? <Check className="mr-1 h-3 w-3" /> : null}
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </Badge>
              </div>

              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Payment Status</h3>
                <Badge
                  variant={
                    invoice.paymentStatus === "paid"
                      ? "default"
                      : invoice.paymentStatus === "overdue"
                        ? "destructive"
                        : "outline"
                  }
                >
                  {invoice.paymentStatus === "paid" ? <Check className="mr-1 h-3 w-3" /> : null}
                  {invoice.paymentStatus.charAt(0).toUpperCase() + invoice.paymentStatus.slice(1)}
                </Badge>
              </div>

              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Invoice Number</h3>
                <p>{invoice.invoiceNumber}</p>
              </div>

              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Date</h3>
                <p>{formatDate(invoice.date)}</p>
              </div>

              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Due Date</h3>
                <p>{formatDate(invoice.dueDate)}</p>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Customer</h3>
                <p className="font-medium">{invoice.customer.name}</p>
                <p className="text-sm text-muted-foreground">{invoice.customer.email}</p>
                <p className="text-sm text-muted-foreground">{invoice.customer.phone}</p>
              </div>

              {invoice.notes && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Notes</h3>
                    <p className="text-sm">{invoice.notes}</p>
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
