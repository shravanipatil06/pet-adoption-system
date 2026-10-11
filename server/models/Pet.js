import mongoose from "mongoose"

const petSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Please add a pet name"],
      trim: true,
    },
    breed: {
      type: String,
      required: [true, "Please add a breed"],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, "Please add an age"],
    },
    gender: {
      type: String,
      required: [true, "Please add gender"],
      enum: ["Male", "Female"],
    },
    type: {
      type: String,
      required: [true, "Please add a pet type"],
      enum: ["Dog", "Cat", "Other"],
    },
    image: {
      type: String,
      required: [true, "Please add an image URL"],
    },
  },
  {
    timestamps: true,
  }
)

const Pet = mongoose.model("Pet", petSchema)

export default Pet
