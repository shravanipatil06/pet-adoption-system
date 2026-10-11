import { Server } from "socket.io"
import jwt from "jsonwebtoken"
import User from "../models/User.js"

let ioInstance = null

/**
 * Initialize Socket.IO with HTTP server and security configuration
 * @param {import('http').Server} httpServer
 */
export const initSocket = (httpServer) => {
  const defaultOrigins = [
    "https://pet-adoption-system-eta.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174",
  ]

  const clientUrlOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",")
        .map((s) => s.trim().replace(/\/+$/, ""))
        .filter(Boolean)
    : []

  const allowedOrigins = Array.from(new Set([...defaultOrigins, ...clientUrlOrigins]))

  ioInstance = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
    // Ping configuration for connection health & auto-reconnect
    pingTimeout: 20000,
    pingInterval: 25000,
  })

  // Socket.IO Authentication Middleware (JWT)
  ioInstance.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        (socket.handshake.headers?.authorization &&
        socket.handshake.headers.authorization.startsWith("Bearer ")
          ? socket.handshake.headers.authorization.split(" ")[1]
          : null)

      if (!token) {
        return next(new Error("Authentication error: Token required"))
      }

      // Verify JWT token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "fallback_secret"
      )

      // Fetch user from DB to verify active existence and current role
      const user = await User.findById(decoded.id).select("-password")

      if (!user) {
        return next(new Error("Authentication error: User not found"))
      }

      // Securely attach user identity derived from verified JWT
      socket.user = {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      }

      return next()
    } catch {
      return next(new Error("Authentication error: Invalid or expired token"))
    }
  })

  // Connection Handler
  ioInstance.on("connection", (socket) => {
    const { _id, role } = socket.user

    // Join private room dedicated to this authenticated user
    socket.join(`user:${_id}`)

    // If verified user has admin role, join admin broadcast room
    if (role === "admin") {
      socket.join("admin_room")
    }

    socket.on("disconnect", (_reason) => {
      // Clean disconnection handling without leaking tokens or credentials
    })

    socket.on("error", (err) => {
      console.error(`Socket error for client [${_id}]:`, err?.message || err)
    })
  })

  return ioInstance
}

/**
 * Access the initialized Socket.IO instance
 */
export const getIO = () => {
  if (!ioInstance) {
    throw new Error("Socket.io has not been initialized yet")
  }
  return ioInstance
}

/**
 * Notify all connected administrators of a new adoption application
 * Emitted strictly after MongoDB document creation succeeds
 */
export const notifyAdminsNewApplication = (application) => {
  if (!ioInstance) return

  const payload = {
    applicationId: application._id.toString(),
    applicantName: application.applicantName,
    applicantEmail: application.applicantEmail,
    petId: application.pet?.id || application.pet?._id || null,
    petName: application.pet?.name || "Pet",
    petBreed: application.pet?.breed || "",
    status: application.status,
    createdAt: application.createdAt,
  }

  // Admin clients receive real-time notification
  ioInstance.to("admin_room").emit("new_adoption_application", payload)
}

/**
 * Notify specific applicant user of an application status update (Approved/Rejected)
 * Emitted strictly after MongoDB update succeeds
 */
export const notifyUserStatusUpdate = (userId, application) => {
  if (!ioInstance || !userId) return

  const payload = {
    applicationId: application._id.toString(),
    petId: application.pet?.id || application.pet?._id || null,
    petName: application.pet?.name || "Pet",
    status: application.status,
    updatedAt: application.updatedAt || new Date(),
  }

  // Emits strictly to the private room of the applicant
  ioInstance.to(`user:${userId.toString()}`).emit("adoption_status_updated", payload)
}
