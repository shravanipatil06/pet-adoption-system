import AdoptionApplication from "../models/AdoptionApplication.js"
import Pet from "../models/Pet.js"
import { notifyAdminsNewApplication, notifyUserStatusUpdate } from "../config/socket.js"

// @desc    Create a new adoption application
// @route   POST /api/adoptions
// @access  Private (Authenticated Users)
export const createApplication = async (req, res, next) => {
  try {
    const {
      petId,
      phone,
      address,
      reasonForAdoption,
      previousPetExperience,
      livingSituation,
    } = req.body

    // Look up pet by numeric ID or ObjectId
    let pet = null
    if (!isNaN(petId)) {
      pet = await Pet.findOne({ id: Number(petId) })
    } else if (String(petId).match(/^[0-9a-fA-F]{24}$/)) {
      pet = await Pet.findById(petId)
    }

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "Pet not found",
      })
    }

    // Check duplicate pending application for the same user and pet
    const existingPending = await AdoptionApplication.findOne({
      user: req.user._id,
      pet: pet._id,
      status: "Pending",
    })

    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending adoption application for this pet.",
      })
    }

    // Create new application
    const application = await AdoptionApplication.create({
      user: req.user._id,
      pet: pet._id,
      applicantName: req.user.name,
      applicantEmail: req.user.email,
      phone,
      address,
      reasonForAdoption,
      previousPetExperience,
      livingSituation,
      status: "Pending",
    })

    // Populate pet details before returning
    const populatedApp = await AdoptionApplication.findById(application._id).populate("pet")

    // Emit real-time notification to authorized admins after successful DB creation
    notifyAdminsNewApplication(populatedApp)

    res.status(201).json({
      success: true,
      message: "Adoption application submitted successfully",
      data: populatedApp,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get logged-in user's adoption applications
// @route   GET /api/adoptions/my
// @access  Private (Authenticated Users)
export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await AdoptionApplication.find({ user: req.user._id })
      .populate("pet")
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get application details by ID (Owner or Admin)
// @route   GET /api/adoptions/:id
// @access  Private
export const getApplicationById = async (req, res, next) => {
  try {
    const application = await AdoptionApplication.findById(req.params.id)
      .populate("user", "name email role")
      .populate("pet")

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Adoption application not found",
      })
    }

    // Authorization check: Must be owner or admin
    if (
      application.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this application",
      })
    }

    res.status(200).json({
      success: true,
      data: application,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get all adoption applications
// @route   GET /api/adoptions
// @access  Private (Admin Only)
export const getAllApplications = async (req, res, next) => {
  try {
    const applications = await AdoptionApplication.find({})
      .populate("user", "name email role")
      .populate("pet")
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Approve an adoption application
// @route   PUT /api/adoptions/:id/approve
// @access  Private (Admin Only)
export const approveApplication = async (req, res, next) => {
  try {
    const application = await AdoptionApplication.findById(req.params.id)
      .populate("user", "name email")
      .populate("pet")

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Adoption application not found",
      })
    }

    application.status = "Approved"
    await application.save()

    // Emit real-time status update to the applicant after successful DB save
    notifyUserStatusUpdate(application.user._id, application)

    res.status(200).json({
      success: true,
      message: "Adoption application approved successfully",
      data: application,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Reject an adoption application
// @route   PUT /api/adoptions/:id/reject
// @access  Private (Admin Only)
export const rejectApplication = async (req, res, next) => {
  try {
    const application = await AdoptionApplication.findById(req.params.id)
      .populate("user", "name email")
      .populate("pet")

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Adoption application not found",
      })
    }

    application.status = "Rejected"
    await application.save()

    // Emit real-time status update to the applicant after successful DB save
    notifyUserStatusUpdate(application.user._id, application)

    res.status(200).json({
      success: true,
      message: "Adoption application rejected successfully",
      data: application,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete an adoption application
// @route   DELETE /api/adoptions/:id
// @access  Private (Admin Only)
export const deleteApplication = async (req, res, next) => {
  try {
    const application = await AdoptionApplication.findById(req.params.id)

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Adoption application not found",
      })
    }

    await AdoptionApplication.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: "Adoption application deleted successfully",
      id: req.params.id,
    })
  } catch (error) {
    next(error)
  }
}

