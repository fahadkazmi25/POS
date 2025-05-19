"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Car, Edit, Mail, Phone, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { useCustomers } from "@/hooks/use-customers"
import type { Customer, Vehicle } from "@/types/firestore"
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
// import { VehicleForm } from "@/components/vehicle-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function CustomerDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id: customerId } = params
  const { customers, loading, error, deleteCustomer, addVehicleToCustomer, deleteVehicle } = useCustomers()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAddingVehicle, setIsAddingVehicle] = useState(false)
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  // Find the customer in the customers array
  useEffect(() => {
    if (!loading && customers.length > 0) {
      const foundCustomer = customers.find((c) => c.id === customerId)
      if (foundCustomer) {
        setCustomer(foundCustomer)
      }
    }
  }, [customerId, customers, loading])

  // Handle customer deletion
  const handleDeleteCustomer = async () => {
    if (!customer) return

    setIsDeleting(true)
    try {
      await deleteCustomer(customerId)
      toast({
        title: "Customer Deleted",
        description: "The customer has been successfully deleted.",
      })
      router.push("/customers")
    } catch (error) {
      console.error("Error deleting customer:", error)
      toast({
        title: "Error",
        description: "There was an error deleting the customer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle vehicle deletion
  const handleDeleteVehicle = async () => {
    if (!customer || !vehicleToDelete) return

    try {
      await deleteVehicle(customerId, vehicleToDelete)
      toast({
        title: "Vehicle Deleted",
        description: "The vehicle has been successfully deleted.",
      })
      setVehicleToDelete(null)
    } catch (error) {
      console.error("Error deleting vehicle:", error)
      toast({
        title: "Error",
        description: "There was an error deleting the vehicle. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle adding a new vehicle
  const handleAddVehicle = async (vehicle: Omit<Vehicle, "id">) => {
    try {
      await addVehicleToCustomer(customerId, vehicle)
      setIsAddingVehicle(false)
      toast({
        title: "Vehicle Added",
        description: "The vehicle has been successfully added.",
      })
    } catch (error) {
      console.error("Error adding vehicle:", error)
      toast({
        title: "Error",
        description: "There was an error adding the vehicle. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Format date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A"

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-6 w-20" />
        </div>

        <div className="grid gap-4 md:grid-cols-7">
          <div className="md:col-span-2 flex flex-col gap-4">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-5">
            <Skeleton className="h-[500px] w-full" />
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !customer) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/customers">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Customer Not Found</h2>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center text-center">
              <h3 className="text-lg font-semibold text-destructive">
                {error || "Customer not found or has been deleted."}
              </h3>
              <Button className="mt-4" asChild>
                <Link href="/customers">Return to Customers</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
        <div className="ml-auto flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/customers/${customerId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the customer and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteCustomer} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
              {customer.address && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">{customer.address}</p>
                  </div>
                </>
              )}
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Customer Since</p>
                  <p className="text-sm text-muted-foreground">{formatDate(customer.joinDate)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Last Purchase</p>
                  <p className="text-sm text-muted-foreground">
                    {customer.lastPurchase ? formatDate(customer.lastPurchase) : "Never"}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Total Purchases</p>
                  <p className="text-sm font-semibold">${customer.totalPurchases?.toFixed(2) || "0.00"}</p>
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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Vehicles</CardTitle>
                <CardDescription>Registered vehicles for this customer</CardDescription>
              </div>
              <Dialog open={isAddingVehicle} onOpenChange={setIsAddingVehicle}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Vehicle
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Vehicle</DialogTitle>
                    <DialogDescription>Enter the vehicle details below.</DialogDescription>
                  </DialogHeader>
                  {/* <VehicleForm onSubmit={handleAddVehicle} onCancel={() => setIsAddingVehicle(false)} /> */}
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
              {customer.vehicles && customer.vehicles.length > 0 ? (
                customer.vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => setVehicleToDelete(vehicle.id)}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                            <span className="sr-only">Delete Vehicle</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Vehicle</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this vehicle? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setVehicleToDelete(null)}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteVehicle}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div>VIN: {vehicle.vin}</div>
                      <div>License: {vehicle.licensePlate}</div>
                    </div>
                    {customer?.vehicles.indexOf(vehicle) < customer?.vehicles.length - 1 && (
                      <Separator className="my-2" />
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Car className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No vehicles registered</p>
                  <p className="text-xs text-muted-foreground">Click the Add Vehicle button to register a vehicle</p>
                </div>
              )}
            </CardContent>
          </Card>

          {customer.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{customer.notes}</p>
              </CardContent>
            </Card>
          )}
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
                  <div className="rounded-md border">
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
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <p className="text-sm text-muted-foreground">No purchase history found</p>
                              <Button className="mt-4" size="sm" asChild>
                                <Link href={`/pos?customer=${customerId}`}>Create New Sale</Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
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
                  <div className="rounded-md border">
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
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <p className="text-sm text-muted-foreground">No invoices found</p>
                              <Button className="mt-4" size="sm" asChild>
                                <Link href={`/invoices/new?customer=${customerId}`}>Create New Invoice</Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
