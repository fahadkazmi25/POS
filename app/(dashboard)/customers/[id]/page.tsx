"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Car, Edit, FileText, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function CustomerDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const customerId = params.id

  // This would normally be fetched from an API
  const customer = {
    id: Number.parseInt(customerId),
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "555-123-4567",
    address: "123 Main St, Anytown, CA 12345",
    totalPurchases: 1245.67,
    lastPurchase: "2023-05-15",
    status: "active",
    outstandingBalance: 0,
    joinDate: "2022-03-10",
    vehicles: [
      {
        id: 1,
        make: "Toyota",
        model: "Camry",
        year: 2018,
        vin: "1HGCM82633A123456",
        licensePlate: "ABC-1234",
      },
      {
        id: 2,
        make: "Honda",
        model: "Civic",
        year: 2020,
        vin: "2HGFC2F52LH123456",
        licensePlate: "XYZ-7890",
      },
    ],
    purchaseHistory: [
      {
        id: "INV-001",
        date: "2023-05-15",
        amount: 149.99,
        status: "paid",
        items: ["Oil Change", "Air Filter", "Wiper Blades"],
      },
      {
        id: "INV-002",
        date: "2023-04-02",
        amount: 567.8,
        status: "paid",
        items: ["Brake Pads", "Rotors", "Labor"],
      },
      {
        id: "INV-003",
        date: "2023-02-18",
        amount: 89.99,
        status: "paid",
        items: ["Oil Change", "Tire Rotation"],
      },
      {
        id: "INV-004",
        date: "2022-12-05",
        amount: 437.89,
        status: "paid",
        items: ["Battery Replacement", "Alternator Check", "Labor"],
      },
    ],
    notes: "Prefers appointments on weekends. Always asks for synthetic oil.",
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/customers">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">{customer.name}</h2>
        <Badge variant={customer.status === "active" ? "default" : "secondary"}>
          {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
        </Badge>
        <div className="ml-auto">
          <Button asChild>
            <Link href={`/customers/${customerId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Customer
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <div className="md:col-span-2 flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${customer.email}`} className="text-sm hover:underline">
                  {customer.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${customer.phone}`} className="text-sm hover:underline">
                  {customer.phone}
                </a>
              </div>
              <Separator />
              <div className="space-y-1">
                <p className="text-sm font-medium">Address</p>
                <p className="text-sm text-muted-foreground">{customer.address}</p>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Customer Since</p>
                  <p className="text-sm text-muted-foreground">{formatDate(customer.joinDate)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Last Purchase</p>
                  <p className="text-sm text-muted-foreground">{formatDate(customer.lastPurchase)}</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Total Purchases</p>
                  <p className="text-sm font-semibold">${customer.totalPurchases.toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Outstanding Balance</p>
                  {customer.outstandingBalance > 0 ? (
                    <p className="text-sm font-semibold text-destructive">${customer.outstandingBalance.toFixed(2)}</p>
                  ) : (
                    <p className="text-sm font-semibold text-muted-foreground">$0.00</p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/pos?customer=${customerId}`}>New Sale</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vehicles</CardTitle>
              <CardDescription>Registered vehicles for this customer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {customer.vehicles.map((vehicle) => (
                <div key={vehicle.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div>VIN: {vehicle.vin}</div>
                    <div>License: {vehicle.licensePlate}</div>
                  </div>
                  {customer.vehicles.indexOf(vehicle) < customer.vehicles.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                Add Vehicle
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{customer.notes}</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                Edit Notes
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="md:col-span-5">
          <Tabs defaultValue="purchases" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="purchases">Purchase History</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
            </TabsList>
            <TabsContent value="purchases" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Purchase History</CardTitle>
                  <CardDescription>View all purchases made by this customer</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customer.purchaseHistory.map((purchase) => (
                        <TableRow key={purchase.id}>
                          <TableCell className="font-medium">{purchase.id}</TableCell>
                          <TableCell>{formatDate(purchase.date)}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {purchase.items.map((item, index) => (
                                <Badge key={index} variant="outline">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>${purchase.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={purchase.status === "paid" ? "success" : "warning"}>
                              {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/invoices/${purchase.id}`}>
                                <FileText className="mr-2 h-4 w-4" />
                                View
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="invoices" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Invoices</CardTitle>
                  <CardDescription>View and manage all invoices for this customer</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customer.purchaseHistory.map((purchase) => (
                        <TableRow key={purchase.id}>
                          <TableCell className="font-medium">{purchase.id}</TableCell>
                          <TableCell>{formatDate(purchase.date)}</TableCell>
                          <TableCell>${purchase.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={purchase.status === "paid" ? "success" : "warning"}>
                              {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/invoices/${purchase.id}`}>View</Link>
                              </Button>
                              <Button variant="outline" size="sm">
                                Print
                              </Button>
                              <Button variant="outline" size="sm">
                                Email
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
