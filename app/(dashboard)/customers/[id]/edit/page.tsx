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
import { useToast } from "@/components/ui/use-toast"
import { useCustomers } from "@/hooks/use-customers"
import type { Customer, Vehicle } from "@/types/firestore"
import { Loader2, ArrowLeft, Save, Trash2, Plus, X } from "lucide-react"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

export default function EditCustomerPage() {
  const { id } = useParams()
  const router = useRouter()
  const { getCustomer, updateCustomer, deleteCustomer } = useCustomers()
  const { toast } = useToast()

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [zipCode, setZipCode] = useState("")
  const [country, setCountry] = useState("")
  const [notes, setNotes] = useState("")
  const [status, setStatus] = useState<"active" | "inactive" | "blocked">("active")
  const [vehicles, setVehicles] = useState<Vehicle[]>([])

  // Vehicle form state
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false)
  const [editingVehicleIndex, setEditingVehicleIndex] = useState<number | null>(null)
  const [vehicleMake, setVehicleMake] = useState("")
  const [vehicleModel, setVehicleModel] = useState("")
  const [vehicleYear, setVehicleYear] = useState("")
  const [vehicleLicensePlate, setVehicleLicensePlate] = useState("")
  const [vehicleVin, setVehicleVin] = useState("")
  const [vehicleColor, setVehicleColor] = useState("")
  const [vehicleNotes, setVehicleNotes] = useState("")

  // Fetch customer data
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true)
        const customerData = await getCustomer(id as string)
        if (customerData) {
          setCustomer(customerData)
          // Initialize form state
          setName(customerData.name || "")
          setEmail(customerData.email || "")
          setPhone(customerData.phone || "")
          setAddress(customerData.address || "")
          setCity(customerData.city || "")
          setState(customerData.state || "")
          setZipCode(customerData.zipCode || "")
          setCountry(customerData.country || "")
          setNotes(customerData.notes || "")
          setStatus(customerData.status || "active")
          setVehicles(customerData.vehicles || [])
        } else {
          setError("Customer not found")
        }
      } catch (err) {
        console.error("Error fetching customer:", err)
        setError("Failed to load customer details")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchCustomer()
    }
  }, [id, getCustomer])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !email || !phone) {
      toast({
        title: "Validation Error",
        description: "Name, email, and phone are required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)

      // Prepare customer data
      const customerData: Partial<Customer> = {
        name,
        email,
        phone,
        address: address || undefined,
        city: city || undefined,
        state: state || undefined,
        zipCode: zipCode || undefined,
        country: country || undefined,
        notes: notes || undefined,
        status,
        vehicles: vehicles.length > 0 ? vehicles : undefined,
      }

      // Update customer
      await updateCustomer(id as string, customerData)

      toast({
        title: "Customer Updated",
        description: "Customer has been updated successfully",
      })

      // Navigate back to customer details
      router.push(`/customers/${id}`)
    } catch (err) {
      console.error("Error updating customer:", err)
      toast({
        title: "Error",
        description: "Failed to update customer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Handle customer deletion
  const handleDelete = async () => {
    try {
      setDeleting(true)
      await deleteCustomer(id as string)

      toast({
        title: "Customer Deleted",
        description: "Customer has been deleted successfully",
      })

      // Navigate back to customers list
      router.push("/customers")
    } catch (err) {
      console.error("Error deleting customer:", err)
      toast({
        title: "Error",
        description: "Failed to delete customer. Please try again.",
        variant: "destructive",
      })
      setDeleting(false)
    }
  }

  // Reset vehicle form
  const resetVehicleForm = () => {
    setVehicleMake("")
    setVehicleModel("")
    setVehicleYear("")
    setVehicleLicensePlate("")
    setVehicleVin("")
    setVehicleColor("")
    setVehicleNotes("")
    setEditingVehicleIndex(null)
  }

  // Open vehicle dialog for adding
  const openAddVehicleDialog = () => {
    resetVehicleForm()
    setVehicleDialogOpen(true)
  }

  // Open vehicle dialog for editing
  const openEditVehicleDialog = (index: number) => {
    const vehicle = vehicles[index]
    setVehicleMake(vehicle.make || "")
    setVehicleModel(vehicle.model || "")
    setVehicleYear(vehicle.year?.toString() || "")
    setVehicleLicensePlate(vehicle.licensePlate || "")
    setVehicleVin(vehicle.vin || "")
    setVehicleColor(vehicle.color || "")
    setVehicleNotes(vehicle.notes || "")
    setEditingVehicleIndex(index)
    setVehicleDialogOpen(true)
  }

  // Handle save vehicle
  const handleSaveVehicle = () => {
    if (!vehicleMake || !vehicleModel || !vehicleYear) {
      toast({
        title: "Validation Error",
        description: "Make, model, and year are required for vehicles",
        variant: "destructive",
      })
      return
    }

    const year = Number.parseInt(vehicleYear)
    if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid year",
        variant: "destructive",
      })
      return
    }

    const vehicleData: Vehicle = {
      id: editingVehicleIndex !== null ? vehicles[editingVehicleIndex].id : `vehicle-${Date.now()}`,
      make: vehicleMake,
      model: vehicleModel,
      year,
      licensePlate: vehicleLicensePlate || undefined,
      vin: vehicleVin || undefined,
      color: vehicleColor || undefined,
      notes: vehicleNotes || undefined,
    }

    if (editingVehicleIndex !== null) {
      // Update existing vehicle
      const updatedVehicles = [...vehicles]
      updatedVehicles[editingVehicleIndex] = vehicleData
      setVehicles(updatedVehicles)
    } else {
      // Add new vehicle
      setVehicles([...vehicles, vehicleData])
    }

    resetVehicleForm()
    setVehicleDialogOpen(false)
  }

  // Handle remove vehicle
  const handleRemoveVehicle = (index: number) => {
    const updatedVehicles = [...vehicles]
    updatedVehicles.splice(index, 1)
    setVehicles(updatedVehicles)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          <h2 className="text-lg font-semibold">Error</h2>
          <p>{error || "Customer not found"}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/customers")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Customers
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
          <h1 className="text-3xl font-bold">Edit Customer</h1>
        </div>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Customer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the customer and remove all associated
                  data.
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
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter customer name"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Phone <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter street address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Enter city" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Enter state or province"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                    <Input
                      id="zipCode"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="Enter ZIP or postal code"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Enter country"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Vehicles</CardTitle>
                <Button variant="outline" size="sm" onClick={openAddVehicleDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Vehicle
                </Button>
              </CardHeader>
              <CardContent>
                {vehicles.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No vehicles added yet. Click "Add Vehicle" to add one.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {vehicles.map((vehicle, index) => (
                      <div key={vehicle.id} className="border rounded-md p-4 relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveVehicle(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                          <div>
                            <span className="text-sm font-medium">Make:</span> {vehicle.make}
                          </div>
                          <div>
                            <span className="text-sm font-medium">Model:</span> {vehicle.model}
                          </div>
                          <div>
                            <span className="text-sm font-medium">Year:</span> {vehicle.year}
                          </div>
                          {vehicle.licensePlate && (
                            <div>
                              <span className="text-sm font-medium">License Plate:</span> {vehicle.licensePlate}
                            </div>
                          )}
                          {vehicle.vin && (
                            <div>
                              <span className="text-sm font-medium">VIN:</span> {vehicle.vin}
                            </div>
                          )}
                          {vehicle.color && (
                            <div>
                              <span className="text-sm font-medium">Color:</span> {vehicle.color}
                            </div>
                          )}
                        </div>
                        {vehicle.notes && (
                          <div className="mt-2">
                            <span className="text-sm font-medium">Notes:</span> {vehicle.notes}
                          </div>
                        )}
                        <Button
                          variant="link"
                          size="sm"
                          className="mt-2 h-auto p-0"
                          onClick={() => openEditVehicleDialog(index)}
                        >
                          Edit Vehicle
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="status">Customer Status</Label>
                  <Select
                    value={status}
                    onValueChange={(value) => setStatus(value as "active" | "inactive" | "blocked")}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this customer..."
                  rows={6}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* Vehicle Dialog */}
      <Dialog open={vehicleDialogOpen} onOpenChange={setVehicleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingVehicleIndex !== null ? "Edit Vehicle" : "Add Vehicle"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleMake">
                  Make <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="vehicleMake"
                  value={vehicleMake}
                  onChange={(e) => setVehicleMake(e.target.value)}
                  placeholder="Enter make"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleModel">
                  Model <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="vehicleModel"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  placeholder="Enter model"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleYear">
                  Year <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="vehicleYear"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  value={vehicleYear}
                  onChange={(e) => setVehicleYear(e.target.value)}
                  placeholder="Enter year"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleColor">Color</Label>
                <Input
                  id="vehicleColor"
                  value={vehicleColor}
                  onChange={(e) => setVehicleColor(e.target.value)}
                  placeholder="Enter color"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleLicensePlate">License Plate</Label>
                <Input
                  id="vehicleLicensePlate"
                  value={vehicleLicensePlate}
                  onChange={(e) => setVehicleLicensePlate(e.target.value)}
                  placeholder="Enter license plate"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleVin">VIN</Label>
                <Input
                  id="vehicleVin"
                  value={vehicleVin}
                  onChange={(e) => setVehicleVin(e.target.value)}
                  placeholder="Enter VIN"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleNotes">Notes</Label>
              <Textarea
                id="vehicleNotes"
                value={vehicleNotes}
                onChange={(e) => setVehicleNotes(e.target.value)}
                placeholder="Add notes about this vehicle..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVehicleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveVehicle}>
              {editingVehicleIndex !== null ? "Update Vehicle" : "Add Vehicle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
