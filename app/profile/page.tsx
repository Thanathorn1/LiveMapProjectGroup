"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ImageCropDialog } from "@/components/image-crop-dialog"
import { getAllPins } from "@/lib/pins"
import {
  User,
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Camera,
  Phone,
  MessageCircle,
  Instagram,
  Twitter,
  Facebook,
} from "lucide-react"
import Link from "next/link"

function ProfileContent() {
  const { user, updateProfile } = useAuth()
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [bio, setBio] = useState(user?.bio || "")
  const [facebook, setFacebook] = useState(user?.facebook || "")
  const [instagram, setInstagram] = useState(user?.instagram || "")
  const [twitter, setTwitter] = useState(user?.twitter || "")
  const [line, setLine] = useState(user?.line || "")
  const [avatar, setAvatar] = useState(user?.avatar || "")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [cropDialogOpen, setCropDialogOpen] = useState(false)
  const [imageToCrop, setImageToCrop] = useState("")
  const [pinsCount, setPinsCount] = useState(0)
  const [commentsCount, setCommentsCount] = useState(0)

  useEffect(() => {
    if (!user?.id) return

    const pins = getAllPins()

    const userPins = pins.filter((pin) => pin.userId === user.id)
    setPinsCount(userPins.length)

    let totalComments = 0
    pins.forEach((pin) => {
      if (pin.comments) {
        const userComments = pin.comments.filter((comment) => comment.userId === user.id)
        totalComments += userComments.length
      }
    })
    setCommentsCount(totalComments)
  }, [user?.id])

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("ขนาดไฟล์ต้องไม่เกิน 2MB")
        return
      }

      if (!file.type.startsWith("image/")) {
        setError("กรุณาเลือกไฟล์รูปภาพ")
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setImageToCrop(reader.result as string)
        setCropDialogOpen(true)
        setError("")
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCropComplete = (croppedImage: string) => {
    setAvatar(croppedImage)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setIsLoading(true)

    const result = await updateProfile({
      name,
      email,
      phone,
      bio,
      facebook,
      instagram,
      twitter,
      line,
      avatar,
    })

    if (result.success) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError(result.error || "เกิดข้อผิดพลาด")
    }

    setIsLoading(false)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <ImageCropDialog
        open={cropDialogOpen}
        onOpenChange={setCropDialogOpen}
        imageSrc={imageToCrop}
        onCropComplete={handleCropComplete}
      />

      {/* Header */}
      <div className="bg-background/80 backdrop-blur-lg border-b sticky top-0 z-[1100]">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/map">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">โปรไฟล์</h1>
            <p className="text-sm text-muted-foreground">จัดการข้อมูลส่วนตัวของคุณ</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 py-8 space-y-6">
        {/* Profile Header Card */}
        <Card className="border-2 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary via-primary/80 to-accent"></div>
          <CardContent className="pt-0">
            <div className="flex flex-col items-center -mt-16 mb-6">
              <div className="relative group">
                <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                  {avatar ? (
                    <AvatarImage src={avatar || "/placeholder.svg"} alt={user?.name} />
                  ) : (
                    <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary to-accent text-white">
                      {user?.name ? getInitials(user.name) : "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <button
                  onClick={handleAvatarClick}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera className="w-8 h-8 text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <h2 className="text-2xl font-bold mt-4 mb-1">{user?.name}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
              {user?.bio && <p className="text-center mt-2 text-sm max-w-md">{user.bio}</p>}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-4 text-center">
                <div className="text-3xl font-bold text-primary mb-1">{pinsCount}</div>
                <div className="text-sm text-muted-foreground">ปักหมุด</div>
              </div>
              <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl p-4 text-center">
                <div className="text-3xl font-bold text-accent mb-1">{commentsCount}</div>
                <div className="text-sm text-muted-foreground">ความคิดเห็น</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl">แก้ไขข้อมูล</CardTitle>
            <CardDescription>อัพเดตข้อมูลส่วนตัวและช่องทางติดต่อของคุณ</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {success && (
                <div className="bg-primary/10 border-2 border-primary/20 rounded-2xl p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-primary font-medium">บันทึกข้อมูลเรียบร้อยแล้ว</p>
                </div>
              )}

              {error && (
                <div className="bg-destructive/10 border-2 border-destructive/20 rounded-2xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive font-medium">{error}</p>
                </div>
              )}

              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  ข้อมูลพื้นฐาน
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    ชื่อ-นามสกุล
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="สมชาย ใจดี"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 text-base"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    อีเมล
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 text-base"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    เบอร์โทรศัพท์
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="0812345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10 h-12 text-base"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm font-medium">
                    เกี่ยวกับคุณ
                  </Label>
                  <Textarea
                    id="bio"
                    placeholder="บอกเล่าเกี่ยวกับตัวคุณ..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="min-h-24 text-base resize-none"
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground text-right">{bio.length}/200</p>
                </div>
              </div>

              {/* Social Media */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  ช่องทางติดต่อ
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="facebook" className="text-sm font-medium">
                    Facebook
                  </Label>
                  <div className="relative">
                    <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="facebook"
                      type="text"
                      placeholder="facebook.com/yourname"
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                      className="pl-10 h-12 text-base"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram" className="text-sm font-medium">
                    Instagram
                  </Label>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="instagram"
                      type="text"
                      placeholder="@yourname"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="pl-10 h-12 text-base"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter" className="text-sm font-medium">
                    Twitter / X
                  </Label>
                  <div className="relative">
                    <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="twitter"
                      type="text"
                      placeholder="@yourname"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      className="pl-10 h-12 text-base"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="line" className="text-sm font-medium">
                    LINE ID
                  </Label>
                  <div className="relative">
                    <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="line"
                      type="text"
                      placeholder="yourlineid"
                      value={line}
                      onChange={(e) => setLine(e.target.value)}
                      className="pl-10 h-12 text-base"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    กำลังบันทึก...
                  </div>
                ) : (
                  "บันทึกการเปลี่ยนแปลง"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Member Since */}
        <Card className="border-2 bg-gradient-to-br from-muted/50 to-muted/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">สมาชิกตั้งแต่</p>
              <p className="text-lg font-semibold">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "-"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}
