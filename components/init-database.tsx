"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { initializeFirestore } from "@/firebase/init-data"
import { useToast } from "@/components/ui/use-toast"

export function InitDatabase() {
  const [isInitializing, setIsInitializing] = useState(false)
  const { toast } = useToast()

  const handleInitialize = async () => {
    setIsInitializing(true)
    try {
      const result = await initializeFirestore()

      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })
    } catch (error) {
      console.error("Error initializing database:", error)
      toast({
        title: "Error",
        description: "Failed to initialize database. See console for details.",
        variant: "destructive",
      })
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <Button onClick={handleInitialize} disabled={isInitializing}>
      {isInitializing ? "Initializing..." : "Initialize Database"}
    </Button>
  )
}
