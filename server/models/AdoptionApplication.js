import mongoose from "mongoose"

const adoptionApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
    },
    applicantName: {
      type: String,
      required: [true, "Please provide your full name"],
      trim: true,
    },
    applicantEmail: {
      type: String,
      required: [true, "Please provide your email address"],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Please provide a contact phone number"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Please provide your residence address"],
      trim: true,
    },
    reasonForAdoption: {
      type: String,
      required: [true, "Please explain your reason for adoption"],
      trim: true,
    },
    previousPetExperience: {
      type: String,
      required: [true, "Please describe any previous pet experience"],
      trim: true,
    },
    livingSituation: {
      type: String,
      required: [true, "Please describe your living situation"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
)

const AdoptionApplication = mongoose.model(
  "AdoptionApplication",
  adoptionApplicationSchema
)

export default AdoptionApplication
