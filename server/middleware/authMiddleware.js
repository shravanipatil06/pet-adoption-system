import jwt from "jsonwebtoken"
import User from "../models/User.js"

/**
 * Middleware to protect routes and verify JWT authentication
 */
export const protect = async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1]

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret")

      // Get user from the token (exclude password)
      req.user = await User.findById(decoded.id).select("-password")

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not found or token no longer valid",
        })
      }

      return next()
    } catch {
      return res.status(401).json({
        success: false,
        message: "Not authorized, invalid or expired token",
      })
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token provided",
    })
  }
}

/**
 * Middleware to restrict access based on user roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user?.role || "guest"}' is not authorized to perform this action`,
      })
    }
    next()
  }
}
