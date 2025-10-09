"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { ProtectedRoute } from "@/components/protected-route"
import { AppHeader } from "@/components/app-header"
import { AddPinDialog } from "@/components/add-pin-dialog"
import { PinDetailSheet } from "@/components/pin-detail-sheet"
import { CalendarDialog } from "@/components/calendar-dialog"
import { PlaceCategoriesDialog } from "@/components/place-categories-dialog"
import { FloatingActionMenu } from "@/components/floating-action-menu"
import { Button } from "@/components/ui/button"
import { getPinsByDate, checkAndResetDaily, type Pin, type PinCategory } from "@/lib/pins"
import { getLocalDateString } from "@/lib/utils"

// Dynamically import MapView to avoid SSR issues with Leaflet
const MapView = dynamic(() => import("@/components/map-view").then((mod) => ({ default: mod.MapView })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-muted">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">กำลังโหลดแผนที่...</p>
      </div>
    </div>
  ),
})

function MapContent() {
  const [pins, setPins] = useState<Pin[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newPinLocation, setNewPinLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString())
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null)
  const [showPinDetail, setShowPinDetail] = useState(false)
  const [welcomeDismissed, setWelcomeDismissed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("welcomeDismissed") === "true"
    }
    return false
  })
  const [showCalendar, setShowCalendar] = useState(false)
  const [showPlaceCategories, setShowPlaceCategories] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<PinCategory | null>(null)

  useEffect(() => {
    checkAndResetDaily()
  }, [])

  useEffect(() => {
    loadPins()
  }, [selectedDate])

  const loadPins = () => {
    const datePins = getPinsByDate(selectedDate)
    setPins(datePins)
  }

  const handleMapClick = (lat: number, lng: number) => {
    setNewPinLocation({ lat, lng })
    setShowAddDialog(true)
  }

  const handlePinAdded = () => {
    loadPins()
  }

  const handlePinClick = (pin: Pin) => {
    setSelectedPinId(pin.id)
    setShowPinDetail(true)
  }

  const handleCommentAdded = () => {
    loadPins()
  }

  const handlePinUpdated = () => {
    loadPins()
  }

  const handlePinDeleted = () => {
    loadPins()
    setShowPinDetail(false)
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
  }

  const handleCategorySelect = (category: PinCategory | null) => {
    setSelectedCategory(category)
  }

  const isToday = selectedDate === getLocalDateString()
  const showWelcome = pins.length === 0 && isToday && !welcomeDismissed

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />

      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <MapView
            pins={pins}
            onMapClick={handleMapClick}
            onPinClick={handlePinClick}
            selectedCategory={selectedCategory}
          />
        </div>

        {!showPinDetail && (
          <FloatingActionMenu
            onShowCalendar={() => setShowCalendar(true)}
            onShowPlaceCategories={() => setShowPlaceCategories(true)}
          />
        )}

        {showWelcome && (
          <div className="absolute inset-0 z-[1001] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-background rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <h3 className="text-xl font-bold mb-2">ยินดีต้อนรับ!</h3>
              <p className="text-muted-foreground mb-4">คลิกที่แผนที่หรือกดปุ่ม + เพื่อเพิ่มหมุดแรกของคุณ</p>
              <Button
                onClick={() => {
                  localStorage.setItem("welcomeDismissed", "true")
                  setWelcomeDismissed(true)
                }}
                className="w-full"
              >
                เข้าใจแล้ว
              </Button>
            </div>
          </div>
        )}
      </div>

      {newPinLocation && (
        <AddPinDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          lat={newPinLocation.lat}
          lng={newPinLocation.lng}
          selectedDate={selectedDate}
          onPinAdded={handlePinAdded}
        />
      )}

      <PinDetailSheet
        pinId={selectedPinId}
        open={showPinDetail}
        onOpenChange={setShowPinDetail}
        onCommentAdded={handleCommentAdded}
        onPinUpdated={handlePinUpdated}
        onPinDeleted={handlePinDeleted}
      />

      <CalendarDialog open={showCalendar} onOpenChange={setShowCalendar} onDateSelect={handleDateSelect} />

      <PlaceCategoriesDialog
        open={showPlaceCategories}
        onOpenChange={setShowPlaceCategories}
        onCategorySelect={handleCategorySelect}
      />
    </div>
  )
}

export default function MapPage() {
  return (
    <ProtectedRoute>
      <MapContent />
    </ProtectedRoute>
  )
}
