"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import {
  getPinById,
  addComment,
  updatePin,
  deletePin,
  deleteComment,
  toggleReaction,
  toggleFavorite,
  toggleCommentLike,
  getReactionCounts,
  getTotalReactionCount,
  PIN_CATEGORIES,
  type Pin,
  type Comment,
  type PinCategory,
  type ReactionType,
  type MediaType,
} from "@/lib/pins"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  MapPin,
  Clock,
  Send,
  MessageCircle,
  Edit2,
  Trash2,
  X,
  Check,
  ImagePlus,
  Heart,
  Share2,
  Bookmark,
  BookmarkCheck,
  ThumbsUp,
  Reply,
  Video,
  FileImage,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { th } from "date-fns/locale"
import Image from "next/image"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ReactionPicker, REACTIONS } from "@/components/reaction-picker"

interface PinDetailSheetProps {
  pinId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onCommentAdded?: () => void
  onPinDeleted?: () => void
  onPinUpdated?: () => void
}

export function PinDetailSheet({
  pinId,
  open,
  onOpenChange,
  onCommentAdded,
  onPinDeleted,
  onPinUpdated,
}: PinDetailSheetProps) {
  const { user } = useAuth()
  const [pin, setPin] = useState<Pin | null>(null)
  const [commentText, setCommentText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editCategory, setEditCategory] = useState<PinCategory>("general")
  const [editImages, setEditImages] = useState<string[]>([])
  const [editMedias, setEditMedias] = useState<{ type: MediaType; data: string }[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null)
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [commentMedia, setCommentMedia] = useState<{ type: MediaType; data: string } | null>(null)
  const commentMediaInputRef = useRef<HTMLInputElement>(null)
  const [replyToComment, setReplyToComment] = useState<Comment | null>(null)
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null)
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)

  const [touchTimer, setTouchTimer] = useState<NodeJS.Timeout | null>(null)
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0)
  }, [])

  useEffect(() => {
    if (pinId) {
      const foundPin = getPinById(pinId)
      setPin(foundPin)
      if (foundPin) {
        setEditTitle(foundPin.title)
        setEditDescription(foundPin.description)
        setEditCategory(foundPin.category)
        setEditImages(foundPin.images || (foundPin.image ? [foundPin.image] : []))
        setEditMedias(foundPin.medias || (foundPin.media ? [foundPin.media] : []))
        setCurrentMediaIndex(0)
        if (user && foundPin.reactions) {
          setUserReaction(foundPin.reactions[user.id] || null)
        } else {
          setUserReaction(null)
        }
        if (user && foundPin.favorites) {
          setIsFavorited(foundPin.favorites.includes(user.id))
        } else {
          setIsFavorited(false)
        }
      }
    }
  }, [pinId, open, user])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !pin || (!commentText.trim() && !commentMedia)) return

    setIsSubmitting(true)

    await new Promise((resolve) => setTimeout(resolve, 300))

    addComment(
      pin.id,
      user.id,
      user.name,
      commentText.trim(),
      commentMedia || undefined,
      replyToComment?.id,
      user.avatar,
    )

    const updatedPin = getPinById(pin.id)
    setPin(updatedPin)

    setCommentText("")
    setCommentMedia(null)
    setReplyToComment(null)
    setIsSubmitting(false)

    if (onCommentAdded) {
      onCommentAdded()
    }
  }

  const handleSaveEdit = async () => {
    if (!pin || !editTitle.trim() || !editDescription.trim()) return

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 300))

    const updatedPin = updatePin(pin.id, {
      title: editTitle,
      description: editDescription,
      category: editCategory,
      images: editImages.length > 0 ? editImages : undefined,
      medias: editMedias.length > 0 ? editMedias : undefined,
    })

    if (updatedPin) {
      setPin(updatedPin)
      setIsEditing(false)
      if (onPinUpdated) {
        onPinUpdated()
      }
    }

    setIsSubmitting(false)
  }

  const handleDelete = async () => {
    if (!pin) return

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 300))

    const success = deletePin(pin.id)

    if (success) {
      setShowDeleteDialog(false)
      onOpenChange(false)
      if (onPinDeleted) {
        onPinDeleted()
      }
    }

    setIsSubmitting(false)
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!pin) return

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 300))

    const success = deleteComment(pin.id, commentId)

    if (success) {
      const updatedPin = getPinById(pin.id)
      setPin(updatedPin)
      setCommentToDelete(null)
      if (onCommentAdded) {
        onCommentAdded()
      }
    }

    setIsSubmitting(false)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          setEditMedias((prev) => [...prev, { type: "video", data }])
        } else if (file.type === "image/gif") {
          setEditMedias((prev) => [...prev, { type: "gif", data }])
        } else {
          setEditImages((prev) => [...prev, data])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRemoveEditImage = (index: number) => {
    setEditImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleRemoveEditMedia = (index: number) => {
    setEditMedias((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCommentMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const maxSize = file.type.startsWith("video/") ? 10 * 1024 * 1024 : 2 * 1024 * 1024
    if (file.size > maxSize) {
      alert(`ไฟล์ต้องมีขนาดไม่เกิน ${maxSize / (1024 * 1024)}MB`)
      return
    }

    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      alert("กรุณาเลือกไฟล์รูปภาพหรือวิดีโอเท่านั้น")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const data = reader.result as string

      if (file.type.startsWith("video/")) {
        setCommentMedia({ type: "video", data })
      } else if (file.type === "image/gif") {
        setCommentMedia({ type: "gif", data })
      } else {
        setCommentMedia({ type: "image", data })
      }
    }
    reader.readAsDataURL(file)
  }

  const handleReaction = (reactionType: ReactionType) => {
    if (!user || !pin) return

    console.log("[v0] Reaction selected:", reactionType)
    const updatedPin = toggleReaction(pin.id, user.id, reactionType)
    if (updatedPin) {
      setPin(updatedPin)
      setUserReaction(updatedPin.reactions[user.id] || null)
      console.log("[v0] Reaction toggled, new reactions:", updatedPin.reactions)
    }
    setShowReactionPicker(false)
  }

  const handleToggleFavorite = () => {
    if (!user || !pin) return

    const updatedPin = toggleFavorite(pin.id, user.id)
    if (updatedPin) {
      setPin(updatedPin)
      setIsFavorited(updatedPin.favorites?.includes(user.id) || false)
    }
  }

  const handleToggleCommentLike = (commentId: string) => {
    if (!user || !pin) return

    toggleCommentLike(pin.id, commentId, user.id)
    const updatedPin = getPinById(pin.id)
    if (updatedPin) {
      setPin(updatedPin)
    }
  }

  const handleShare = (platform: string) => {
    if (!pin) return

    console.log("[v0] Share clicked:", platform)
    const shareUrl = window.location.href
    const shareText = `${pin.title} - ${pin.description}`

    switch (platform) {
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank")
        break
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
          "_blank",
        )
        break
      case "line":
        window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`, "_blank")
        break
      case "copy":
        navigator.clipboard.writeText(shareUrl)
        alert("คัดลอกลิงค์แล้ว!")
        break
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: th })
    } catch {
      return "เมื่อสักครู่"
    }
  }

  const renderMedia = (pin: Pin) => {
    const images = pin.images || (pin.image ? [pin.image] : [])
    const medias = pin.medias || (pin.media ? [pin.media] : [])
    const allMedia = [...images.map((img) => ({ type: "image" as const, data: img })), ...medias.map((media) => media)]

    if (allMedia.length === 0) return null

    const currentMedia = allMedia[currentMediaIndex]

    return (
      <div className="relative w-full">
        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border">
          {currentMedia.type === "video" ? (
            <video src={currentMedia.data} controls className="w-full h-full object-contain bg-black" />
          ) : (
            <Image src={currentMedia.data || "/placeholder.svg"} alt="Media" fill className="object-contain bg-muted" />
          )}
        </div>
        {allMedia.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentMediaIndex((prev) => (prev > 0 ? prev - 1 : allMedia.length - 1))}
              className="h-8 w-8 p-0"
            >
              ←
            </Button>
            <span className="text-xs text-muted-foreground">
              {currentMediaIndex + 1} / {allMedia.length}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentMediaIndex((prev) => (prev < allMedia.length - 1 ? prev + 1 : 0))}
              className="h-8 w-8 p-0"
            >
              →
            </Button>
          </div>
        )}
      </div>
    )
  }

  const renderCommentMedia = (media?: { type: MediaType; data: string }) => {
    if (!media) return null

    if (media.type === "video") {
      return (
        <div className="relative w-full max-w-xs aspect-video rounded-lg overflow-hidden border border-border mt-2">
          <video src={media.data} controls className="w-full h-full object-contain bg-black" />
        </div>
      )
    } else if (media.type === "gif" || media.type === "image") {
      return (
        <div className="relative w-full max-w-xs aspect-video rounded-lg overflow-hidden border border-border mt-2">
          <Image src={media.data || "/placeholder.svg"} alt="Comment media" fill className="object-contain bg-muted" />
        </div>
      )
    }

    return null
  }

  const organizeComments = (comments: Comment[]) => {
    const topLevel = comments.filter((c) => !c.parentId)
    const replies = comments.filter((c) => c.parentId)

    return topLevel.map((comment) => ({
      ...comment,
      replies: replies.filter((r) => r.parentId === comment.id),
    }))
  }

  if (!pin) return null

  const categoryInfo = PIN_CATEGORIES[pin.category]
  const isOwner = user?.id === pin.userId
  const reactionCounts = getReactionCounts(pin)
  const totalReactions = getTotalReactionCount(pin)

  const topReactions = (Object.entries(reactionCounts) as [ReactionType, number][])
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  const organizedComments = organizeComments(pin.comments)

  const displayUserName = isOwner && user ? user.name : pin.userName
  const displayUserAvatar = isOwner && user ? user.avatar : pin.userAvatar

  const handleTouchStart = () => {
    if (!isTouchDevice) return
    const timer = setTimeout(() => {
      setShowReactionPicker(true)
    }, 500) // 500ms long press
    setTouchTimer(timer)
  }

  const handleTouchEnd = () => {
    if (touchTimer) {
      clearTimeout(touchTimer)
      setTouchTimer(null)
    }
  }

  const renderEditMediaPreviews = () => {
    const allMedia = [
      ...editImages.map((img, idx) => ({ type: "image" as const, data: img, idx, isImage: true })),
      ...editMedias.map((media, idx) => ({ ...media, idx, isImage: false })),
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
              <video src={item.data} controls className="w-full h-full object-contain" />
            ) : (
              <Image src={item.data || "/placeholder.svg"} alt="Preview" fill className="object-contain" />
            )}
            <button
              type="button"
              onClick={() => {
                if (item.isImage) {
                  handleRemoveEditImage(item.idx)
                } else {
                  handleRemoveEditMedia(item.idx)
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
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="h-[75vh] md:h-auto md:max-h-[90vh] md:side-right p-1 flex flex-col md:w-[650px] md:mx-auto md:left-1/2 md:-translate-x-1/2 :rounded-t-3xl border-t-2 md:border-0"
        >
          <SheetHeader className="p-10 pb-3 border-b bg-gradient-to-r from-primary/5 to-accent/5 flex-shrink-0 h-30">
            <div className="flex items-center justify-between gap-6">
              <SheetTitle className="text-left text-base flex-1 min-w-1 h-14 ">
                {isEditing ? "แก้ไขเหตุการณ์" : "รายละเอียดเหตุการณ์"}
              </SheetTitle>
              {isOwner && !isEditing && (
                <div className="flex gap-3 flex-shrink-0 h-18">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="h-10 w-10 p-0 rounded-full"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowDeleteDialog(true)}
                    className="h-10 w-10 p-0 rounded-full"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              )}
              {isEditing && (
                <div className="flex gap-3 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false)
                      setEditTitle(pin.title)
                      setEditDescription(pin.description)
                      setEditCategory(pin.category)
                      setEditImages(pin.images || (pin.image ? [pin.image] : []))
                      setEditMedias(pin.medias || (pin.media ? [pin.media] : []))
                    }}
                    className="h-10 w-10 p-0 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={isSubmitting}
                    className="h-10 w-10 p-0 rounded-full"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4 pb-6">
              {isEditing ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">ประเภทเหตุการณ์</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(Object.keys(PIN_CATEGORIES) as PinCategory[]).map((cat) => {
                        const info = PIN_CATEGORIES[cat]
                        const isSelected = editCategory === cat
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setEditCategory(cat)}
                            className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                              isSelected
                                ? "shadow-md scale-[1.02] border-opacity-100"
                                : "hover:border-primary/30 border-transparent"
                            }`}
                            style={{
                              backgroundColor: isSelected ? info.color : `${info.color}10`,
                              borderColor: isSelected ? info.color : "transparent",
                              color: isSelected ? "#ffffffff" : info.color,
                            }}
                          >
                            <span className="text-lg">{info.icon}</span>
                            <span className="text-xs font-bold">{info.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">หัวข้อ</Label>
                    <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="text-sm" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">รายละเอียด</Label>
                    <Textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={3}
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">รูปภาพ / วิดีโอ / GIF</Label>
                    {editImages.length > 0 || editMedias.length > 0 ? (
                      <div className="space-y-2">
                        {renderEditMediaPreviews()}
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="edit-image-upload"
                          multiple
                        />
                        <label
                          htmlFor="edit-image-upload"
                          className="flex items-center justify-center gap-2 w-full p-3 rounded-lg border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors bg-muted/30"
                        >
                          <ImagePlus className="w-5 h-5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">เพิ่มรูปภาพ/วิดีโอเพิ่มเติม</span>
                        </label>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="edit-image-upload"
                          multiple
                        />
                        <label
                          htmlFor="edit-image-upload"
                          className="flex flex-col items-center justify-center w-full aspect-video rounded-lg border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors bg-muted/30"
                        >
                          <div className="flex gap-3 mb-2">
                            <ImagePlus className="w-8 h-8 text-muted-foreground" />
                            <Video className="w-8 h-8 text-muted-foreground" />
                            <FileImage className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <span className="text-xs text-muted-foreground">คลิกเพื่อเลือกรูปภาพ วิดีโอ หรือ GIF</span>
                          <span className="text-xs text-muted-foreground mt-1">สามารถเลือกหลายไฟล์พร้อมกัน</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-muted/50 to-muted/30">
                      <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                        {displayUserAvatar && (
                          <AvatarImage src={displayUserAvatar || "/placeholder.svg"} alt={displayUserName} />
                        )}
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold text-sm">
                          {getInitials(displayUserName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-bold text-base">{displayUserName}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(pin.createdAt)}
                          </span>
                          <span>•</span>
                          <span
                            className="px-2 py-0.5 rounded-full text-white text-xs font-semibold shadow-sm"
                            style={{ backgroundColor: categoryInfo.color }}
                          >
                            {categoryInfo.icon} {categoryInfo.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h2 className="text-xl font-bold text-balance leading-tight">{pin.title}</h2>
                      <p className="text-sm leading-relaxed text-pretty text-foreground/90">{pin.description}</p>

                      {renderMedia(pin)}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground py-2 px-2 bg-muted/30 rounded-xl">
                      <div className="flex items-center -space-x-1">
                        {totalReactions > 0 && (
                          <>
                            <div className="flex items-center -space-x-1">
                              {topReactions.map(([reactionType]) => (
                                <span
                                  key={reactionType}
                                  className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-background border-2 border-background shadow-sm text-xs"
                                >
                                  {REACTIONS[reactionType].emoji}
                                </span>
                              ))}
                            </div>
                            <span className="ml-1 font-medium">{totalReactions} คน</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{pin.comments.length} ความคิดเห็น</span>
                      </div>
                    </div>

                    <Separator className="my-1" />

                    <div className="grid grid-cols-4 gap-2 py-2">
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`w-full flex flex-col sm:flex-row items-center justify-center gap-1 hover:bg-muted/80 transition-all rounded-xl text-xs h-auto py-2 ${
                            userReaction ? "font-bold" : "text-foreground"
                          }`}
                          style={userReaction ? { color: REACTIONS[userReaction].color } : {}}
                          onMouseEnter={() => !isTouchDevice && setShowReactionPicker(true)}
                          onMouseLeave={() => !isTouchDevice && setShowReactionPicker(false)}
                          onTouchStart={handleTouchStart}
                          onTouchEnd={handleTouchEnd}
                          onClick={() => {
                            if (showReactionPicker) {
                              setShowReactionPicker(false)
                              return
                            }
                            if (userReaction) {
                              handleReaction(userReaction)
                            } else {
                              handleReaction("love")
                            }
                          }}
                        >
                          {userReaction ? (
                            <>
                              <span className="text-lg">{REACTIONS[userReaction].emoji}</span>
                              <span className="font-semibold text-xs">{REACTIONS[userReaction].label}</span>
                            </>
                          ) : (
                            <>
                              <Heart className="w-5 h-5" />
                              <span className="font-semibold text-xs">ถูกใจ</span>
                            </>
                          )}
                        </Button>
                        <div
                          onMouseEnter={() => !isTouchDevice && setShowReactionPicker(true)}
                          onMouseLeave={() => !isTouchDevice && setShowReactionPicker(false)}
                        >
                          <ReactionPicker
                            show={showReactionPicker}
                            onSelect={handleReaction}
                            currentReaction={userReaction}
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex flex-col sm:flex-row items-center justify-center gap-1 hover:bg-muted/80 transition-all rounded-xl text-xs h-auto py-2"
                        onClick={() => {
                          console.log("[v0] Comment button clicked")
                          document.getElementById("comment-input")?.focus()
                        }}
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span className="font-semibold text-xs">แสดงความคิดเห็น</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`flex flex-col sm:flex-row items-center justify-center gap-1 hover:bg-muted/80 transition-all rounded-xl text-xs h-auto py-2 ${
                          isFavorited ? "text-yellow-500 font-bold" : ""
                        }`}
                        onClick={handleToggleFavorite}
                      >
                        {isFavorited ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                        <span className="font-semibold text-xs">{isFavorited ? "บันทึกแล้ว" : "บันทึก"}</span>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex flex-col sm:flex-row items-center justify-center gap-1 hover:bg-muted/80 transition-all rounded-xl text-xs h-auto py-2"
                          >
                            <Share2 className="w-5 h-5" />
                            <span className="font-semibold text-xs">แชร์</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 z-[1300]">
                          <DropdownMenuItem onClick={() => handleShare("facebook")}>
                            <span>แชร์ไปยัง Facebook</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShare("twitter")}>
                            <span>แชร์ไปยัง Twitter</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShare("line")}>
                            <span>แชร์ไปยัง LINE</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShare("copy")}>
                            <span>คัดลอกลิงค์</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <Separator className="my-1" />

                    <div className="flex items-center gap-2 text-xs text-muted-foreground px-2 py-2 bg-muted/30 rounded-xl">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <span className="font-mono text-xs">
                        {pin.lat.toFixed(6)}, {pin.lng.toFixed(6)}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="font-bold text-base">ความคิดเห็น</h3>
                    {pin.comments.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-20" />
                        <p className="text-xs">ยังไม่มีความคิดเห็น</p>
                        <p className="text-xs mt-1">เป็นคนแรกที่แสดงความคิดเห็น</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {organizedComments.map((comment) => {
                          const commentUserName = comment.userId === user?.id && user ? user.name : comment.userName
                          const commentUserAvatar =
                            comment.userId === user?.id && user ? user.avatar : comment.userAvatar

                          return (
                            <div key={comment.id} className="space-y-2">
                              <div className="flex gap-2">
                                <Avatar className="w-8 h-8 flex-shrink-0">
                                  {commentUserAvatar && (
                                    <AvatarImage src={commentUserAvatar || "/placeholder.svg"} alt={commentUserName} />
                                  )}
                                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xs">
                                    {getInitials(commentUserName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="bg-muted rounded-2xl rounded-tl-sm p-2.5">
                                    <div className="font-semibold text-xs mb-1">{commentUserName}</div>
                                    <p className="text-xs leading-relaxed text-pretty">{comment.text}</p>
                                    {renderCommentMedia(comment.media)}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 px-2">
                                    <span>{formatTime(comment.createdAt)}</span>
                                    <button
                                      onClick={() => handleToggleCommentLike(comment.id)}
                                      className={`flex items-center gap-1 hover:text-primary transition-colors ${
                                        comment.likes?.includes(user?.id || "") ? "text-primary font-semibold" : ""
                                      }`}
                                    >
                                      <ThumbsUp className="w-3 h-3" />
                                      <span>ถูกใจ{comment.likes?.length ? ` (${comment.likes.length})` : ""}</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        setReplyToComment(comment)
                                        document.getElementById("comment-input")?.focus()
                                      }}
                                      className="flex items-center gap-1 hover:text-primary transition-colors"
                                    >
                                      <Reply className="w-3 h-3" />
                                      <span>ตอบกลับ</span>
                                    </button>
                                    {user?.id === comment.userId && (
                                      <button
                                        onClick={() => setCommentToDelete(comment.id)}
                                        className="flex items-center gap-1 hover:text-destructive transition-colors"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                        <span>ลบ</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {comment.replies && comment.replies.length > 0 && (
                                <div className="ml-10 space-y-2">
                                  {comment.replies.map((reply) => {
                                    const replyUserName = reply.userId === user?.id && user ? user.name : reply.userName
                                    const replyUserAvatar =
                                      reply.userId === user?.id && user ? user.avatar : reply.userAvatar

                                    return (
                                      <div key={reply.id} className="flex gap-2">
                                        <Avatar className="w-7 h-7 flex-shrink-0">
                                          {replyUserAvatar && (
                                            <AvatarImage
                                              src={replyUserAvatar || "/placeholder.svg"}
                                              alt={replyUserName}
                                            />
                                          )}
                                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xs">
                                            {getInitials(replyUserName)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                          <div className="bg-muted rounded-2xl rounded-tl-sm p-2.5">
                                            <div className="font-semibold text-xs mb-1">{replyUserName}</div>
                                            <p className="text-xs leading-relaxed text-pretty">{reply.text}</p>
                                            {renderCommentMedia(reply.media)}
                                          </div>
                                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 px-2">
                                            <span>{formatTime(reply.createdAt)}</span>
                                            <button
                                              onClick={() => handleToggleCommentLike(reply.id)}
                                              className={`flex items-center gap-1 hover:text-primary transition-colors ${
                                                reply.likes?.includes(user?.id || "")
                                                  ? "text-primary font-semibold"
                                                  : ""
                                              }`}
                                            >
                                              <ThumbsUp className="w-3 h-3" />
                                              <span>ถูกใจ{reply.likes?.length ? ` (${reply.likes.length})` : ""}</span>
                                            </button>
                                            {user?.id === reply.userId && (
                                              <button
                                                onClick={() => setCommentToDelete(reply.id)}
                                                className="flex items-center gap-1 hover:text-destructive transition-colors"
                                              >
                                                <Trash2 className="w-3 h-3" />
                                                <span>ลบ</span>
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </ScrollArea>

          {!isEditing && (
            <div className="border-t bg-gradient-to-r from-muted/30 to-muted/20 p-3 flex-shrink-0">
              {replyToComment && (
                <div className="mb-2 p-2 bg-muted rounded-lg flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    ตอบกลับ <span className="font-semibold">{replyToComment.userName}</span>
                  </span>
                  <Button size="sm" variant="ghost" onClick={() => setReplyToComment(null)} className="h-6 w-6 p-0">
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
              {commentMedia && (
                <div className="mb-2 relative inline-block">
                  {commentMedia.type === "video" ? (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-border">
                      <video src={commentMedia.data} className="w-full h-full object-contain" />
                      <button
                        onClick={() => setCommentMedia(null)}
                        className="absolute top-1 right-1 p-0.5 bg-destructive text-white rounded-full hover:bg-destructive/90 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-border">
                      <Image
                        src={commentMedia.data || "/placeholder.svg"}
                        alt="Comment media"
                        fill
                        className="object-contain"
                      />
                      <button
                        onClick={() => setCommentMedia(null)}
                        className="absolute top-1 right-1 p-0.5 bg-destructive text-white rounded-full hover:bg-destructive/90 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              )}
              <form onSubmit={handleSubmitComment} className="flex gap-2">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  {user?.avatar && <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />}
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xs">
                    {user ? getInitials(user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <div className="flex-1 space-y-1">
                    <Textarea
                      id="comment-input"
                      placeholder="เขียนความคิดเห็น..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="min-h-[40px] max-h-24 resize-none text-sm"
                      rows={1}
                      disabled={isSubmitting}
                    />
                    <input
                      ref={commentMediaInputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleCommentMediaUpload}
                      className="hidden"
                      id="comment-media-upload"
                    />
                    <label
                      htmlFor="comment-media-upload"
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary cursor-pointer transition-colors"
                    >
                      <ImagePlus className="w-3.5 h-3.5" />
                      <span>แนบรูป/วิดีโอ</span>
                    </label>
                  </div>
                  <Button
                    type="submit"
                    size="icon"
                    disabled={isSubmitting || (!commentText.trim() && !commentMedia)}
                    className="flex-shrink-0 h-10 w-10"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!commentToDelete} onOpenChange={() => setCommentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบความคิดเห็น</AlertDialogTitle>
            <AlertDialogDescription>คุณแน่ใจหรือไม่ที่จะลบความคิดเห็นนี้? การกระทำนี้ไม่สามารถย้อนกลับได้</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => commentToDelete && handleDeleteComment(commentToDelete)}
              disabled={isSubmitting}
              className="bg-destructive"
            >
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>คุณแน่ใจหรือไม่ที่จะลบหมุดนี้? การกระทำนี้ไม่สามารถย้อนกลับได้</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isSubmitting} className="bg-destructive">
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
