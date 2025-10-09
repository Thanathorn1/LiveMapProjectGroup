"use client"

import { Button } from "@/components/ui/button"
import { FileText, Bookmark, Calendar, Filter } from "lucide-react"
import { useRouter } from "next/navigation"

interface FloatingActionMenuProps {
  onShowCalendar: () => void
  onShowPlaceCategories: () => void
}

export function FloatingActionMenu({ onShowCalendar, onShowPlaceCategories }: FloatingActionMenuProps) {
  const router = useRouter()

  const menuItems = [
    { icon: FileText, label: "โพสต์", onClick: () => router.push("/posts") },
    { icon: Bookmark, label: "บันทึก", onClick: () => router.push("/records") },
    { icon: Calendar, label: "ปฏิทิน", onClick: onShowCalendar },
    { icon: Filter, label: "ประเภท", onClick: onShowPlaceCategories },
  ]

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-[1000] flex flex-col gap-3">
      {menuItems.map((item) => (
        <Button
          key={item.label}
          onClick={item.onClick}
          className="w-13 h-13 rounded-sm bg-primary hover:bg-primary/90 text-white shadow-lg flex flex-col items-center justify-center gap-1 p-2"
        >
          <item.icon className="w-5 h-5" />
          <span className="text-[10px] font-medium leading-tight">{item.label}</span>
        </Button>
      ))}
    </div>
  )
}
