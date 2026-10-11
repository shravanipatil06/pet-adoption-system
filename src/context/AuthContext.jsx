import { createContext, useState, useEffect } from "react"
import { API_BASE_URL } from "../config/api"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // User logout
  const logout = () => {
    setUser(null)
    setToken(null)
    setError(null)
    localStorage.removeItem("pethaven_token")
    localStorage.removeItem("pethaven_user")
  }

  // Load user & token from localStorage on initial render
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("pethaven_token")
      const storedUser = localStorage.getItem("pethaven_user")

      if (storedToken) {
        setToken(storedToken)
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser))
          } catch (e) {
            console.error("Failed to parse stored user", e)
          }
        }

        // Verify token with backend /api/auth/me
        try {
          const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          })
          const data = await res.json()
          if (res.ok && data.success) {
            setUser(data.user)
            localStorage.setItem("pethaven_user", JSON.stringify(data.user))
          } else {
            // Token expired or invalid
            logout()
          }
        } catch (err) {
          // If server offline, keep local user state temporarily
          console.warn("Could not verify session with backend:", err.message)
        }
      }
      setLoading(false)
    }

    initializeAuth()
  }, [])

  // User registration
  const register = async (name, email, password) => {
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        const errorMsg = data.errors ? data.errors.join(", ") : (data.message || "Registration failed")
        setError(errorMsg)
        return { success: false, message: errorMsg }
      }

      setToken(data.token)
      setUser(data.user)
      localStorage.setItem("pethaven_token", data.token)
      localStorage.setItem("pethaven_user", JSON.stringify(data.user))

      return { success: true, message: data.message }
    } catch (err) {
      const msg = err.message || "Network error during registration"
      setError(msg)
      return { success: false, message: msg }
    }
  }

  // User login
  const login = async (email, password) => {
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        const errorMsg = data.errors ? data.errors.join(", ") : (data.message || "Invalid credentials")
        setError(errorMsg)
        return { success: false, message: errorMsg }
      }

      setToken(data.token)
      setUser(data.user)
      localStorage.setItem("pethaven_token", data.token)
      localStorage.setItem("pethaven_user", JSON.stringify(data.user))

      return { success: true, message: data.message }
    } catch (err) {
      const msg = err.message || "Network error during login"
      setError(msg)
      return { success: false, message: msg }
    }
  }

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === "admin",
    register,
    login,
    logout,
    setError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
