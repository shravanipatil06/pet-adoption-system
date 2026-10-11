import express from "express"
import {
  createApplication,
  getMyApplications,
  getApplicationById,
  getAllApplications,
  approveApplication,
  rejectApplication,
  deleteApplication,
} from "../controllers/adoptionController.js"
import { protect, authorize } from "../middleware/authMiddleware.js"
import { validateAdoptionApplication } from "../middleware/validation.js"

const router = express.Router()

// User application endpoints
router.post("/", protect, validateAdoptionApplication, createApplication)
router.get("/my", protect, getMyApplications)

// Admin application endpoints
router.get("/", protect, authorize("admin"), getAllApplications)
router.put("/:id/approve", protect, authorize("admin"), approveApplication)
router.put("/:id/reject", protect, authorize("admin"), rejectApplication)
router.delete("/:id", protect, authorize("admin"), deleteApplication)

// Single application details (Owner or Admin)
router.get("/:id", protect, getApplicationById)

export default router
