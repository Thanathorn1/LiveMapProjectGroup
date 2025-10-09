"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MessageSquare, AlertTriangle, Calendar, AlertOctagon, HandHelping, LayoutGrid } from "lucide-react"
import type { PinCategory } from "@/lib/pins"

interface PlaceCategoriesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCategorySelect?: (category: PinCategory | null) => void
}

const PLACE_CATEGORIES = [
  { id: "general" as PinCategory, label: "ทั่วไป", icon: MessageSquare, color: "bg-blue-500" },
  { id: "accident" as PinCategory, label: "อุบัติเหตุ", icon: AlertTriangle, color: "bg-red-500" },
  { id: "event" as PinCategory, label: "กิจกรรม", icon: Calendar, color: "bg-green-500" },
  { id: "warning" as PinCategory, label: "เตือนภัย", icon: AlertOctagon, color: "bg-orange-500" },
  { id: "help" as PinCategory, label: "ขอความช่วยเหลือ", icon: HandHelping, color: "bg-purple-500" },
]

export function PlaceCategoriesDialog({ open, onOpenChange, onCategorySelect }: PlaceCategoriesDialogProps) {
  const handleCategoryClick = (categoryId: PinCategory) => {
    onCategorySelect?.(categoryId)
    onOpenChange(false)
  }

  const handleShowAll = () => {
    onCategorySelect?.(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-w-[95vw]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">ประเภทของโพสต์</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3 py-1">
          <Button
            onClick={handleShowAll}
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-accent transition-colors bg-transparent"
          >
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <LayoutGrid className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-medium text-center leading-tight">ทั้งหมด</span>
          </Button>

          {PLACE_CATEGORIES.map((category) => (
            <Button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-accent transition-colors"
            >
              <div className={`w-12 h-12 rounded-full ${category.color} flex items-center justify-center`}>
                <category.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-center leading-tight">{category.label}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
