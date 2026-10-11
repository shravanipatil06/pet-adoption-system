/**
 * Middleware for handling 404 (Not Found) routes
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  })
}

/**
 * Centralized error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode
  let message = err.message || "Internal Server Error"

  // Handle Mongoose CastError (invalid ObjectId or numeric ID format)
  if (err.name === "CastError") {
    statusCode = 400
    message = `Invalid format for field '${err.path}'`
  }

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 400
    const field = Object.keys(err.keyValue || {})[0] || "field"
    message = `Duplicate value entered for ${field}`
  }

  // Handle Mongoose ValidationError
  if (err.name === "ValidationError") {
    statusCode = 400
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ")
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  })
}
