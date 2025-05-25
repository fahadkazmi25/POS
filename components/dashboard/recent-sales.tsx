"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { subscribeToCollection, type FirestoreData } from "@/firebase/firestore"
import type { Sale } from "@/types/firestore"
import { formatDistanceToNow } from "date-fns"

export function RecentSales() {
  const [recentSales, setRecentSales] = useState<FirestoreData<Sale>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = subscribeToCollection<Sale>(
      "sales",
      (data) => {
        setRecentSales(data.slice(0, 5))
        setLoading(false)
      },
      undefined,
      "date",
      "desc",
      5,
    )

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="space-y-8">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="flex items-center">
            <div className="h-9 w-9 rounded-full bg-muted"></div>
            <div className="ml-4 space-y-1">
              <div className="h-4 w-32 rounded bg-muted"></div>
              <div className="h-3 w-24 rounded bg-muted"></div>
            </div>
            <div className="ml-auto h-4 w-16 rounded bg-muted"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {recentSales.map((sale) => (
        <div key={sale.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/placeholder-user.jpg" alt="Avatar" />
            <AvatarFallback>
              {sale.customer?.name ? sale.customer.name.substring(0, 2).toUpperCase() : "GU"}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{sale.customer?.name || "Guest Customer"}</p>
            <p className="text-sm text-muted-foreground">
              {sale.date ? formatDistanceToNow(sale.date.toDate(), { addSuffix: true }) : "Recently"}
            </p>
          </div>
          <div className="ml-auto font-medium">+Rs.{sale.total.toFixed(2)}</div>
        </div>
      ))}

      {recentSales.length === 0 && <div className="text-center text-muted-foreground py-4">No recent sales found</div>}
    </div>
  )
}
