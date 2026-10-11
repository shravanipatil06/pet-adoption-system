import http from "http"
import express from "express"
import cors from "cors"
import helmet from "helmet"
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import { initSocket } from "./config/socket.js"
import petRoutes from "./routes/petRoutes.js"
import authRoutes from "./routes/authRoutes.js"
import adoptionRoutes from "./routes/adoptionRoutes.js"
import { apiLimiter } from "./middleware/security.js"
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js"

dotenv.config()

// Connect to MongoDB
connectDB()

const app = express()

// Security HTTP Headers
app.use(helmet())

// Basic rate limiting for API endpoints
app.use("/api", apiLimiter)

// CORS Configuration
const allowedOrigins = [
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",").map((s) => s.trim()) : []),
  "http://localhost:5173",
  "http://localhost:5174",
]

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
)

// Body Parser Middleware
app.use(express.json({ limit: "10kb" }))

// Health check endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Pet Haven REST API is running securely...",
  })
})

// Mount REST API routes
app.use("/api/auth", authRoutes)
app.use("/api/pets", petRoutes)
app.use("/api/adoptions", adoptionRoutes)

// Error handling middleware for undefined routes (404)
app.use(notFoundHandler)

// Centralized Error Handling Middleware
app.use(errorHandler)

const PORT = process.env.PORT || 5000

// Create HTTP server wrapping Express app to share single port with WebSockets
const server = http.createServer(app)

// Initialize Socket.IO with WebSocket authentication and event handlers
initSocket(server)

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`)
})

