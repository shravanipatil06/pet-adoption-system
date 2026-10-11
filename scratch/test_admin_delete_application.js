import mongoose from "mongoose"
import dotenv from "dotenv"
import express from "express"
import cors from "cors"
import helmet from "helmet"
import User from "../server/models/User.js"
import Pet from "../server/models/Pet.js"
import AdoptionApplication from "../server/models/AdoptionApplication.js"
import petRoutes from "../server/routes/petRoutes.js"
import authRoutes from "../server/routes/authRoutes.js"
import adoptionRoutes from "../server/routes/adoptionRoutes.js"
import { apiLimiter } from "../server/middleware/security.js"
import { errorHandler, notFoundHandler } from "../server/middleware/errorHandler.js"

dotenv.config()

async function testAdminDeleteApplication() {
  console.log("=== STARTING ADMIN DELETE APPLICATION FEATURE TEST ===")

  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/pethaven"
  await mongoose.connect(mongoUri)
  console.log("Connected to MongoDB:", mongoUri)

  // 1. Verify pets count = 5
  const petCount = await Pet.countDocuments()
  console.log(`Initial Pet Count in DB: ${petCount}`)
  if (petCount < 5) throw new Error("Pets count is less than 5!")

  // 2. Start HTTP server on port 5007
  const app = express()
  app.use(helmet())
  app.use("/api", apiLimiter)
  app.use(cors({ origin: "*", credentials: true }))
  app.use(express.json({ limit: "10kb" }))
  app.use("/api/auth", authRoutes)
  app.use("/api/pets", petRoutes)
  app.use("/api/adoptions", adoptionRoutes)
  app.use(notFoundHandler)
  app.use(errorHandler)

  const server = app.listen(5007, async () => {
    console.log("Test HTTP Server running on port 5007")

    try {
      // Setup test user & test application
      await User.deleteMany({ email: "adopter_del_test@pethaven.com" })
      const adopterUser = await User.create({
        name: "Adopter Delete Test",
        email: "adopter_del_test@pethaven.com",
        password: "password123",
        role: "user",
      })

      // Get User JWT
      const userLoginRes = await fetch("http://localhost:5007/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "adopter_del_test@pethaven.com", password: "password123" }),
      })
      const userLoginData = await userLoginRes.json()
      const userToken = userLoginData.token

      // Get Admin JWT (Demo Admin)
      const adminLoginRes = await fetch("http://localhost:5007/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin_demo@pethaven.com", password: "Admin@12345" }),
      })
      const adminLoginData = await adminLoginRes.json()
      const adminToken = adminLoginData.token

      // Find pet Bruno
      const brunoPet = await Pet.findOne({ id: 1 })

      // Create a temporary application to be deleted
      const testApp = await AdoptionApplication.create({
        user: adopterUser._id,
        pet: brunoPet._id,
        applicantName: adopterUser.name,
        applicantEmail: adopterUser.email,
        phone: "9876543210",
        address: "Mumbai",
        reasonForAdoption: "Testing deletion",
        previousPetExperience: "Yes",
        livingSituation: "House",
        status: "Pending",
      })

      console.log(`Created test application: ${testApp._id}`)

      // A. Test Unauthenticated DELETE -> expect 401
      const unauthDelRes = await fetch(`http://localhost:5007/api/adoptions/${testApp._id}`, {
        method: "DELETE",
      })
      console.log("Unauthenticated DELETE Status:", unauthDelRes.status)
      if (unauthDelRes.status !== 401) {
        throw new Error("Unauthenticated user was allowed to delete an application!")
      }
      console.log("VERIFIED: Unauthenticated DELETE returned 401 Unauthorized!")

      // B. Test Normal User DELETE -> expect 403
      const userDelRes = await fetch(`http://localhost:5007/api/adoptions/${testApp._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${userToken}` },
      })
      console.log("Normal User DELETE Status:", userDelRes.status)
      if (userDelRes.status !== 403) {
        throw new Error("Normal user was allowed to delete an application!")
      }
      console.log("VERIFIED: Normal user DELETE returned 403 Forbidden!")

      // C. Test Admin DELETE -> expect 200
      const adminDelRes = await fetch(`http://localhost:5007/api/adoptions/${testApp._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      const adminDelData = await adminDelRes.json()
      console.log("Admin DELETE Status:", adminDelRes.status, "Message:", adminDelData.message)
      if (adminDelRes.status !== 200 || !adminDelData.success) {
        throw new Error("Admin DELETE application failed!")
      }
      console.log("VERIFIED: Admin DELETE returned 200 OK!")

      // D. Verify application is removed from MongoDB
      const checkInDb = await AdoptionApplication.findById(testApp._id)
      console.log("Check deleted application in MongoDB:", checkInDb)
      if (checkInDb) {
        throw new Error("Application document still exists in MongoDB after deletion!")
      }
      console.log("VERIFIED: Adoption application document is permanently removed from MongoDB!")

      // E. Verify non-existent ID returns 404
      const nonExistentDelRes = await fetch(`http://localhost:5007/api/adoptions/${testApp._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      console.log("DELETE non-existent application Status:", nonExistentDelRes.status)
      if (nonExistentDelRes.status !== 404) {
        throw new Error("Deleting non-existent application did not return 404!")
      }
      console.log("VERIFIED: Deleting non-existent application returned 404 Not Found!")

      // Clean up test user
      await User.deleteMany({ email: "adopter_del_test@pethaven.com" })

      // F. Verify Pets count = 5
      const finalPetCount = await Pet.countDocuments()
      console.log(`Final Pet Count in DB: ${finalPetCount}`)
      if (finalPetCount !== 5) {
        throw new Error("Pets count was modified!")
      }
      console.log("VERIFIED: All 5 original pet records remain 100% intact!")

      // G. Verify Demo Admin exists
      const demoAdminCheck = await User.findOne({ email: "admin_demo@pethaven.com" })
      console.log("Demo Admin Check:", demoAdminCheck?.email, "Role:", demoAdminCheck?.role)
      if (!demoAdminCheck || demoAdminCheck.role !== "admin") {
        throw new Error("Demo Admin account was modified!")
      }
      console.log("VERIFIED: Demo Admin account remains intact!")

      console.log("\n==========================================")
      console.log("ADMIN DELETE FEATURE TEST PASSED 100%!")
      console.log("==========================================\n")
    } catch (err) {
      console.error("Test Error:", err)
      process.exit(1)
    } finally {
      server.close()
      await mongoose.disconnect()
      process.exit(0)
    }
  })
}

testAdminDeleteApplication()
