import mongoose from "mongoose"
import dotenv from "dotenv"
import User from "../server/models/User.js"
import Pet from "../server/models/Pet.js"

dotenv.config()

async function seedAdminUser() {
  console.log("=== SEEDING PERSISTENT DEMO ADMIN ACCOUNT ===")

  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/pethaven"
  await mongoose.connect(mongoUri)
  console.log("Connected to MongoDB:", mongoUri)

  // 1. Verify original 5 pets remain intact
  const petCount = await Pet.countDocuments()
  console.log(`Current Pet Records Count: ${petCount}`)

  // 2. Check if admin_demo user already exists
  const existingAdmin = await User.findOne({ email: "admin_demo@pethaven.com" })

  let adminUser
  if (existingAdmin) {
    console.log("Found existing admin_demo@pethaven.com user. Updating credentials/role if necessary...")
    existingAdmin.name = "Demo Admin"
    existingAdmin.password = "Admin@12345"
    existingAdmin.role = "admin"
    adminUser = await existingAdmin.save()
  } else {
    console.log("Creating new Demo Admin account...")
    adminUser = await User.create({
      name: "Demo Admin",
      email: "admin_demo@pethaven.com",
      password: "Admin@12345",
      role: "admin",
    })
  }

  // 3. Verify user in database
  const verifiedUser = await User.findById(adminUser._id).select("+password")

  console.log("\n==========================================")
  console.log("PERSISTENT DEMO ADMIN ACCOUNT CREATED & VERIFIED:")
  console.log("ID:", verifiedUser._id)
  console.log("Name:", verifiedUser.name)
  console.log("Email:", verifiedUser.email)
  console.log("Role:", verifiedUser.role)
  console.log("Password Hash:", verifiedUser.password)
  console.log("==========================================\n")

  if (verifiedUser.role === "admin" && verifiedUser.password.startsWith("$2")) {
    console.log("SUCCESS: Persistent Admin Account is ready for manual demonstration!")
  } else {
    console.error("WARNING: Account verification failed!")
  }

  // Confirm pets are untouched
  const finalPetCount = await Pet.countDocuments()
  console.log(`Pet Records Count after seeding: ${finalPetCount}`)

  await mongoose.disconnect()
  console.log("Disconnected from MongoDB. Account remains saved permanently.")
}

seedAdminUser().catch((err) => {
  console.error("Seeding failed:", err)
  process.exit(1)
})
