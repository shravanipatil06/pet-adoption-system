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

  // 1. Verify original 5 pets remain intact (or seed baseline if fresh empty database)
  let petCount = await Pet.countDocuments()
  console.log(`Current Pet Records Count: ${petCount}`)
  if (petCount === 0) {
    console.log("Empty database detected. Seeding baseline 5 pets for test environment...")
    const baselinePets = [
      {
        id: 1,
        name: "Bruno",
        breed: "Labrador",
        age: 3,
        gender: "Male",
        type: "Dog",
        image: "https://images.unsplash.com/photo-1552053831-71594a27632d",
      },
      {
        id: 2,
        name: "Luna",
        breed: "Persian Cat",
        age: 2,
        gender: "Female",
        type: "Cat",
        image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba",
      },
      {
        id: 3,
        name: "Max",
        breed: "Beagle",
        age: 3,
        gender: "Male",
        type: "Dog",
        image: "https://images.unsplash.com/photo-1507146426996-ef05306b995a",
      },
      {
        id: 4,
        name: "Milo",
        breed: "Rabbit",
        age: 2,
        gender: "Male",
        type: "Other",
        image: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: 5,
        name: "Coco",
        breed: "Golden Retriever",
        age: 2,
        gender: "Female",
        type: "Dog",
        image: "https://images.unsplash.com/photo-1591160690555-5debfba289f0?auto=format&fit=crop&w=800&q=80",
      },
    ]
    await Pet.insertMany(baselinePets)
    petCount = await Pet.countDocuments()
    console.log(`Baseline pets seeded. Total count: ${petCount}`)
  }

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
