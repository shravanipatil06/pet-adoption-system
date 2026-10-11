import express from "express"
import cors from "cors"
import helmet from "helmet"
import dotenv from "dotenv"
import connectDB from "../server/config/db.js"
import petRoutes from "../server/routes/petRoutes.js"
import authRoutes from "../server/routes/authRoutes.js"
import { apiLimiter } from "../server/middleware/security.js"
import { errorHandler, notFoundHandler } from "../server/middleware/errorHandler.js"
import User from "../server/models/User.js"
import Pet from "../server/models/Pet.js"

dotenv.config()

async function testHttpFlow() {
  await connectDB()

  const app = express()
  app.use(helmet())
  app.use("/api", apiLimiter)
  app.use(cors({ origin: "*", credentials: true }))
  app.use(express.json({ limit: "10kb" }))
  app.use("/api/auth", authRoutes)
  app.use("/api/pets", petRoutes)
  app.use(notFoundHandler)
  app.use(errorHandler)

  const server = app.listen(5005, async () => {
    console.log("Test HTTP Server running on port 5005")

    try {
      // 1. Test public GET /api/pets
      const petsRes = await fetch("http://localhost:5005/api/pets")
      const petsData = await petsRes.json()
      console.log(`Public GET /api/pets status: ${petsRes.status}, count: ${petsData.length}`)
      if (petsRes.status !== 200 || !Array.isArray(petsData) || petsData.length !== 5) {
        throw new Error("Public pet browsing failed or pet count is wrong")
      }

      // 2. Test user registration with privilege escalation attempt (role: "admin")
      // Clean up test user if exists
      await User.deleteMany({ email: "adopter_test@pethaven.com" })

      const regRes = await fetch("http://localhost:5005/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Adopter Test",
          email: "adopter_test@pethaven.com",
          password: "password123",
          role: "admin", // Attempt to force admin role via untrusted signup
        }),
      })

      const regData = await regRes.json()
      console.log("Registration Response Status:", regRes.status)
      console.log("Assigned user role:", regData.user?.role)

      if (regData.user?.role === "admin") {
        throw new Error("SECURITY BREACH: Public signup allowed self-assignment of admin role!")
      } else {
        console.log("SECURITY SUCCESS: Public registration defaulted to 'user' role!")
      }

      const userToken = regData.token

      // 3. Test user login
      const loginRes = await fetch("http://localhost:5005/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "adopter_test@pethaven.com",
          password: "password123",
        }),
      })
      const loginData = await loginRes.json()
      console.log("Login Response Status:", loginRes.status, "Has Token:", !!loginData.token)

      // 4. Test unauthorized pet creation (Unauthenticated)
      const unauthCreateRes = await fetch("http://localhost:5005/api/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Hacker Dog",
          breed: "Unknown",
          age: 1,
          gender: "Male",
          type: "Dog",
          image: "https://example.com/dog.jpg",
        }),
      })
      console.log("Unauthenticated POST /api/pets Status:", unauthCreateRes.status)
      if (unauthCreateRes.status !== 401) {
        throw new Error("SECURITY BREACH: Unauthenticated user was able to reach POST /api/pets!")
      } else {
        console.log("SECURITY SUCCESS: Unauthenticated POST /api/pets returned 401 Unauthorized!")
      }

      // 5. Test user-role pet creation (User token - should fail with 403 Forbidden)
      const userCreateRes = await fetch("http://localhost:5005/api/pets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          name: "User Pet",
          breed: "Beagle",
          age: 2,
          gender: "Male",
          type: "Dog",
          image: "https://example.com/beagle.jpg",
        }),
      })
      console.log("Normal User POST /api/pets Status:", userCreateRes.status)
      if (userCreateRes.status !== 403) {
        throw new Error("SECURITY BREACH: Non-admin user was allowed to create a pet!")
      } else {
        console.log("SECURITY SUCCESS: Normal User POST /api/pets returned 403 Forbidden!")
      }

      // 6. Test Admin pet creation (Admin token - should succeed)
      await User.deleteMany({ email: "admin_test@pethaven.com" })
      const adminDbUser = await User.create({
        name: "Test Admin",
        email: "admin_test@pethaven.com",
        password: "adminpassword123",
        role: "admin",
      })

      const adminLoginRes = await fetch("http://localhost:5005/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "admin_test@pethaven.com",
          password: "adminpassword123",
        }),
      })
      const adminLoginData = await adminLoginRes.json()
      const adminToken = adminLoginData.token

      const adminCreateRes = await fetch("http://localhost:5005/api/pets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: "Test Admin Pet",
          breed: "Labrador",
          age: 3,
          gender: "Female",
          type: "Dog",
          image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&q=80",
        }),
      })
      const adminCreateData = await adminCreateRes.json()
      console.log("Admin POST /api/pets Status:", adminCreateRes.status, "Created Pet ID:", adminCreateData.data?.id)
      if (adminCreateRes.status !== 201) {
        throw new Error("Admin pet creation failed!")
      } else {
        console.log("SECURITY SUCCESS: Admin user successfully created pet!")
      }

      // Clean up created pet & test users
      if (adminCreateData.data?._id) {
        await Pet.findByIdAndDelete(adminCreateData.data._id)
      }
      await User.deleteMany({ email: { $in: ["adopter_test@pethaven.com", "admin_test@pethaven.com"] } })

      console.log("=== HTTP REST API TEST PASSED 100% ===")
    } catch (err) {
      console.error("HTTP Test Error:", err)
    } finally {
      server.close()
      process.exit(0)
    }
  })
}

testHttpFlow()
