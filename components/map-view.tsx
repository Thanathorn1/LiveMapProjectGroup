"use client"

import { useEffect, useState } from "react"
import { PIN_CATEGORIES, type Pin, type PinCategory } from "@/lib/pins"

interface MapViewProps {
  pins: Pin[]
  onMapClick?: (lat: number, lng: number) => void
  onPinClick?: (pin: Pin) => void
  selectedCategory?: PinCategory | null
}

export function MapView({ pins, onMapClick, onPinClick, selectedCategory }: MapViewProps) {
  const [mounted, setMounted] = useState(false)
  const [mapComponents, setMapComponents] = useState<any>(null)

  useEffect(() => {
    const loadMap = async () => {
      if (typeof window !== "undefined") {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        link.crossOrigin = ""
        document.head.appendChild(link)

        const L = await import("leaflet")
        const ReactLeaflet = await import("react-leaflet")

        // Fix for default marker icon
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "/marker-icon-2x.png",
          iconUrl: "/marker-icon.png",
          shadowUrl: "/marker-shadow.png",
        })

        setMapComponents({
          MapContainer: ReactLeaflet.MapContainer,
          TileLayer: ReactLeaflet.TileLayer,
          Marker: ReactLeaflet.Marker,
          Popup: ReactLeaflet.Popup,
          useMapEvents: ReactLeaflet.useMapEvents,
          Icon: L.Icon,
        })
        setMounted(true)
      }
    }

    loadMap()
  }, [])

  if (!mounted || !mapComponents) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">กำลังโหลดแผนที่...</p>
        </div>
      </div>
    )
  }

  const { MapContainer, TileLayer, Marker, Popup, useMapEvents, Icon } = mapComponents

  function MapClickHandler({
    onMapClick,
  }: {
    onMapClick?: (lat: number, lng: number) => void
  }) {
    useMapEvents({
      click: (e: any) => {
        if (onMapClick) {
          onMapClick(e.latlng.lat, e.latlng.lng)
        }
      },
    })
    return null
  }

  function createCustomIcon(category: PinCategory) {
    const categoryInfo = PIN_CATEGORIES[category]
    const svgString = `
      <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26c0-8.837-7.163-16-16-16z" fill="${categoryInfo.color}"/>
        <circle cx="16" cy="16" r="8" fill="white"/>
        <text x="16" y="20" fontSize="12" textAnchor="middle" fill="${categoryInfo.color}">${categoryInfo.icon}</text>
      </svg>
    `
    return new Icon({
      iconUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`,
      iconSize: [32, 42],
      iconAnchor: [16, 42],
      popupAnchor: [0, -42],
    })
  }

  const defaultCenter: [number, number] = [18.8965888, 99.0172146] // Bangkok
  const filteredPins = selectedCategory ? pins.filter((pin) => pin.category === selectedCategory) : pins

  return (
    <MapContainer center={defaultCenter} zoom={15} className="w-full h-full" zoomControl={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler onMapClick={onMapClick} />
      {filteredPins.map((pin) => (
        <Marker
          key={pin.id}
          position={[pin.lat, pin.lng]}
          icon={createCustomIcon(pin.category)}
          eventHandlers={{
            click: () => {
              if (onPinClick) {
                onPinClick(pin)
              }
            },
          }}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-sm mb-1">{pin.title}</h3>
              <p className="text-xs text-gray-600 mb-2">{pin.description}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{PIN_CATEGORIES[pin.category].label}</span>
                <span>•</span>
                <span>{pin.userName}</span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
