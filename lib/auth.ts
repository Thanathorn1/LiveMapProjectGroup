export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  phone?: string
  facebook?: string
  instagram?: string
  twitter?: string
  line?: string
  bio?: string
  createdAt: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

const AUTH_STORAGE_KEY = "live_map_auth"
const USERS_STORAGE_KEY = "live_map_users"

export function getStoredAuth(): AuthState {
  if (typeof window === "undefined") {
    return { user: null, isAuthenticated: false }
  }

  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error("[v0] Error reading auth from storage:", error)
  }

  return { user: null, isAuthenticated: false }
}

export function setStoredAuth(authState: AuthState): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState))
  } catch (error) {
    console.error("[v0] Error saving auth to storage:", error)
  }
}

export function clearStoredAuth(): void {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  } catch (error) {
    console.error("[v0] Error clearing auth from storage:", error)
  }
}

function getStoredUsers(): User[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error("[v0] Error reading users from storage:", error)
  }

  return []
}

function setStoredUsers(users: User[]): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
  } catch (error) {
    console.error("[v0] Error saving users to storage:", error)
  }
}

export async function login(
  email: string,
  password: string,
): Promise<{ success: boolean; user?: User; error?: string }> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const users = getStoredUsers()
  const user = users.find((u) => u.email === email)

  if (!user) {
    return { success: false, error: "ไม่พบผู้ใช้งาน" }
  }

  // In real app, check password hash
  // For demo, just check if password is not empty
  if (!password) {
    return { success: false, error: "รหัสผ่านไม่ถูกต้อง" }
  }

  const authState: AuthState = {
    user,
    isAuthenticated: true,
  }

  setStoredAuth(authState)

  return { success: true, user }
}

export async function signup(
  email: string,
  password: string,
  name: string,
  phone?: string,
): Promise<{ success: boolean; user?: User; error?: string }> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const users = getStoredUsers()

  // Check if user already exists
  if (users.find((u) => u.email === email)) {
    return { success: false, error: "อีเมลนี้ถูกใช้งานแล้ว" }
  }

  const newUser: User = {
    id: Date.now().toString(),
    email,
    name,
    phone,
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)
  setStoredUsers(users)

  const authState: AuthState = {
    user: newUser,
    isAuthenticated: true,
  }

  setStoredAuth(authState)

  return { success: true, user: newUser }
}

export function logout(): void {
  clearStoredAuth()
}

export async function updateProfile(
  userId: string,
  updates: Partial<User>,
): Promise<{ success: boolean; user?: User; error?: string }> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const users = getStoredUsers()
  const userIndex = users.findIndex((u) => u.id === userId)

  if (userIndex === -1) {
    return { success: false, error: "ไม่พบผู้ใช้งาน" }
  }

  const updatedUser = { ...users[userIndex], ...updates }
  users[userIndex] = updatedUser
  setStoredUsers(users)

  // Update auth state
  const authState = getStoredAuth()
  if (authState.user?.id === userId) {
    setStoredAuth({ ...authState, user: updatedUser })
  }

  return { success: true, user: updatedUser }
}
