import mongoose from "mongoose"
import dotenv from "dotenv"
import User from "../server/models/User.js"
import Pet from "../server/models/Pet.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

dotenv.config()

async function testAuthAndRoles() {
  console.log("=== STARTING EXPERIMENT 6 VERIFICATION ===")

  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/pethaven"
  await mongoose.connect(mongoUri)
  console.log("Connected to MongoDB:", mongoUri)

  // 1. Verify existing 5 pets
  const petCount = await Pet.countDocuments()
  console.log(`Current Pets count in DB: ${petCount}`)
  if (petCount < 5) {
    console.error("ERROR: Pets count is less than 5!")
  } else {
    console.log("SUCCESS: Original 5 pet records exist and are intact!")
  }

  // 2. Cleanup any test user from previous test run if exists
  await User.deleteMany({ email: { $in: ["testuser@pethaven.com", "adminuser@pethaven.com"] } })

  // 3. Test password hashing & user creation
  const testUser = await User.create({
    name: "Test Adopter",
    email: "testuser@pethaven.com",
    password: "password123",
    role: "user",
  })
  console.log("Created test user:", testUser.email, "role:", testUser.role)
  console.log("Hashed password in DB:", testUser.password)
  if (testUser.password === "password123") {
    console.error("FAIL: Password was saved as plain text!")
  } else {
    console.log("SUCCESS: Password is properly hashed with bcryptjs!")
  }

  // 4. Test matchPassword method
  const isMatch = await testUser.matchPassword("password123")
  const isBadMatch = await testUser.matchPassword("wrongpassword")
  console.log("Password verification (correct):", isMatch)
  console.log("Password verification (wrong):", isBadMatch)
  if (isMatch && !isBadMatch) {
    console.log("SUCCESS: Password matching logic functions correctly!")
  } else {
    console.error("FAIL: Password matching failed!")
  }

  // 5. Test Admin User creation for role-based authorization testing
  const adminUser = await User.create({
    name: "Shelter Admin",
    email: "adminuser@pethaven.com",
    password: "adminpassword123",
    role: "admin",
  })
  console.log("Created admin user:", adminUser.email, "role:", adminUser.role)

  // 6. Test JWT token verification
  const secret = process.env.JWT_SECRET || "pethaven_secret_key_jwt_2026"
  const userToken = jwt.sign({ id: testUser._id, role: testUser.role }, secret, { expiresIn: "1h" })
  const adminToken = jwt.sign({ id: adminUser._id, role: adminUser.role }, secret, { expiresIn: "1h" })

  const decodedUser = jwt.verify(userToken, secret)
  const decodedAdmin = jwt.verify(adminToken, secret)

  console.log("Decoded User JWT role:", decodedUser.role)
  console.log("Decoded Admin JWT role:", decodedAdmin.role)

  if (decodedUser.role === "user" && decodedAdmin.role === "admin") {
    console.log("SUCCESS: JWT generation & verification for roles operational!")
  }

  // Clean up created test users
  await User.deleteMany({ email: { $in: ["testuser@pethaven.com", "adminuser@pethaven.com"] } })
  console.log("Cleaned up temporary test users.")

  // Final check on pets
  const finalPetCount = await Pet.countDocuments()
  console.log(`Final Pets count in DB: ${finalPetCount}`)

  await mongoose.disconnect()
  console.log("=== EXPERIMENT 6 VERIFICATION COMPLETE ===")
}

testAuthAndRoles().catch((err) => {
  console.error("Verification failed:", err)
  process.exit(1)
})
