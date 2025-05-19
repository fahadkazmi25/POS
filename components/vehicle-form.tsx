"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { Vehicle } from "@/types/firestore"

// Form validation schema
const vehicleFormSchema = z.object({
  make: z.string().min(1, { message: "Make is required." }),
  model: z.string().min(1, { message: "Model is required." }),
  year: z.coerce
    .number()
    .int()
    .min(1900, { message: "Year must be 1900 or later." })
    .max(new Date().getFullYear() + 1, { message: "Year cannot be in the future." }),
  vin: z.string().min(1, { message: "VIN is required." }),
  licensePlate: z.string().min(1, { message: "License plate is required." }),
})

type VehicleFormValues = z.infer<typeof vehicleFormSchema>

interface VehicleFormProps {
  vehicle?: Vehicle
  onSubmit: (data: Omit<Vehicle, "id">) => Promise<void>
  onCancel: () => void
}

export function VehicleForm({ vehicle, onSubmit, onCancel }: VehicleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Default form values
  const defaultValues: Partial<VehicleFormValues> = {
    make: vehicle?.make || "",
    model: vehicle?.model || "",
    year: vehicle?.year || new Date().getFullYear(),
    vin: vehicle?.vin || "",
    licensePlate: vehicle?.licensePlate || "",
  }

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues,
  })

  async function handleSubmit(data: VehicleFormValues) {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } catch (error) {
      console.error("Error submitting vehicle form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="make"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Make *</FormLabel>
                <FormControl>
                  <Input placeholder="Toyota" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model *</FormLabel>
                <FormControl>
                  <Input placeholder="Camry" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year *</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="2023" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vin"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>VIN *</FormLabel>
                <FormControl>
                  <Input placeholder="1HGCM82633A123456" {...field} />
                </FormControl>
                <FormDescription>Vehicle Identification Number</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="licensePlate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>License Plate *</FormLabel>
              <FormControl>
                <Input placeholder="ABC-1234" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Saving..." : "Save Vehicle"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
