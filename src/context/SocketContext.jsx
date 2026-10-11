import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react"
import { io } from "socket.io-client"
import { AuthContext } from "./AuthContext"

export const SocketContext = createContext()

export const SocketProvider = ({ children }) => {
  const { token, isAuthenticated } = useContext(AuthContext)
  const [notifications, setNotifications] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [activeToast, setActiveToast] = useState(null)
  const [lastEvent, setLastEvent] = useState(null)
  const socketRef = useRef(null)

  // Auto-dismiss floating toast after 6 seconds
  const showToast = useCallback((toast) => {
    setActiveToast(toast)
    setTimeout(() => {
      setActiveToast((current) => (current?.id === toast.id ? null : current))
    }, 6000)
  }, [])

  useEffect(() => {
    // If user is not authenticated or token is absent, ensure socket is disconnected cleanly
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
      setIsConnected(false)
      setNotifications([])
      setActiveToast(null)
      return
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000"

    // Connect to WebSocket server passing JWT authentication token
    const socket = io(socketUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketRef.current = socket

    socket.on("connect", () => {
      setIsConnected(true)
    })

    socket.on("disconnect", () => {
      setIsConnected(false)
    })

    socket.on("connect_error", (err) => {
      console.warn("WebSocket connection notice:", err.message)
      setIsConnected(false)
    })

    // Feature A: Admin real-time notification for new adoption applications
    socket.on("new_adoption_application", (data) => {
      const newNotif = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        type: "new_application",
        title: "New Adoption Request 🐾",
        message: `${data.applicantName} applied to adopt ${data.petName}.`,
        petName: data.petName,
        applicantName: data.applicantName,
        status: data.status || "Pending",
        data,
        read: false,
        timestamp: new Date(),
      }

      setNotifications((prev) => [newNotif, ...prev])
      setLastEvent({ type: "new_application", data, timestamp: Date.now() })
      showToast(newNotif)
    })

    // Feature B: Applicant real-time notification for status updates (Approved/Rejected)
    socket.on("adoption_status_updated", (data) => {
      const isApproved = data.status === "Approved"
      const newNotif = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        type: "status_update",
        title: isApproved ? "Application Approved! 🎉" : "Application Status Updated 📋",
        message: `Your adoption application for "${data.petName}" was ${data.status.toLowerCase()}.`,
        petName: data.petName,
        status: data.status,
        data,
        read: false,
        timestamp: new Date(),
      }

      setNotifications((prev) => [newNotif, ...prev])
      setLastEvent({ type: "status_update", data, timestamp: Date.now() })
      showToast(newNotif)
    })

    // Clean up event listeners and connection when unmounting or switching auth
    return () => {
      socket.off("connect")
      socket.off("disconnect")
      socket.off("connect_error")
      socket.off("new_adoption_application")
      socket.off("adoption_status_updated")
      socket.disconnect()
      socketRef.current = null
      setIsConnected(false)
    }
  }, [token, isAuthenticated, showToast])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const dismissToast = () => {
    setActiveToast(null)
  }

  const value = {
    notifications,
    unreadCount,
    isConnected,
    activeToast,
    lastEvent,
    markAllAsRead,
    markAsRead,
    clearNotifications,
    dismissToast,
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}
