import Pet from "../models/Pet.js"
import { seedPetsData } from "../data/seedData.js"

// @desc    Get all pets
// @route   GET /api/pets
// @access  Public
export const getPets = async (req, res, next) => {
  try {
    const pets = await Pet.find({}).sort({ id: 1 })
    res.status(200).json(pets)
  } catch (error) {
    next(error)
  }
}

// @desc    Get single pet by ID
// @route   GET /api/pets/:id
// @access  Public
export const getPetById = async (req, res, next) => {
  try {
    const paramId = req.params.id
    let pet = null

    if (!isNaN(paramId)) {
      pet = await Pet.findOne({ id: Number(paramId) })
    }

    if (!pet && paramId.match(/^[0-9a-fA-F]{24}$/)) {
      pet = await Pet.findById(paramId)
    }

    if (!pet) {
      return res.status(404).json({ success: false, message: "Pet not found" })
    }

    res.status(200).json(pet)
  } catch (error) {
    next(error)
  }
}

// @desc    Create a pet
// @route   POST /api/pets
// @access  Public
export const createPet = async (req, res, next) => {
  try {
    const { name, breed, age, gender, type, image, id } = req.body

    // Auto-generate numeric ID if not provided
    let petId = id
    if (!petId) {
      const lastPet = await Pet.findOne({}).sort({ id: -1 })
      petId = lastPet && lastPet.id ? lastPet.id + 1 : Date.now()
    }

    const newPet = await Pet.create({
      id: petId,
      name,
      breed,
      age: Number(age),
      gender,
      type,
      image,
    })

    res.status(201).json({
      success: true,
      message: "Pet created successfully",
      data: newPet,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update a pet by ID
// @route   PUT /api/pets/:id
// @access  Public
export const updatePet = async (req, res, next) => {
  try {
    const paramId = req.params.id
    let query = {}

    if (!isNaN(paramId)) {
      query = { id: Number(paramId) }
    } else if (paramId.match(/^[0-9a-fA-F]{24}$/)) {
      query = { _id: paramId }
    } else {
      return res.status(400).json({ success: false, message: "Invalid pet ID format" })
    }

    const updatedPet = await Pet.findOneAndUpdate(query, req.body, {
      new: true,
      runValidators: true,
    })

    if (!updatedPet) {
      return res.status(404).json({ success: false, message: "Pet not found" })
    }

    res.status(200).json({
      success: true,
      message: "Pet updated successfully",
      data: updatedPet,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete a pet by ID
// @route   DELETE /api/pets/:id
// @access  Public
export const deletePet = async (req, res, next) => {
  try {
    const paramId = req.params.id
    let query = {}

    if (!isNaN(paramId)) {
      query = { id: Number(paramId) }
    } else if (paramId.match(/^[0-9a-fA-F]{24}$/)) {
      query = { _id: paramId }
    } else {
      return res.status(400).json({ success: false, message: "Invalid pet ID format" })
    }

    const deletedPet = await Pet.findOneAndDelete(query)

    if (!deletedPet) {
      return res.status(404).json({ success: false, message: "Pet not found" })
    }

    res.status(200).json({
      success: true,
      message: "Pet deleted successfully",
      id: paramId,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Seed initial pet data
// @route   POST /api/pets/seed
// @access  Public
export const seedPets = async (req, res, next) => {
  try {
    await Pet.deleteMany({})
    const createdPets = await Pet.insertMany(seedPetsData)
    res.status(201).json({
      success: true,
      message: "Database seeded successfully",
      count: createdPets.length,
      pets: createdPets,
    })
  } catch (error) {
    next(error)
  }
}
