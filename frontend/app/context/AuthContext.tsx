"use client"

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react"
import { usePathname, useRouter } from "next/navigation"
import apiClient, {
  updateApiToken,
  clearApiToken,
} from "../../utils/axiosInstance"
import axios from "axios"
import { useToast } from "@/components/ui/use-toast"

// Define User and LoginCredentials interfaces
interface User {
  id: string
  email: string
  role: "user" | "admin"
  username?: string
  firstName?: string
  lastName?: string
  photoURL?: string
}

interface LoginCredentials {
  email: string
  password: string
}

interface AuthContextType {
  user: User | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Routes that don't require authentication checks
const PUBLIC_PATHS = [
  "/auth/login",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-signup",
]
let inMemoryToken: string | null = null

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  // Helper to clear all authentication state
  const clearAuthAndLogout = useCallback(() => {
    inMemoryToken = null
    clearApiToken()
    setIsAuthenticated(false)
    setUser(null)
    localStorage.removeItem("user")
  }, [])

  // The core logic for session management
  const initializeAuth = useCallback(async () => {
    // Don't run on public paths
    if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    try {
      // First, check if we have a stored user in localStorage
      const storedUser = localStorage.getItem("user")
      if (!storedUser) {
        // No stored user, so no need to attempt refresh
        console.info("[AuthContext] No stored user found, skipping refresh attempt.")
        clearAuthAndLogout()
        setIsLoading(false)
        return
      }

      // Attempt to get a new access token using the httpOnly refresh token
      const { data } = await apiClient.post(
        "/api/auth/refresh-token",
        {},
        { withCredentials: true },
      )

      if (data.accessToken) {
        inMemoryToken = data.accessToken
        updateApiToken(inMemoryToken)

        // With a valid token, get the user's data
        const refreshedUserResponse = await apiClient.get("/api/auth/me")
        const fetchedUser = refreshedUserResponse.data.user

        if (fetchedUser?.id) {
          setUser(fetchedUser)
          // Store only user data, not the access token
          localStorage.setItem("user", JSON.stringify({
            id: fetchedUser.id,
            email: fetchedUser.email,
            role: fetchedUser.role,
            username: fetchedUser.username,
            firstName: fetchedUser.firstName,
            lastName: fetchedUser.lastName,
            photoURL: fetchedUser.photoURL
          }))
          setIsAuthenticated(true)
          setError(null)
        } else {
          // This case is unlikely but a good safeguard
          console.warn(
            "[AuthContext] '/api/auth/me' returned no valid user data.",
          )
          clearAuthAndLogout()
        }
      } else {
        console.warn(
          "[AuthContext] Refresh token endpoint did not provide an access token.",
        )
        clearAuthAndLogout()
      }
    } catch (e) {
      // This catch block handles failed refresh attempts (e.g., expired/invalid refresh token)
      console.info(
        "[AuthContext] Silent refresh failed. User needs to log in.",
      )
      clearAuthAndLogout()
    } finally {
      setIsLoading(false)
    }
  }, [pathname, clearAuthAndLogout])

  // Listen for security events
  useEffect(() => {
    const handleAuthFailure = () => {
      console.warn('[AuthContext] Security event detected, logging out user');
      clearAuthAndLogout();
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please log in again.",
        variant: "destructive",
      });
      router.push("/auth/login");
    };

    // Listen for auth-failure events from axios interceptor
    window.addEventListener('auth-failure', handleAuthFailure);

    return () => {
      window.removeEventListener('auth-failure', handleAuthFailure);
    };
  }, [clearAuthAndLogout, router, toast]);

  // Run the initialization logic when the component mounts or path changes
  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  // Login function
  const login = async (credentials: LoginCredentials) => {
    setError(null)

    try {
      const response = await apiClient.post("/api/auth/login", credentials, {
        withCredentials: true,
      })
      const { user, accessToken } = response.data

      if (user && accessToken) {
        inMemoryToken = accessToken
        updateApiToken(accessToken)
        setUser(user)
        // Store only user data, not the access token
        localStorage.setItem("user", JSON.stringify({
          id: user.id,
          email: user.email,
          role: user.role,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          photoURL: user.photoURL
        }))
        setIsAuthenticated(true)
        setError(null)

        toast({
          title: "Login Successful",
          description: "Welcome back!",
          variant: "default",
        })

        // Redirect based on role
        if (user.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/")
        }
      } else {
        throw new Error("Login response missing user or token.")
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "An error occurred."
      setError(errorMessage)
      console.error("Login failed:", err)
      throw new Error(errorMessage) // Re-throw to inform the component
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await apiClient.post("/api/auth/logout", {}, { withCredentials: true })
    } catch (e) {
      console.error("Logout API call failed, but logging out client-side anyway.", e)
    } finally {
      clearAuthAndLogout()
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      })
      router.push("/auth/login")
    }
  }

  // The value provided to children
  const value = {
    user,
    login,
    logout,
    isLoading,
    error,
    isAuthenticated,
    setUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use the AuthContext
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
