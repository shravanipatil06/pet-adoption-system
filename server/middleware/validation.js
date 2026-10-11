// Input validation middleware for Pet endpoints

const VALID_GENDERS = ["Male", "Female"]
const VALID_TYPES = ["Dog", "Cat", "Other"]

/**
 * Helper to validate a URL or image path string
 */
const isValidImageUrl = (url) => {
  if (typeof url !== "string" || !url.trim()) return false
  // Check basic URL format (http/https) or local path
  try {
    const parsed = new URL(url)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    // If not a full URL, check if it's a valid relative path/string
    return url.trim().length > 3
  }
}

/**
 * Middleware to validate Pet creation (POST /api/pets)
 */
export const validateCreatePet = (req, res, next) => {
  const { name, breed, age, gender, type, image } = req.body
  const errors = []

  if (!name || typeof name !== "string" || !name.trim()) {
    errors.push("Pet name is required and must be a valid non-empty text string.")
  }

  if (!breed || typeof breed !== "string" || !breed.trim()) {
    errors.push("Pet breed is required and must be a valid non-empty text string.")
  }

  if (age === undefined || age === null || typeof Number(age) !== "number" || isNaN(Number(age)) || Number(age) < 0) {
    errors.push("Pet age is required and must be a non-negative number.")
  }

  if (!gender || !VALID_GENDERS.includes(gender)) {
    errors.push(`Pet gender is required and must be one of: ${VALID_GENDERS.join(", ")}.`)
  }

  if (!type || !VALID_TYPES.includes(type)) {
    errors.push(`Pet type is required and must be one of: ${VALID_TYPES.join(", ")}.`)
  }

  if (!image || !isValidImageUrl(image)) {
    errors.push("Pet image is required and must be a valid image URL or path.")
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    })
  }

  next()
}

/**
 * Middleware to validate Pet update (PUT /api/pets/:id)
 */
export const validateUpdatePet = (req, res, next) => {
  const { name, breed, age, gender, type, image } = req.body
  const errors = []

  if (name !== undefined && (typeof name !== "string" || !name.trim())) {
    errors.push("Pet name must be a valid non-empty text string.")
  }

  if (breed !== undefined && (typeof breed !== "string" || !breed.trim())) {
    errors.push("Pet breed must be a valid non-empty text string.")
  }

  if (age !== undefined && (typeof Number(age) !== "number" || isNaN(Number(age)) || Number(age) < 0)) {
    errors.push("Pet age must be a non-negative number.")
  }

  if (gender !== undefined && !VALID_GENDERS.includes(gender)) {
    errors.push(`Pet gender must be one of: ${VALID_GENDERS.join(", ")}.`)
  }

  if (type !== undefined && !VALID_TYPES.includes(type)) {
    errors.push(`Pet type must be one of: ${VALID_TYPES.join(", ")}.`)
  }

  if (image !== undefined && !isValidImageUrl(image)) {
    errors.push("Pet image must be a valid image URL or path.")
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    })
  }

  next()
}

/**
 * Middleware to validate Registration (POST /api/auth/register)
 */
export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body
  const errors = []

  if (!name || typeof name !== "string" || !name.trim()) {
    errors.push("Name is required and must be a non-empty text string.")
  }

  if (!email || typeof email !== "string" || !email.trim()) {
    errors.push("Email is required.")
  } else {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
    if (!emailRegex.test(email)) {
      errors.push("Please provide a valid email address.")
    }
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    errors.push("Password is required and must be at least 6 characters long.")
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    })
  }

  next()
}

/**
 * Middleware to validate Login (POST /api/auth/login)
 */
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body
  const errors = []

  if (!email || typeof email !== "string" || !email.trim()) {
    errors.push("Email is required.")
  }

  if (!password || typeof password !== "string" || !password.trim()) {
    errors.push("Password is required.")
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    })
  }

  next()
}

/**
 * Middleware to validate Adoption Application submission
 */
export const validateAdoptionApplication = (req, res, next) => {
  const { petId, phone, address, reasonForAdoption, previousPetExperience, livingSituation } = req.body
  const errors = []

  if (!petId) {
    errors.push("Pet ID is required.")
  }

  if (!phone || typeof phone !== "string" || !phone.trim()) {
    errors.push("Phone number is required.")
  }

  if (!address || typeof address !== "string" || !address.trim()) {
    errors.push("Residence address is required.")
  }

  if (!reasonForAdoption || typeof reasonForAdoption !== "string" || !reasonForAdoption.trim()) {
    errors.push("Reason for adoption is required.")
  }

  if (!previousPetExperience || typeof previousPetExperience !== "string" || !previousPetExperience.trim()) {
    errors.push("Previous pet experience details are required.")
  }

  if (!livingSituation || typeof livingSituation !== "string" || !livingSituation.trim()) {
    errors.push("Living situation details are required.")
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    })
  }

  next()
}
