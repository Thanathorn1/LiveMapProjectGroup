"use client"

import { useEffect } from "react"
import { migratePinDatesToLocal } from "@/lib/pins"

export function PinDateMigrator() {
  useEffect(() => {
    // Run migration on client-side mount
    migratePinDatesToLocal()
  }, [])

  return null // This component doesn't render anything
}
