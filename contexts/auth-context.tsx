"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import {
  type User,
  type AuthState,
  getStoredAuth,
  login as authLogin,
  signup as authSignup,
  logout as authLogout,
  updateProfile as authUpdateProfile,
} from "@/lib/auth"

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (
    email: string,
    password: string,
    name: string,
    phone?: string,
  ) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({ user: null, isAuthenticated: false })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load auth state from storage on mount
    const stored = getStoredAuth()
    setAuthState(stored)
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const result = await authLogin(email, password)
    if (result.success && result.user) {
      setAuthState({ user: result.user, isAuthenticated: true })
    }
    return { success: result.success, error: result.error }
  }

  const signup = async (email: string, password: string, name: string, phone?: string) => {
    const result = await authSignup(email, password, name, phone)
    if (result.success && result.user) {
      setAuthState({ user: result.user, isAuthenticated: true })
    }
    return { success: result.success, error: result.error }
  }

  const logout = () => {
    authLogout()
    setAuthState({ user: null, isAuthenticated: false })
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!authState.user) {
      return { success: false, error: "ไม่พบผู้ใช้งาน" }
    }

    const result = await authUpdateProfile(authState.user.id, updates)
    if (result.success && result.user) {
      setAuthState({ ...authState, user: result.user })
    }
    return { success: result.success, error: result.error }
  }

  return (
    <AuthContext.Provider value={{ ...authState, login, signup, logout, updateProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
