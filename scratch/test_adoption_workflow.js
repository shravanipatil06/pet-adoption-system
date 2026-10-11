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

async function runAdoptionWorkflowTest() {
  console.log("=== STARTING CORE ADOPTION WORKFLOW VERIFICATION ===")

  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/pethaven"
  await mongoose.connect(mongoUri)
  console.log("Connected to MongoDB:", mongoUri)

  // 1. Check original 5 pets intact
  const petCount = await Pet.countDocuments()
  console.log(`Initial Pet Count in DB: ${petCount}`)
  if (petCount < 5) {
    throw new Error("Pet count is less than 5!")
  }
  console.log("SUCCESS: Original pet records remain intact!")

  // 2. Start temporary HTTP Test Server on port 5006
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

  const server = app.listen(5006, async () => {
    console.log("Test HTTP Server running on port 5006")

    try {
      // Setup test user
      await User.deleteMany({ email: "adopter_workflow@pethaven.com" })
      const adopterUser = await User.create({
        name: "Adopter Workflow Test",
        email: "adopter_workflow@pethaven.com",
        password: "password123",
        role: "user",
      })

      // Obtain User JWT via HTTP Login
      const userLoginRes = await fetch("http://localhost:5006/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "adopter_workflow@pethaven.com", password: "password123" }),
      })
      const userLoginData = await userLoginRes.json()
      const userToken = userLoginData.token
      console.log("User Logged In, Token Received:", !!userToken)

      // Obtain Admin JWT via HTTP Login (Demo Admin)
      const adminLoginRes = await fetch("http://localhost:5006/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin_demo@pethaven.com", password: "Admin@12345" }),
      })
      const adminLoginData = await adminLoginRes.json()
      const adminToken = adminLoginData.token
      console.log("Admin Logged In, Token Received:", !!adminToken)

      // 3. Test Unauthenticated Adoption Submission
      const unauthSubRes = await fetch("http://localhost:5006/api/adoptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId: 1,
          phone: "9876543210",
          address: "123 Test St",
          reasonForAdoption: "Love pets",
          previousPetExperience: "5 years",
          livingSituation: "Own house with yard",
        }),
      })
      console.log("Unauthenticated POST /api/adoptions Status:", unauthSubRes.status)
      if (unauthSubRes.status !== 401) {
        throw new Error("Unauthenticated user was allowed to submit adoption application!")
      }
      console.log("VERIFIED: Unauthenticated submission returned 401 Unauthorized!")

      // 4. Test Authenticated User Submission for Pet (Bruno, numeric ID: 1)
      const userSubRes = await fetch("http://localhost:5006/api/adoptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          petId: 1,
          phone: "+91 98765 43210",
          address: "45 Lotus Garden, Mumbai",
          reasonForAdoption: "Looking for a companion for morning walks.",
          previousPetExperience: "Owned a Golden Retriever for 8 years.",
          livingSituation: "Independent house with enclosed garden.",
        }),
      })
      const userSubData = await userSubRes.json()
      console.log("User POST /api/adoptions Status:", userSubRes.status, "Status:", userSubData.data?.status)
      if (userSubRes.status !== 201 || userSubData.data?.status !== "Pending") {
        throw new Error("Adoption application creation failed or status is not Pending!")
      }
      console.log("VERIFIED: User adoption application created with status 'Pending'!")
      const appId = userSubData.data._id

      // 5. Test Duplicate Pending Application Prevention
      const dupSubRes = await fetch("http://localhost:5006/api/adoptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          petId: 1,
          phone: "+91 98765 43210",
          address: "45 Lotus Garden, Mumbai",
          reasonForAdoption: "Duplicate attempt",
          previousPetExperience: "Owned a dog",
          livingSituation: "House",
        }),
      })
      console.log("Duplicate POST /api/adoptions Status:", dupSubRes.status)
      if (dupSubRes.status !== 400) {
        throw new Error("Duplicate pending application was allowed!")
      }
      console.log("VERIFIED: Duplicate pending application blocked with 400 Bad Request!")

      // 6. Test GET /api/adoptions/my (User Applications)
      const myAppsRes = await fetch("http://localhost:5006/api/adoptions/my", {
        headers: { Authorization: `Bearer ${userToken}` },
      })
      const myAppsData = await myAppsRes.json()
      console.log("GET /api/adoptions/my Status:", myAppsRes.status, "Count:", myAppsData.count)
      if (myAppsRes.status !== 200 || myAppsData.count !== 1) {
        throw new Error("Failed to retrieve user's own applications!")
      }
      console.log("VERIFIED: User can view their own application!")

      // 7. Test User Access to Admin GET /api/adoptions (Should be Forbidden)
      const userAdminRes = await fetch("http://localhost:5006/api/adoptions", {
        headers: { Authorization: `Bearer ${userToken}` },
      })
      console.log("User GET /api/adoptions (Admin Route) Status:", userAdminRes.status)
      if (userAdminRes.status !== 403) {
        throw new Error("Normal user was allowed to access Admin application route!")
      }
      console.log("VERIFIED: Normal user blocked from Admin route with 403 Forbidden!")

      // 8. Test Admin GET /api/adoptions
      const adminAppsRes = await fetch("http://localhost:5006/api/adoptions", {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      const adminAppsData = await adminAppsRes.json()
      console.log("Admin GET /api/adoptions Status:", adminAppsRes.status, "Total Apps:", adminAppsData.count)
      if (adminAppsRes.status !== 200) {
        throw new Error("Admin failed to retrieve all applications!")
      }
      console.log("VERIFIED: Admin can retrieve all applications!")

      // 9. Test Admin Approval (PUT /api/adoptions/:id/approve)
      const approveRes = await fetch(`http://localhost:5006/api/adoptions/${appId}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      const approveData = await approveRes.json()
      console.log("Admin Approval Status:", approveRes.status, "New App Status:", approveData.data?.status)
      if (approveRes.status !== 200 || approveData.data?.status !== "Approved") {
        throw new Error("Admin approval failed!")
      }
      console.log("VERIFIED: Admin approved application successfully!")

      // 10. Verify User Sees Updated Status ("Approved")
      const updatedMyAppsRes = await fetch("http://localhost:5006/api/adoptions/my", {
        headers: { Authorization: `Bearer ${userToken}` },
      })
      const updatedMyAppsData = await updatedMyAppsRes.json()
      console.log("User Verified Status after Admin Approval:", updatedMyAppsData.data[0]?.status)
      if (updatedMyAppsData.data[0]?.status !== "Approved") {
        throw new Error("User did not see updated Approved status!")
      }
      console.log("VERIFIED: User sees updated status 'Approved'!")

      // Clean up temporary test data
      await AdoptionApplication.deleteMany({ applicantEmail: "adopter_workflow@pethaven.com" })
      await User.deleteMany({ email: "adopter_workflow@pethaven.com" })
      console.log("Temporary test application and user cleaned up.")

      // Verify pets count
      const finalPetCount = await Pet.countDocuments()
      console.log(`Final Pet Count in DB: ${finalPetCount}`)
      if (finalPetCount !== 5) {
        throw new Error("Pet count changed!")
      }
      console.log("VERIFIED: All 5 original pet records remain 100% intact!")

      console.log("\n==========================================")
      console.log("CORE ADOPTION WORKFLOW TEST PASSED 100%!")
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

runAdoptionWorkflowTest()
