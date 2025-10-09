"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { th } from "date-fns/locale"
import { format, isValid } from "date-fns"
import { useRouter } from "next/navigation"
import { getLocalDateString } from "@/lib/utils"

interface CalendarDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDateSelect?: (date: string) => void
}

const toBuddhistYear = (date: Date): number => {
  return date.getFullYear() + 543
}

const fromBuddhistYear = (buddhistYear: number): number => {
  return buddhistYear - 543
}

export function CalendarDialog({ open, onOpenChange, onDateSelect }: CalendarDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [dateInput, setDateInput] = useState("")
  const router = useRouter()

  const handleDateInputChange = (value: string) => {
    setDateInput(value)

    // Try to parse the date when user types DD/MM/YYYY (Buddhist Era)
    if (value.length === 10) {
      try {
        const parts = value.split("/")
        if (parts.length === 3) {
          const day = Number.parseInt(parts[0])
          const month = Number.parseInt(parts[1])
          const buddhistYear = Number.parseInt(parts[2])
          const christianYear = fromBuddhistYear(buddhistYear)

          const parsedDate = new Date(christianYear, month - 1, day)
          if (isValid(parsedDate)) {
            setSelectedDate(parsedDate)
          }
        }
      } catch (e) {
        // Invalid date format, ignore
      }
    }
  }

  useEffect(() => {
    if (selectedDate) {
      const day = selectedDate.getDate().toString().padStart(2, "0")
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0")
      const buddhistYear = toBuddhistYear(selectedDate)
      setDateInput(`${day}/${month}/${buddhistYear}`)
    }
  }, [selectedDate])

  const handleConfirm = () => {
    if (selectedDate) {
      const dateString = getLocalDateString(selectedDate)

      // Call the callback to update map date
      if (onDateSelect) {
        onDateSelect(dateString)
      }

      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-w-[95vw] p-4">
        <DialogHeader className="flex flex-row items-center justify-between pb-2">
          <DialogTitle className="text-base font-bold">เลือกวันที่</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="31/12/XXXX"
              value={dateInput}
              onChange={(e) => handleDateInputChange(e.target.value)}
              className="flex-1 text-center font-medium"
              maxLength={10}
            />
          </div>

          {/* Calendar */}
          <div className="w-full">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date > new Date() || date < new Date("2024-01-01")}
              locale={th}
              className="w-full"
            />
          </div>

          {selectedDate && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">วันที่เลือก</p>
              <p className="text-sm font-semibold">
                {format(selectedDate, "d MMMM", { locale: th })} {toBuddhistYear(selectedDate)}
              </p>
            </div>
          )}

          <div className="flex gap-2 w-full">
            <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => onOpenChange(false)}>
              ยกเลิก
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={handleConfirm}
              disabled={!selectedDate}
            >
              ตกลง
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
