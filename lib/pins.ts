export type PinCategory = "accident" | "general" | "event" | "warning" | "help"
export type ReactionType = "like" | "love" | "haha" | "wow" | "sad" | "angry"
export type MediaType = "image" | "video" | "gif"

export interface Pin {
  id: string
  lat: number
  lng: number
  category: PinCategory
  title: string
  description: string
  userId: string
  userName: string
  userAvatar?: string // Added userAvatar field to store user's profile picture
  createdAt: string
  date: string // YYYY-MM-DD format for filtering
  comments: Comment[]
  image?: string // Kept for backward compatibility
  media?: {
    type: MediaType
    data: string
  } // Kept for backward compatibility
  images?: string[] // Array of base64 encoded images
  medias?: {
    type: MediaType
    data: string
  }[] // Array of videos/gifs
  likes: string[] // Array of user IDs who liked this pin (kept for backward compatibility)
  reactions: Record<string, ReactionType> // Map of userId to reaction type
  favorites: string[] // Array of user IDs who favorited this pin
}

export interface Comment {
  id: string
  pinId: string
  userId: string
  userName: string
  userAvatar?: string // Added userAvatar field to store user's profile picture
  text: string
  createdAt: string
  media?: {
    type: MediaType
    data: string
  }
  likes: string[] // Array of user IDs who liked this comment
  parentId?: string // For nested replies
}

const PINS_STORAGE_KEY = "live_map_pins"
const STORAGE_KEY = "live_map_pins"

export const PIN_CATEGORIES = {
  general: {
    label: "ทั่วไป",
    color: "#3b82f6",
    icon: "📌",
  },
  accident: {
    label: "อุบัติเหตุ",
    color: "#ef4444",
    icon: "🚨",
  },
  event: {
    label: "กิจกรรม",
    color: "#22c55e",
    icon: "🎉",
  },
  warning: {
    label: "เตือนภัย",
    color: "#f97316",
    icon: "⚠️",
  },
  help: {
    label: "ขอความช่วยเหลือ",
    color: "#a855f7",
    icon: "🆘",
  },
} as const

import { getLocalDateString } from "./utils"

export function getStoredPins(): Pin[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(PINS_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error("[v0] Error reading pins from storage:", error)
  }

  return []
}

export function setStoredPins(pins: Pin[]): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(PINS_STORAGE_KEY, JSON.stringify(pins))
  } catch (error) {
    console.error("[v0] Error saving pins to storage:", error)
  }
}

export function addPin(pin: Omit<Pin, "id" | "createdAt" | "comments" | "likes" | "reactions" | "favorites">): Pin {
  const pins = getStoredPins()
  const newPin: Pin = {
    ...pin,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    comments: [],
    likes: [], // Initialize likes as empty array
    reactions: {}, // Initialize reactions as empty object
    favorites: [],
  }
  pins.push(newPin)
  setStoredPins(pins)
  return newPin
}

export function getAllPins(): Pin[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error("[v0] Error reading pins from storage:", error)
  }

  return []
}

// Get pins for a specific date
export function getPinsByDate(dateString: string): Pin[] {
  const pins = getAllPins()
  return pins.filter((pin) => {
    // Use the date field if it exists, otherwise fall back to createdAt
    const pinDate = pin.date || getLocalDateString(new Date(pin.createdAt))
    return pinDate === dateString
  })
}

// Get today's pins
export function getTodayPins(): Pin[] {
  const today = getLocalDateString()
  return getPinsByDate(today)
}

export function addComment(
  pinId: string,
  userId: string,
  userName: string,
  text: string,
  media?: { type: MediaType; data: string },
  parentId?: string,
  userAvatar?: string, // Added userAvatar parameter
): Comment | null {
  const pins = getStoredPins()
  const pinIndex = pins.findIndex((p) => p.id === pinId)

  if (pinIndex === -1) return null

  const newComment: Comment = {
    id: Date.now().toString(),
    pinId,
    userId,
    userName,
    userAvatar, // Store user's avatar
    text,
    createdAt: new Date().toISOString(),
    media,
    likes: [],
    parentId,
  }

  pins[pinIndex].comments.push(newComment)
  setStoredPins(pins)

  return newComment
}

export function getPinById(pinId: string): Pin | null {
  const pins = getStoredPins()
  return pins.find((p) => p.id === pinId) || null
}

export function updatePin(
  pinId: string,
  updates: Partial<
    Pick<
      Pin,
      | "title"
      | "description"
      | "category"
      | "image"
      | "media"
      | "images"
      | "medias"
      | "likes"
      | "reactions"
      | "favorites"
      | "userAvatar"
    >
  >,
): Pin | null {
  const pins = getStoredPins()
  const pinIndex = pins.findIndex((p) => p.id === pinId)

  if (pinIndex === -1) return null

  pins[pinIndex] = {
    ...pins[pinIndex],
    ...updates,
  }

  setStoredPins(pins)
  return pins[pinIndex]
}

export function deletePin(pinId: string): boolean {
  const pins = getStoredPins()
  const filteredPins = pins.filter((p) => p.id !== pinId)

  if (filteredPins.length === pins.length) {
    return false // Pin not found
  }

  setStoredPins(filteredPins)
  return true
}

// Daily reset function - removes pins older than 24 hours
export function performDailyReset(): void {
  const now = new Date()
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const pins = getAllPins()
  const activePins = pins.filter((pin) => {
    const pinDate = new Date(pin.createdAt)
    return pinDate > twentyFourHoursAgo
  })

  localStorage.setItem(STORAGE_KEY, JSON.stringify(activePins))
}

// Check and perform daily reset if needed
export function checkAndResetDaily(): void {
  const lastResetKey = "lastDailyReset"
  const lastReset = localStorage.getItem(lastResetKey)
  const today = getLocalDateString()

  if (lastReset !== today) {
    performDailyReset()
    localStorage.setItem(lastResetKey, today)
  }
}

export function toggleLike(pinId: string, userId: string): Pin | null {
  const pins = getStoredPins()
  const pinIndex = pins.findIndex((p) => p.id === pinId)

  if (pinIndex === -1) return null

  const pin = pins[pinIndex]

  if (!pin.likes) {
    pin.likes = []
  }

  if (!pin.reactions) {
    pin.reactions = {}
  }

  const likeIndex = pin.likes.indexOf(userId)

  if (likeIndex === -1) {
    // User hasn't liked yet, add like
    pin.likes.push(userId)
    pin.reactions[userId] = "like" // Also add to reactions
  } else {
    // User already liked, remove like
    pin.likes.splice(likeIndex, 1)
    delete pin.reactions[userId] // Also remove from reactions
  }

  setStoredPins(pins)
  return pin
}

export function toggleReaction(pinId: string, userId: string, reactionType: ReactionType): Pin | null {
  const pins = getStoredPins()
  const pinIndex = pins.findIndex((p) => p.id === pinId)

  if (pinIndex === -1) return null

  const pin = pins[pinIndex]

  // Initialize reactions object if it doesn't exist (backward compatibility)
  if (!pin.reactions) {
    pin.reactions = {}
  }

  // If user already has this reaction, remove it (toggle off)
  if (pin.reactions[userId] === reactionType) {
    delete pin.reactions[userId]
  } else {
    // Otherwise, set or update the reaction
    pin.reactions[userId] = reactionType
  }

  setStoredPins(pins)
  return pin
}

export function getReactionCounts(pin: Pin): Record<ReactionType, number> {
  const counts: Record<ReactionType, number> = {
    like: 0,
    love: 0,
    haha: 0,
    wow: 0,
    sad: 0,
    angry: 0,
  }

  if (!pin.reactions) return counts

  Object.values(pin.reactions).forEach((reaction) => {
    counts[reaction]++
  })

  return counts
}

export function getTotalReactionCount(pin: Pin): number {
  if (!pin.reactions) return 0
  return Object.keys(pin.reactions).length
}

export function toggleFavorite(pinId: string, userId: string): Pin | null {
  const pins = getStoredPins()
  const pinIndex = pins.findIndex((p) => p.id === pinId)

  if (pinIndex === -1) return null

  const pin = pins[pinIndex]

  if (!pin.favorites) {
    pin.favorites = []
  }

  const favoriteIndex = pin.favorites.indexOf(userId)

  if (favoriteIndex === -1) {
    pin.favorites.push(userId)
  } else {
    pin.favorites.splice(favoriteIndex, 1)
  }

  setStoredPins(pins)
  return pin
}

export function toggleCommentLike(pinId: string, commentId: string, userId: string): Comment | null {
  const pins = getStoredPins()
  const pinIndex = pins.findIndex((p) => p.id === pinId)

  if (pinIndex === -1) return null

  const pin = pins[pinIndex]
  const commentIndex = pin.comments.findIndex((c) => c.id === commentId)

  if (commentIndex === -1) return null

  const comment = pin.comments[commentIndex]

  if (!comment.likes) {
    comment.likes = []
  }

  const likeIndex = comment.likes.indexOf(userId)

  if (likeIndex === -1) {
    comment.likes.push(userId)
  } else {
    comment.likes.splice(likeIndex, 1)
  }

  setStoredPins(pins)
  return comment
}

export function deleteComment(pinId: string, commentId: string): boolean {
  const pins = getStoredPins()
  const pinIndex = pins.findIndex((p) => p.id === pinId)

  if (pinIndex === -1) return false

  const pin = pins[pinIndex]
  const initialLength = pin.comments.length

  // Remove the comment and all its replies
  pin.comments = pin.comments.filter((c) => c.id !== commentId && c.parentId !== commentId)

  if (pin.comments.length === initialLength) {
    return false // Comment not found
  }

  setStoredPins(pins)
  return true
}

export function getFavoritePins(userId: string): Pin[] {
  const pins = getStoredPins()
  return pins.filter((pin) => pin.favorites && pin.favorites.includes(userId))
}

export function migratePinDatesToLocal(): void {
  const MIGRATION_KEY = "pins_date_migration_v1"

  // Check if migration has already been run
  if (typeof window === "undefined") return

  const migrationDone = localStorage.getItem(MIGRATION_KEY)
  if (migrationDone === "true") {
    return // Migration already completed
  }

  console.log("[v0] Running pin date migration to fix timezone issues...")

  const pins = getStoredPins()
  let migratedCount = 0

  pins.forEach((pin) => {
    // Recalculate the date field using local timezone
    const createdDate = new Date(pin.createdAt)
    const localDateString = getLocalDateString(createdDate)

    // Update the date field
    if (pin.date !== localDateString) {
      pin.date = localDateString
      migratedCount++
    }
  })

  if (migratedCount > 0) {
    setStoredPins(pins)
    console.log(`[v0] Migrated ${migratedCount} pins to use local timezone dates`)
  }

  // Mark migration as complete
  localStorage.setItem(MIGRATION_KEY, "true")
}
