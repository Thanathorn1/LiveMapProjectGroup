"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Mail, Lock, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const result = await login(email, password)

    if (result.success) {
      router.push("/map")
    } else {
      setError(result.error || "เกิดข้อผิดพลาด")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Branding with MJU background image */}
      <div className="relative lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url(/bg_image/mju-background.jpg)",
          }}
        />

        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/85 to-accent/90" />

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div
            className="absolute bottom-20 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse-slow"
            style={{ animationDelay: "1s" }}
          ></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-float"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <MapPin className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">LiveMap</h1>
          </div>

          <div className="max-w-md">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight text-balance drop-shadow-lg">
              เชื่อมต่อชุมชน
              <br />
              แชร์เรื่องราว
            </h2>
            <p className="text-lg text-white/95 leading-relaxed text-pretty drop-shadow-md">
              แพลตฟอร์มแผนที่สดที่ให้คุณอัพเดตและติดตามเหตุการณ์ในพื้นที่ของคุณแบบเรียลไทม์
            </p>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="relative z-10 grid grid-cols-3 gap-3 mt-8">
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/30 shadow-lg">
            <div className="flex justify-center text-3xl font-bold text-white mb-1 drop-shadow-md">24/7</div>
            <div className="text-sm text-white/90 drop-shadow-sm text-center">อัพเดตตลอดเวลา</div>
          </div>
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/30 shadow-lg">
            <div className="flex justify-center text-3xl font-bold text-white mb-1 drop-shadow-md">100%</div>
            <div className="text-sm text-white/90 drop-shadow-sm text-center">ฟรี</div>
          </div>
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/30 shadow-lg">
            <div className="flex justify-center text-3xl font-bold text-white mb-1 drop-shadow-md">∞</div>
            <div className="text-sm text-white/90 drop-shadow-sm text-center">โพสต์ไม่จำกัด</div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 bg-background">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-foreground mb-2">ยินดีต้อนรับ</h3>
            <p className="text-muted-foreground">เข้าสู่ระบบเพื่อดูแผนที่และอัพเดตเหตุการณ์</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

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
              <Label htmlFor="password" className="text-sm font-medium">
                รหัสผ่าน
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 text-base"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  กำลังเข้าสู่ระบบ...
                </div>
              ) : (
                "เข้าสู่ระบบ"
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              ยังไม่มีบัญชี?{" "}
              <Link href="/signup" className="text-primary font-semibold hover:underline">
                สมัครสมาชิก
              </Link>
            </p>
          </div>

          {/* Demo credentials hint */}
          <div className="mt-8 p-4 bg-muted rounded-xl">
            <p className="text-sm text-muted-foreground text-center">💡 สำหรับทดสอบ: สมัครสมาชิกใหม่หรือใช้อีเมลที่เคยสมัครไว้</p>
          </div>
        </div>
      </div>
    </div>
  )
}