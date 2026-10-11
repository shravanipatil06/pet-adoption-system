/**
 * Centralized API configuration for Pet Haven
 * Uses VITE_API_BASE_URL when configured (e.g. deployed to Vercel targeting Render backend),
 * falling back to http://localhost:5000 for local development.
 */

const rawApiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"

// Strip any trailing slashes to guarantee clean endpoint concatenation without double slashes
export const API_BASE_URL = rawApiUrl.replace(/\/+$/, "")
