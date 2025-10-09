import Image from "next/image"
import { Play } from "lucide-react"

interface MediaItem {
  type: "image" | "video" | "gif"
  data: string
}

interface PostMediaGridProps {
  image?: string // Added old single image field for backward compatibility
  media?: MediaItem // Added old single media field for backward compatibility
  images?: string[]
  medias?: MediaItem[]
  title: string
}

export function PostMediaGrid({ image, media, images = [], medias = [], title }: PostMediaGridProps) {
  const allMedia: MediaItem[] = [
    // Add old single image if it exists
    ...(image ? [{ type: "image" as const, data: image }] : []),
    // Add old single media if it exists
    ...(media ? [media] : []),
    // Add new array fields
    ...images.map((img) => ({ type: "image" as const, data: img })),
    ...medias,
  ]

  if (allMedia.length === 0) return null

  const mediaCount = allMedia.length
  const displayMedia = allMedia.slice(0, 4)
  const remainingCount = mediaCount - 4

  // Single media - full width
  if (mediaCount === 1) {
    const media = allMedia[0]
    return (
      <div className="relative w-full aspect-video overflow-hidden bg-muted">
        {media.type === "video" || media.type === "gif" ? (
          <>
            <video src={media.data} className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                <Play className="w-6 h-6 text-primary fill-primary ml-0.5" />
              </div>
            </div>
          </>
        ) : (
          <Image
            src={media.data || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
      </div>
    )
  }

  // Two media - side by side
  if (mediaCount === 2) {
    return (
      <div className="grid grid-cols-2 gap-1 w-full aspect-video overflow-hidden bg-muted">
        {displayMedia.map((media, index) => (
          <div key={index} className="relative w-full h-full overflow-hidden">
            {media.type === "video" || media.type === "gif" ? (
              <>
                <video src={media.data} className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="w-5 h-5 text-primary fill-primary ml-0.5" />
                  </div>
                </div>
              </>
            ) : (
              <Image
                src={media.data || "/placeholder.svg"}
                alt={`${title} ${index + 1}`}
                fill
                className="object-cover"
              />
            )}
          </div>
        ))}
      </div>
    )
  }

  // Three media - first full width, two below
  if (mediaCount === 3) {
    return (
      <div className="w-full aspect-video overflow-hidden bg-muted">
        <div className="grid grid-rows-2 gap-1 h-full">
          {/* First media - full width */}
          <div className="relative w-full overflow-hidden">
            {displayMedia[0].type === "video" || displayMedia[0].type === "gif" ? (
              <>
                <video src={displayMedia[0].data} className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="w-5 h-5 text-primary fill-primary ml-0.5" />
                  </div>
                </div>
              </>
            ) : (
              <Image
                src={displayMedia[0].data || "/placeholder.svg"}
                alt={`${title} 1`}
                fill
                className="object-cover"
              />
            )}
          </div>
          {/* Two media below */}
          <div className="grid grid-cols-2 gap-1">
            {displayMedia.slice(1).map((media, index) => (
              <div key={index + 1} className="relative w-full h-full overflow-hidden">
                {media.type === "video" || media.type === "gif" ? (
                  <>
                    <video src={media.data} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="w-4 h-4 text-primary fill-primary ml-0.5" />
                      </div>
                    </div>
                  </>
                ) : (
                  <Image
                    src={media.data || "/placeholder.svg"}
                    alt={`${title} ${index + 2}`}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Four or more media - 2x2 grid
  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-1 w-full aspect-video overflow-hidden bg-muted">
      {displayMedia.map((media, index) => (
        <div key={index} className="relative w-full h-full overflow-hidden">
          {media.type === "video" || media.type === "gif" ? (
            <>
              <video src={media.data} className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                  <Play className="w-4 h-4 text-primary fill-primary ml-0.5" />
                </div>
              </div>
            </>
          ) : (
            <Image src={media.data || "/placeholder.svg"} alt={`${title} ${index + 1}`} fill className="object-cover" />
          )}
          {/* Show "+X more" overlay on the last item if there are more than 4 */}
          {index === 3 && remainingCount > 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">+{remainingCount}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
