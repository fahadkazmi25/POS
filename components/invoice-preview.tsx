"use client"

import { Download, Mail, Printer, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type InvoicePreviewProps = {
  invoice: {
    id: string
    customer: string
    date: string
    amount: number
    status: string
    email: string
  }
  onClose: () => void
}

export function InvoicePreview({ invoice, onClose }: InvoicePreviewProps) {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  // Sample invoice items
  const invoiceItems = [
    {
      id: 1,
      description: "Premium Oil Filter",
      quantity: 1,
      unitPrice: 12.99,
      total: 12.99,
    },
    {
      id: 2,
      description: "Synthetic Oil 5W-30",
      quantity: 5,
      unitPrice: 8.99,
      total: 44.95,
    },
    {
      id: 3,
      description: "Air Filter",
      quantity: 1,
      unitPrice: 15.99,
      total: 15.99,
    },
    {
      id: 4,
      description: "Labor - Oil Change",
      quantity: 1,
      unitPrice: 65.0,
      total: 65.0,
    },
  ]

  // Calculate subtotal
  const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0)

  // Calculate tax (8.25%)
  const taxRate = 0.0825
  const taxAmount = subtotal * taxRate

  // Calculate total
  const total = subtotal + taxAmount

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Invoice {invoice.id}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <DialogDescription>Invoice details for {invoice.customer}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex flex-col gap-6 md:flex-row md:justify-between">
            <div>
              <h3 className="text-lg font-semibold">Auto Parts & Service</h3>
              <p className="text-sm text-muted-foreground">123 Main Street</p>
              <p className="text-sm text-muted-foreground">Anytown, CA 12345</p>
              <p className="text-sm text-muted-foreground">Phone: (555) 123-4567</p>
              <p className="text-sm text-muted-foreground">Email: info@autoparts.example</p>
            </div>
            <div className="text-right">
              <h3 className="text-lg font-semibold">Invoice</h3>
              <p className="text-sm text-muted-foreground">Invoice #: {invoice.id}</p>
              <p className="text-sm text-muted-foreground">Date: {formatDate(invoice.date)}</p>
              <p className="text-sm text-muted-foreground">Status: {invoice.status.toUpperCase()}</p>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-6 md:flex-row md:justify-between">
            <div>
              <h3 className="font-semibold">Bill To:</h3>
              <p className="text-sm">{invoice.customer}</p>
              <p className="text-sm text-muted-foreground">123 Customer Street</p>
              <p className="text-sm text-muted-foreground">Anytown, CA 12345</p>
              <p className="text-sm text-muted-foreground">Email: {invoice.email}</p>
            </div>
            <div>
              <h3 className="font-semibold">Vehicle Information:</h3>
              <p className="text-sm">2018 Toyota Camry</p>
              <p className="text-sm text-muted-foreground">VIN: 1HGCM82633A123456</p>
              <p className="text-sm text-muted-foreground">License: ABC-1234</p>
              <p className="text-sm text-muted-foreground">Mileage: 45,678</p>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoiceItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end">
            <div className="w-[200px] space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8.25%):</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <h3 className="font-semibold">Payment Terms:</h3>
            <p>Payment is due within 30 days of invoice date.</p>
            <p>Please make checks payable to Auto Parts & Service.</p>
            <p>For questions regarding this invoice, please contact our accounting department.</p>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Thank you for your business!</p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Close
          </Button>
          <Button variant="outline" className="flex-1">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button className="flex-1">
            <Mail className="mr-2 h-4 w-4" />
            Email Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
