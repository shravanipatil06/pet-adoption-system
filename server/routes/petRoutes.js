import express from "express"
import {
  getPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
  seedPets,
} from "../controllers/petController.js"
import { validateCreatePet, validateUpdatePet } from "../middleware/validation.js"
import { protect, authorize } from "../middleware/authMiddleware.js"

const router = express.Router()

// Seed endpoint
router.post("/seed", seedPets)

// Root /api/pets endpoints
router.route("/")
  .get(getPets)
  .post(protect, authorize("admin"), validateCreatePet, createPet)

// Single pet endpoints /api/pets/:id
router.route("/:id")
  .get(getPetById)
  .put(protect, authorize("admin"), validateUpdatePet, updatePet)
  .delete(protect, authorize("admin"), deletePet)

export default router
