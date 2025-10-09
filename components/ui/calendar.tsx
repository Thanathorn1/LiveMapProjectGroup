"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export type CalendarProps = {
  mode?: "single"
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  disabled?: (date: Date) => boolean
  className?: string
  locale?: Locale
}

type Locale = {
  localize?: {
    month: (month: number) => string
    day: (day: number) => string
  }
}

const thaiMonths = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
]

const thaiDays = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."]

function Calendar({ mode = "single", selected, onSelect, disabled, className, locale }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(selected || new Date())

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    const daysInPrevMonth = getDaysInMonth(year, month - 1)

    const days: (Date | null)[] = []

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push(new Date(year, month - 1, daysInPrevMonth - i))
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }

    // Next month days to fill the grid
    const remainingDays = 42 - days.length // 6 rows × 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i))
    }

    return days
  }

  const calendarDays = generateCalendarDays()
  const weeks: (Date | null)[][] = []
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7))
  }

  const isSelected = (date: Date | null) => {
    if (!date || !selected) return false
    return date.toDateString() === selected.toDateString()
  }

  const isToday = (date: Date | null) => {
    if (!date) return false
    return date.toDateString() === new Date().toDateString()
  }

  const isCurrentMonth = (date: Date | null) => {
    if (!date) return false
    return date.getMonth() === month
  }

  const isDisabled = (date: Date | null) => {
    if (!date) return true
    return disabled ? disabled(date) : false
  }

  const handleDateClick = (date: Date | null) => {
    if (!date || isDisabled(date)) return
    onSelect?.(date)
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const monthName = locale?.localize?.month(month) || thaiMonths[month]

  return (
    <div className={cn("w-full border border-border rounded-xl overflow-hidden bg-card shadow-lg", className)}>
      <div className="relative flex items-center justify-center bg-gradient-to-r from-primary via-primary/95 to-accent py-3 px-3 gap-2">
        <button
          onClick={goToPreviousMonth}
          className="h-8 w-8 bg-white/20 hover:bg-white/30 text-white transition-all rounded-lg border border-white/30 hover:border-white/50 flex items-center justify-center shrink-0 hover:scale-105"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex-1 text-center text-white font-bold text-base drop-shadow-sm">
          {monthName} {year + 543}
        </div>

        <button
          onClick={goToNextMonth}
          className="h-8 w-8 bg-white/20 hover:bg-white/30 text-white transition-all rounded-lg border border-white/30 hover:border-white/50 flex items-center justify-center shrink-0 hover:scale-105"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-primary/90">
            {thaiDays.map((day, index) => (
              <th
                key={index}
                className="text-white font-bold text-xs uppercase tracking-wide py-2.5 text-center border-r border-white/20 last:border-r-0"
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, weekIndex) => (
            <tr key={weekIndex} className="border-b border-border last:border-b-0">
              {week.map((date, dayIndex) => {
                const selected = isSelected(date)
                const today = isToday(date)
                const currentMonth = isCurrentMonth(date)
                const disabled = isDisabled(date)

                return (
                  <td
                    key={dayIndex}
                    className={cn(
                      "border-r border-border last:border-r-0 h-11 p-0 relative",
                      !disabled && "cursor-pointer hover:bg-primary/5 transition-colors",
                    )}
                    onClick={() => handleDateClick(date)}
                  >
                    <div
                      className={cn(
                        "w-full h-full flex items-center justify-center p-1.5",
                        "font-semibold text-sm transition-all",
                        currentMonth ? "text-foreground" : "text-muted-foreground/40",
                        selected && "bg-primary text-white shadow-md",
                        today && !selected && "bg-primary/10 ring-2 ring-primary/30 ring-inset text-primary",
                        disabled && "text-muted-foreground/30 opacity-40 cursor-not-allowed",
                      )}
                    >
                      {date?.getDate()}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
