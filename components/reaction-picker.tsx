"use client"

import { motion, AnimatePresence } from "framer-motion"

export type ReactionType = "like" | "love" | "haha" | "wow" | "sad" | "angry"

export interface Reaction {
  type: ReactionType
  emoji: string
  label: string
  color: string
}

export const REACTIONS: Record<ReactionType, Reaction> = {
  like: { type: "like", emoji: "👍", label: "ไลค์", color: "#ef4444" },
  love: { type: "love", emoji: "❤️", label: "ถูกใจ", color: "#ef4444" },
  haha: { type: "haha", emoji: "😂", label: "ฮา", color: "#f59e0b" },
  wow: { type: "wow", emoji: "😮", label: "ว้าว", color: "#f59e0b" },
  sad: { type: "sad", emoji: "😢", label: "เศร้า", color: "#f59e0b" },
  angry: { type: "angry", emoji: "😠", label: "โกรธ", color: "#f97316" },
}

interface ReactionPickerProps {
  show: boolean
  onSelect: (reaction: ReactionType) => void
  currentReaction?: ReactionType | null
}

export function ReactionPicker({ show, onSelect, currentReaction }: ReactionPickerProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.15 }}
          className="absolute bottom-full left-0 mb-2 bg-background border-2 border-border rounded-full shadow-2xl px-2 py-2 flex gap-1 z-[1400] max-w-[calc(100vw-2rem)] overflow-x-auto"
        >
          {(Object.keys(REACTIONS) as ReactionType[]).map((reactionType, index) => {
            const reaction = REACTIONS[reactionType]
            const isSelected = currentReaction === reactionType
            return (
              <motion.button
                key={reactionType}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => onSelect(reactionType)}
                className={`relative w-12 h-12 flex items-center justify-center rounded-full hover:bg-muted transition-all ${
                  isSelected ? "bg-muted" : ""
                }`}
                whileHover={{ scale: 1.3, y: -8 }}
                whileTap={{ scale: 0.9 }}
              >
                <span className="text-2xl">{reaction.emoji}</span>
                {isSelected && (
                  <motion.div
                    layoutId="selected-reaction"
                    className="absolute inset-0 rounded-full border-2"
                    style={{ borderColor: reaction.color }}
                  />
                )}
              </motion.button>
            )
          })}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
