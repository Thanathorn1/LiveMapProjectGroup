"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { addPin, PIN_CATEGORIES, type PinCategory, type MediaType } from "@/lib/pins"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImagePlus, X, Video, FileImage } from "lucide-react"
import Image from "next/image"
import { getLocalDateString } from "@/lib/utils"

interface AddPinDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lat: number
  lng: number
  selectedDate?: string
  onPinAdded: () => void
}

export function AddPinDialog({ open, onOpenChange, lat, lng, selectedDate, onPinAdded }: AddPinDialogProps) {
  const { user } = useAuth()
  const [category, setCategory] = useState<PinCategory>("general")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [medias, setMedias] = useState<{ type: MediaType; data: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach((file) => {
      const maxSize = file.type.startsWith("video/") ? 10 * 1024 * 1024 : 2 * 1024 * 1024
      if (file.size > maxSize) {
        alert(`ไฟล์ ${file.name} มีขนาดเกิน ${maxSize / (1024 * 1024)}MB`)
        return
      }

      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        alert(`ไฟล์ ${file.name} ไม่ใช่รูปภาพหรือวิดีโอ`)
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const data = reader.result as string

        if (file.type.startsWith("video/")) {
          setMedias((prev) => [...prev, { type: "video", data }])
        } else if (file.type === "image/gif") {
          setMedias((prev) => [...prev, { type: "gif", data }])
        } else {
          setImages((prev) => [...prev, data])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleRemoveMedia = (index: number) => {
    setMedias((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 500))

    const pinDate = selectedDate || getLocalDateString()

    addPin({
      lat,
      lng,
      category,
      title,
      description,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar, // Store user's current avatar when creating pin
      date: pinDate,
      images: images.length > 0 ? images : undefined,
      medias: medias.length > 0 ? medias : undefined,
    })

    setIsLoading(false)
    setTitle("")
    setDescription("")
    setCategory("general")
    setImages([])
    setMedias([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onOpenChange(false)
    onPinAdded()
  }

  const renderMediaPreviews = () => {
    const allMedia = [
      ...images.map((img, idx) => ({ type: "image" as const, data: img, idx, isImage: true })),
      ...medias.map((media, idx) => ({ ...media, idx, isImage: false })),
    ]

    if (allMedia.length === 0) return null

    return (
      <div className="grid grid-cols-2 gap-2">
        {allMedia.map((item, globalIdx) => (
          <div
            key={globalIdx}
            className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-border"
          >
            {item.type === "video" ? (
              <video src={item.data} controls className="w-full h-full object-cover" />
            ) : (
              <Image src={item.data || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
            )}
            <button
              type="button"
              onClick={() => {
                if (item.isImage) {
                  handleRemoveImage(item.idx)
                } else {
                  handleRemoveMedia(item.idx)
                }
              }}
              className="absolute top-2 right-2 p-1.5 bg-destructive text-white rounded-full hover:bg-destructive/90 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>เพิ่มหมุดใหม่</DialogTitle>
          <DialogDescription>เพิ่มข้อมูลเหตุการณ์ที่เกิดขึ้นในตำแหน่งนี้</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>ประเภท</Label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(PIN_CATEGORIES) as PinCategory[]).map((cat) => {
                const info = PIN_CATEGORIES[cat]
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      category === cat ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: info.color }} />
                    <span className="text-sm font-medium">{info.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">หัวข้อ</Label>
            <Input
              id="title"
              placeholder="เช่น อุบัติเหตุรถชน"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">รายละเอียด</Label>
            <Textarea
              id="description"
              placeholder="อธิบายเหตุการณ์ที่เกิดขึ้น..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>รูปภาพ / วิดีโอ / GIF (ไม่บังคับ)</Label>
            {images.length > 0 || medias.length > 0 ? (
              <div className="space-y-2">
                {renderMediaPreviews()}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaUpload}
                  className="hidden"
                  id="media-upload"
                  multiple
                />
                <label
                  htmlFor="media-upload"
                  className="flex items-center justify-center gap-2 w-full p-3 rounded-lg border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors bg-muted/30"
                >
                  <ImagePlus className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">เพิ่มรูปภาพ/วิดีโอเพิ่มเติม</span>
                </label>
              </div>
            ) : (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaUpload}
                  className="hidden"
                  id="media-upload"
                  multiple
                />
                <label
                  htmlFor="media-upload"
                  className="flex flex-col items-center justify-center w-full aspect-video rounded-lg border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors bg-muted/30"
                >
                  <div className="flex gap-4 mb-2">
                    <ImagePlus className="w-10 h-10 text-muted-foreground" />
                    <Video className="w-10 h-10 text-muted-foreground" />
                    <FileImage className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground">คลิกเพื่อเลือกรูปภาพ วิดีโอ หรือ GIF</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    สามารถเลือกหลายไฟล์พร้อมกัน | รูปภาพ/GIF: ไม่เกิน 2MB | วิดีโอ: ไม่เกิน 10MB
                  </span>
                </label>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "กำลังเพิ่ม..." : "เพิ่มหมุด"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
