"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MapPin, User, LogOut, Settings } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import MaejoLogo from "/public/mju_logo/mju_logo.jpg"

export function AppHeader() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handleChangeImage = () => {
    setIsOpen(false)
    router.push("/profile")
  }

  return (
    <header className="bg-gradient-to-r from-primary via-primary/95 to-accent sticky top-0 z-[1100] shadow-lg border-b border-primary/20">
      <div className="px-4 py-3 flex items-center justify-between">
        <Link href="/map" className="flex justify-center items-center gap-3 group">
          <div className="w-11 h-11 bg-white rounded-3xl flex items-center justify-center shadow-5xl group-hover:shadow-lg transition-all group-hover:scale-105">
            <Image src={MaejoLogo} alt="Maejo_logo" className="flex justify-center items-center w-10 h-10"/>
          </div>
          <span className="text-xl font-bold text-white drop-shadow-sm">LiveMap</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold leading-tight text-white drop-shadow-sm">{user?.name}</span>
            <span className="text-xs text-white/80 leading-tight">{user?.email}</span>
          </div>

          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <button className="focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full">
                <Avatar className="h-13 w-13 border-2 border-white/40 cursor-pointer hover:border-white transition-all hover:shadow-lg">
                  {user?.avatar && <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />}
                  <AvatarFallback className="bg-white/20 backdrop-blur-sm text-white font-semibold">
                    {user?.name ? getInitials(user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>โปรไฟล์</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>ตั้งค่า</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>ออกจากระบบ</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
