"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { AppHeader } from "@/components/app-header"
import { getAllPins, PIN_CATEGORIES, type Pin, type PinCategory } from "@/lib/pins"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Clock, MessageCircle, Heart, MapPin, Filter, CalendarDays } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { th } from "date-fns/locale"
import { PinDetailSheet } from "@/components/pin-detail-sheet"
import { getTotalReactionCount } from "@/lib/pins"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { getLocalDateString } from "@/lib/utils"
import { PostMediaGrid } from "@/components/post-media-grid"
import { useAuth } from "@/contexts/auth-context"

function PostsContent() {
  const { user } = useAuth()
  const [pins, setPins] = useState<Pin[]>([])
  const [selectedCategory, setSelectedCategory] = useState<PinCategory | null>(null)
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null)
  const [showPinDetail, setShowPinDetail] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  useEffect(() => {
    loadPins()
  }, [])

  const loadPins = () => {
    const allPins = getAllPins()
    const sortedPins = allPins.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    setPins(sortedPins)
  }

  const filteredPins = pins.filter((pin) => {
    if (selectedCategory && pin.category !== selectedCategory) {
      return false
    }

    if (selectedDate) {
      const pinDateString = pin.date || getLocalDateString(new Date(pin.createdAt))
      const selectedDateString = getLocalDateString(selectedDate)

      if (pinDateString !== selectedDateString) {
        return false
      }
    }

    return true
  })

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getDisplayName = (pin: Pin) => {
    if (user && pin.userId === user.id) {
      return user.name
    }
    return pin.userName
  }

  const getDisplayAvatar = (pin: Pin) => {
    if (user && pin.userId === user.id) {
      return user.avatar
    }
    return pin.userAvatar
  }

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: th })
    } catch {
      return "เมื่อสักครู่"
    }
  }

  const handlePinClick = (pinId: string) => {
    setSelectedPinId(pinId)
    setShowPinDetail(true)
  }

  const handlePinUpdated = () => {
    loadPins()
  }

  const handlePinDeleted = () => {
    loadPins()
    setShowPinDetail(false)
  }

  const handleCommentAdded = () => {
    loadPins()
  }

  const getCategoryCount = (category: PinCategory) => {
    return pins.filter((pin) => pin.category === category).length
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">รายการโพสต์</h1>
              <p className="text-muted-foreground mt-1">
                ทั้งหมด {filteredPins.length} โพสต์
                {selectedCategory && ` ในหมวด ${PIN_CATEGORIES[selectedCategory].label}`}
                {selectedDate && ` ในวันที่ ${format(selectedDate, "d MMMM yyyy", { locale: th })}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={selectedDate ? "default" : "outline"} size="sm" className="gap-2">
                    <CalendarDays className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {selectedDate ? format(selectedDate, "d MMM yyyy", { locale: th }) : "เลือกวันที่"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <CalendarComponent mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                  {selectedDate && (
                    <div className="p-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                        onClick={() => setSelectedDate(undefined)}
                      >
                        ล้างวันที่
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-2">
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">กรอง</span>
              </Button>
            </div>
          </div>

          {/* Category Filters */}
          {showFilters && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3 text-sm text-muted-foreground">กรองตามประเภท</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                  className="gap-2"
                >
                  ทั้งหมด
                  <Badge variant="secondary" className="ml-1">
                    {pins.length}
                  </Badge>
                </Button>
                {(Object.keys(PIN_CATEGORIES) as PinCategory[]).map((category) => {
                  const info = PIN_CATEGORIES[category]
                  const count = getCategoryCount(category)
                  const isSelected = selectedCategory === category

                  return (
                    <Button
                      key={category}
                      size="sm"
                      onClick={() => setSelectedCategory(isSelected ? null : category)}
                      className="gap-2 font-semibold"
                      style={{
                        backgroundColor: isSelected ? info.color : `${info.color}20`,
                        borderColor: info.color,
                        color: isSelected ? "#ffffff" : info.color,
                      }}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: isSelected ? "#ffffff" : info.color }}
                      />
                      {info.label}
                      <Badge
                        variant="secondary"
                        className="ml-1"
                        style={{
                          backgroundColor: isSelected ? "rgba(255,255,255,0.3)" : `${info.color}40`,
                          color: isSelected ? "#ffffff" : info.color,
                        }}
                      >
                        {count}
                      </Badge>
                    </Button>
                  )
                })}
              </div>
            </Card>
          )}

          {/* Posts Grid */}
          {filteredPins.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="text-muted-foreground">
                <MapPin className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">ไม่มีโพสต์</p>
                <p className="text-sm mt-1">{selectedCategory ? "ไม่มีโพสต์ในหมวดนี้" : "ยังไม่มีโพสต์ในระบบ"}</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPins.map((pin) => {
                const categoryInfo = PIN_CATEGORIES[pin.category]
                const totalReactions = getTotalReactionCount(pin)
                const displayName = getDisplayName(pin)
                const displayAvatar = getDisplayAvatar(pin)

                return (
                  <Card
                    key={pin.id}
                    className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => handlePinClick(pin.id)}
                  >
                    <PostMediaGrid
                      image={pin.image}
                      media={pin.media}
                      images={pin.images}
                      medias={pin.medias}
                      title={pin.title}
                    />

                    {/* Content */}
                    <div className="p-4 space-y-3">
                      {/* Category Badge */}
                      <Badge className="font-semibold text-white" style={{ backgroundColor: categoryInfo.color }}>
                        {categoryInfo.label}
                      </Badge>

                      {/* Title */}
                      <h3 className="font-bold text-lg line-clamp-2 text-balance leading-tight">{pin.title}</h3>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground line-clamp-2 text-pretty leading-relaxed">
                        {pin.description}
                      </p>

                      {/* Author & Stats */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            {displayAvatar && (
                              <AvatarImage src={displayAvatar || "/placeholder.svg"} alt={displayName} />
                            )}
                            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xs">
                              {getInitials(displayName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium">{displayName}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(pin.createdAt)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            <span className="text-xs font-medium">{totalReactions}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-xs font-medium">{pin.comments.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Pin Detail Sheet */}
      <PinDetailSheet
        pinId={selectedPinId}
        open={showPinDetail}
        onOpenChange={setShowPinDetail}
        onCommentAdded={handleCommentAdded}
        onPinUpdated={handlePinUpdated}
        onPinDeleted={handlePinDeleted}
      />
    </div>
  )
}

export default function PostsPage() {
  return (
    <ProtectedRoute>
      <PostsContent />
    </ProtectedRoute>
  )
}
