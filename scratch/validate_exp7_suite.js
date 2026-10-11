import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

const BASE_URL = "http://localhost:5000"

async function runValidationSuite() {
  console.log("==========================================================")
  console.log("       PET HAVEN — EXPERIMENT 7 REST API TEST SUITE       ")
  console.log("==========================================================\n")

  const testResults = []

  const logResult = (category, testName, expectedStatus, actualStatus, success, details = "") => {
    testResults.push({
      category,
      testName,
      expectedStatus,
      actualStatus,
      passed: success,
      details,
    })
    const symbol = success ? "✓ PASS" : "✗ FAIL"
    console.log(`[${symbol}] [${category}] ${testName} -> Status: ${actualStatus} (Expected: ${expectedStatus})`)
    if (details) console.log(`       Details: ${details}`)
  }

  let userToken = ""
  let adminToken = ""
  let tempAppId = ""

  // ---------------------------------------------------------
  // 1. GENERAL & HEALTH
  // ---------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/`)
    const data = await res.json()
    logResult(
      "1. General & Health",
      "GET / (Health Check)",
      200,
      res.status,
      res.status === 200 && data.success === true,
      `Message: ${data.message}`
    )
  } catch (err) {
    logResult("1. General & Health", "GET / (Health Check)", 200, 0, false, err.message)
  }

  // ---------------------------------------------------------
  // 2. AUTHENTICATION APIs
  // ---------------------------------------------------------
  // 2.1 Register Normal User
  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Exp7 Test User",
        email: "exp7user@pethaven.com",
        password: "User@12345",
      }),
    })
    const data = await res.json()
    // Accept 201 (created) or 400 if user already exists from prior run
    if (res.status === 201 || (res.status === 400 && data.message.includes("already exists"))) {
      logResult(
        "2. Authentication",
        "POST /api/auth/register (User Registration)",
        201,
        res.status,
        true,
        data.message
      )
    } else {
      logResult(
        "2. Authentication",
        "POST /api/auth/register (User Registration)",
        201,
        res.status,
        false,
        JSON.stringify(data)
      )
    }
  } catch (err) {
    logResult("2. Authentication", "POST /api/auth/register", 201, 0, false, err.message)
  }

  // 2.2 User Login (Obtain JWT)
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "exp7user@pethaven.com",
        password: "User@12345",
      }),
    })
    const data = await res.json()
    userToken = data.token || ""
    logResult(
      "2. Authentication",
      "POST /api/auth/login (User Login)",
      200,
      res.status,
      res.status === 200 && !!userToken,
      `User Role: ${data.user?.role}`
    )
  } catch (err) {
    logResult("2. Authentication", "POST /api/auth/login (User Login)", 200, 0, false, err.message)
  }

  // 2.3 Admin Login (Obtain Admin JWT)
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin_demo@pethaven.com",
        password: "Admin@12345",
      }),
    })
    const data = await res.json()
    adminToken = data.token || ""
    logResult(
      "2. Authentication",
      "POST /api/auth/login (Demo Admin Login)",
      200,
      res.status,
      res.status === 200 && data.user?.role === "admin",
      `Admin Email: ${data.user?.email}`
    )
  } catch (err) {
    logResult("2. Authentication", "POST /api/auth/login (Demo Admin Login)", 200, 0, false, err.message)
  }

  // 2.4 Get Authenticated User Profile
  try {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${userToken}` },
    })
    const data = await res.json()
    logResult(
      "2. Authentication",
      "GET /api/auth/me (Get Profile)",
      200,
      res.status,
      res.status === 200 && data.user?.email === "exp7user@pethaven.com",
      `Profile Email: ${data.user?.email}`
    )
  } catch (err) {
    logResult("2. Authentication", "GET /api/auth/me", 200, 0, false, err.message)
  }

  // 2.5 Login with Incorrect Password
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "exp7user@pethaven.com",
        password: "WrongPassword123",
      }),
    })
    const data = await res.json()
    logResult(
      "2. Authentication",
      "POST /api/auth/login (Incorrect Password)",
      401,
      res.status,
      res.status === 401,
      `Message: ${data.message}`
    )
  } catch (err) {
    logResult("2. Authentication", "POST /api/auth/login (Incorrect Password)", 401, 0, false, err.message)
  }

  // 2.6 Login with Non-existent Email
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "nonexistent@pethaven.com",
        password: "User@12345",
      }),
    })
    const data = await res.json()
    logResult(
      "2. Authentication",
      "POST /api/auth/login (Non-existent Email)",
      401,
      res.status,
      res.status === 401,
      `Message: ${data.message}`
    )
  } catch (err) {
    logResult("2. Authentication", "POST /api/auth/login (Non-existent Email)", 401, 0, false, err.message)
  }

  // ---------------------------------------------------------
  // 3. PETS APIs (Includes Destructive Testing on Temp Pet)
  // ---------------------------------------------------------
  // 3.1 Get All Pets (Public)
  try {
    const res = await fetch(`${BASE_URL}/api/pets`)
    const pets = await res.json()
    logResult(
      "3. Pets APIs",
      "GET /api/pets (Public List)",
      200,
      res.status,
      res.status === 200 && Array.isArray(pets),
      `Total Pets Count: ${pets.length}`
    )
  } catch (err) {
    logResult("3. Pets APIs", "GET /api/pets", 200, 0, false, err.message)
  }

  // 3.2 Get Single Pet by ID
  try {
    const res = await fetch(`${BASE_URL}/api/pets/1`)
    const pet = await res.json()
    logResult(
      "3. Pets APIs",
      "GET /api/pets/1 (Single Pet)",
      200,
      res.status,
      res.status === 200 && pet.name === "Bruno",
      `Pet Name: ${pet.name}, Breed: ${pet.breed}`
    )
  } catch (err) {
    logResult("3. Pets APIs", "GET /api/pets/1", 200, 0, false, err.message)
  }

  // 3.3 Create Temporary Pet (Admin Only)
  try {
    const res = await fetch(`${BASE_URL}/api/pets`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: 99,
        name: "Exp7 Temp Pet",
        breed: "Test Retriever",
        age: 1,
        gender: "Male",
        type: "Dog",
        image: "https://images.unsplash.com/photo-1552053831-71594a27632d",
      }),
    })
    const data = await res.json()
    logResult(
      "3. Pets APIs",
      "POST /api/pets (Create Temp Pet)",
      201,
      res.status,
      res.status === 201 && data.success === true,
      `Created Pet ID: ${data.data?.id}, Name: ${data.data?.name}`
    )
  } catch (err) {
    logResult("3. Pets APIs", "POST /api/pets (Create Temp Pet)", 201, 0, false, err.message)
  }

  // 3.4 Update Temporary Pet (Admin Only)
  try {
    const res = await fetch(`${BASE_URL}/api/pets/99`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Exp7 Temp Pet Updated",
        age: 2,
      }),
    })
    const data = await res.json()
    logResult(
      "3. Pets APIs",
      "PUT /api/pets/99 (Update Temp Pet)",
      200,
      res.status,
      res.status === 200 && data.data?.name === "Exp7 Temp Pet Updated",
      `Updated Name: ${data.data?.name}, New Age: ${data.data?.age}`
    )
  } catch (err) {
    logResult("3. Pets APIs", "PUT /api/pets/99 (Update Temp Pet)", 200, 0, false, err.message)
  }

  // 3.5 Delete Temporary Pet (Admin Only)
  try {
    const res = await fetch(`${BASE_URL}/api/pets/99`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    const data = await res.json()
    logResult(
      "3. Pets APIs",
      "DELETE /api/pets/99 (Delete Temp Pet)",
      200,
      res.status,
      res.status === 200 && data.success === true,
      `Deleted Pet ID: ${data.id}`
    )
  } catch (err) {
    logResult("3. Pets APIs", "DELETE /api/pets/99", 200, 0, false, err.message)
  }

  // 3.6 Verify Deleted Temp Pet Returns 404
  try {
    const res = await fetch(`${BASE_URL}/api/pets/99`)
    logResult(
      "3. Pets APIs",
      "GET /api/pets/99 (Verify Deletion)",
      404,
      res.status,
      res.status === 404,
      "Temp pet verified removed from database"
    )
  } catch (err) {
    logResult("3. Pets APIs", "GET /api/pets/99 (Verify Deletion)", 404, 0, false, err.message)
  }

  // ---------------------------------------------------------
  // 4. ADOPTION APIs (Full Adoption Workflow)
  // ---------------------------------------------------------
  // 4.1 Submit Adoption Application
  try {
    const res = await fetch(`${BASE_URL}/api/adoptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        petId: 1,
        phone: "+1-555-0199",
        address: "123 Validation Way, Suite 404",
        reasonForAdoption: "Testing adoption workflow via Postman test suite",
        previousPetExperience: "5 years with dogs",
        livingSituation: "Spacious home with fenced yard",
      }),
    })
    const data = await res.json()
    tempAppId = data.data?._id || ""
    logResult(
      "4. Adoption APIs",
      "POST /api/adoptions (Submit Application)",
      201,
      res.status,
      res.status === 201 && data.data?.status === "Pending",
      `App ID: ${tempAppId}, Status: ${data.data?.status}`
    )
  } catch (err) {
    logResult("4. Adoption APIs", "POST /api/adoptions", 201, 0, false, err.message)
  }

  // 4.2 Test Duplicate Pending Application Prevention
  try {
    const res = await fetch(`${BASE_URL}/api/adoptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        petId: 1,
        phone: "+1-555-0199",
        address: "123 Validation Way",
        reasonForAdoption: "Duplicate test",
        previousPetExperience: "None",
        livingSituation: "Apartment",
      }),
    })
    const data = await res.json()
    logResult(
      "4. Adoption APIs",
      "POST /api/adoptions (Duplicate Application Prevention)",
      400,
      res.status,
      res.status === 400 && data.message.includes("already have a pending"),
      `Message: ${data.message}`
    )
  } catch (err) {
    logResult("4. Adoption APIs", "POST /api/adoptions (Duplicate)", 400, 0, false, err.message)
  }

  // 4.3 Get Logged-in User's Adoption Applications
  try {
    const res = await fetch(`${BASE_URL}/api/adoptions/my`, {
      method: "GET",
      headers: { Authorization: `Bearer ${userToken}` },
    })
    const data = await res.json()
    logResult(
      "4. Adoption APIs",
      "GET /api/adoptions/my (User Applications)",
      200,
      res.status,
      res.status === 200 && Array.isArray(data.data) && data.count >= 1,
      `User Applications Count: ${data.count}`
    )
  } catch (err) {
    logResult("4. Adoption APIs", "GET /api/adoptions/my", 200, 0, false, err.message)
  }

  // 4.4 Get Application Details by ID (Owner)
  try {
    const res = await fetch(`${BASE_URL}/api/adoptions/${tempAppId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${userToken}` },
    })
    const data = await res.json()
    logResult(
      "4. Adoption APIs",
      `GET /api/adoptions/:id (Single Application)`,
      200,
      res.status,
      res.status === 200 && data.data?._id === tempAppId,
      `Applicant: ${data.data?.applicantName}, Pet: ${data.data?.pet?.name}`
    )
  } catch (err) {
    logResult("4. Adoption APIs", "GET /api/adoptions/:id", 200, 0, false, err.message)
  }

  // 4.5 Get All Applications (Admin Only)
  try {
    const res = await fetch(`${BASE_URL}/api/adoptions`, {
      method: "GET",
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    const data = await res.json()
    logResult(
      "4. Adoption APIs",
      "GET /api/adoptions (Admin List All Applications)",
      200,
      res.status,
      res.status === 200 && Array.isArray(data.data),
      `Total Applications in System: ${data.count}`
    )
  } catch (err) {
    logResult("4. Adoption APIs", "GET /api/adoptions", 200, 0, false, err.message)
  }

  // 4.6 Approve Adoption Application (Admin Only)
  try {
    const res = await fetch(`${BASE_URL}/api/adoptions/${tempAppId}/approve`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    const data = await res.json()
    logResult(
      "4. Adoption APIs",
      "PUT /api/adoptions/:id/approve (Admin Approve)",
      200,
      res.status,
      res.status === 200 && data.data?.status === "Approved",
      `Updated Application Status: ${data.data?.status}`
    )
  } catch (err) {
    logResult("4. Adoption APIs", "PUT /api/adoptions/:id/approve", 200, 0, false, err.message)
  }

  // 4.7 Reject Adoption Application (Admin Only)
  try {
    const res = await fetch(`${BASE_URL}/api/adoptions/${tempAppId}/reject`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    const data = await res.json()
    logResult(
      "4. Adoption APIs",
      "PUT /api/adoptions/:id/reject (Admin Reject)",
      200,
      res.status,
      res.status === 200 && data.data?.status === "Rejected",
      `Updated Application Status: ${data.data?.status}`
    )
  } catch (err) {
    logResult("4. Adoption APIs", "PUT /api/adoptions/:id/reject", 200, 0, false, err.message)
  }

  // 4.8 Delete Adoption Application (Admin Only Cleanup)
  try {
    const res = await fetch(`${BASE_URL}/api/adoptions/${tempAppId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    const data = await res.json()
    logResult(
      "4. Adoption APIs",
      "DELETE /api/adoptions/:id (Admin Cleanup)",
      200,
      res.status,
      res.status === 200 && data.success === true,
      `Deleted Application ID: ${data.id}`
    )
  } catch (err) {
    logResult("4. Adoption APIs", "DELETE /api/adoptions/:id", 200, 0, false, err.message)
  }

  // ---------------------------------------------------------
  // 5. AUTHORIZATION & SECURITY TESTING
  // ---------------------------------------------------------
  // 5.1 Missing Token -> 401 Unauthorized
  try {
    const res = await fetch(`${BASE_URL}/api/auth/me`)
    const data = await res.json()
    logResult(
      "5. Authorization & Security",
      "GET /api/auth/me (Missing Token)",
      401,
      res.status,
      res.status === 401,
      `Message: ${data.message}`
    )
  } catch (err) {
    logResult("5. Security", "GET /api/auth/me (Missing Token)", 401, 0, false, err.message)
  }

  // 5.2 Invalid Token -> 401 Unauthorized
  try {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: "Bearer invalid_token_xyz_123" },
    })
    const data = await res.json()
    logResult(
      "5. Authorization & Security",
      "GET /api/auth/me (Invalid Token)",
      401,
      res.status,
      res.status === 401,
      `Message: ${data.message}`
    )
  } catch (err) {
    logResult("5. Security", "GET /api/auth/me (Invalid Token)", 401, 0, false, err.message)
  }

  // 5.3 Normal User Attempting Admin Pet Creation -> 403 Forbidden
  try {
    const res = await fetch(`${BASE_URL}/api/pets`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Unauthorized Pet",
        breed: "Poodle",
        age: 1,
        gender: "Male",
        type: "Dog",
        image: "https://images.unsplash.com/photo-1552053831-71594a27632d",
      }),
    })
    const data = await res.json()
    logResult(
      "5. Authorization & Security",
      "POST /api/pets (Normal User Accessing Admin Route)",
      403,
      res.status,
      res.status === 403,
      `Message: ${data.message}`
    )
  } catch (err) {
    logResult("5. Security", "POST /api/pets (Normal User)", 403, 0, false, err.message)
  }

  // 5.4 Normal User Attempting Admin All Applications Fetch -> 403 Forbidden
  try {
    const res = await fetch(`${BASE_URL}/api/adoptions`, {
      method: "GET",
      headers: { Authorization: `Bearer ${userToken}` },
    })
    const data = await res.json()
    logResult(
      "5. Authorization & Security",
      "GET /api/adoptions (Normal User Accessing Admin Route)",
      403,
      res.status,
      res.status === 403,
      `Message: ${data.message}`
    )
  } catch (err) {
    logResult("5. Security", "GET /api/adoptions (Normal User)", 403, 0, false, err.message)
  }

  // ---------------------------------------------------------
  // 6. VALIDATION & ERROR HANDLING TESTING
  // ---------------------------------------------------------
  // 6.1 Register Input Validation Error -> 400 Bad Request
  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "invalid_register@pethaven.com",
      }),
    })
    const data = await res.json()
    logResult(
      "6. Validation & Errors",
      "POST /api/auth/register (Missing Required Fields)",
      400,
      res.status,
      res.status === 400 && Array.isArray(data.errors),
      `Errors: ${data.errors?.join("; ")}`
    )
  } catch (err) {
    logResult("6. Validation & Errors", "POST /api/auth/register (Validation)", 400, 0, false, err.message)
  }

  // 6.2 Pet Creation Validation Error -> 400 Bad Request
  try {
    const res = await fetch(`${BASE_URL}/api/pets`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Bad Pet",
        breed: "Mix",
        age: -5,
        gender: "Unknown",
        type: "Dragon",
        image: "http://example.com/img.jpg",
      }),
    })
    const data = await res.json()
    logResult(
      "6. Validation & Errors",
      "POST /api/pets (Invalid Gender, Type, & Negative Age)",
      400,
      res.status,
      res.status === 400 && Array.isArray(data.errors),
      `Errors: ${data.errors?.join("; ")}`
    )
  } catch (err) {
    logResult("6. Validation & Errors", "POST /api/pets (Validation)", 400, 0, false, err.message)
  }

  // 6.3 Adoption Application Validation Error -> 400 Bad Request
  try {
    const res = await fetch(`${BASE_URL}/api/adoptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        petId: 1,
      }),
    })
    const data = await res.json()
    logResult(
      "6. Validation & Errors",
      "POST /api/adoptions (Missing Phone, Address, Reason)",
      400,
      res.status,
      res.status === 400 && Array.isArray(data.errors),
      `Errors: ${data.errors?.join("; ")}`
    )
  } catch (err) {
    logResult("6. Validation & Errors", "POST /api/adoptions (Validation)", 400, 0, false, err.message)
  }

  // 6.4 Non-existent Pet Fetch -> 404 Not Found
  try {
    const res = await fetch(`${BASE_URL}/api/pets/99999`)
    const data = await res.json()
    logResult(
      "6. Validation & Errors",
      "GET /api/pets/99999 (Non-existent Pet)",
      404,
      res.status,
      res.status === 404,
      `Message: ${data.message}`
    )
  } catch (err) {
    logResult("6. Validation & Errors", "GET /api/pets/99999", 404, 0, false, err.message)
  }

  // ---------------------------------------------------------
  // DATABASE CLEANUP & PROTECTION VERIFICATION
  // ---------------------------------------------------------
  console.log("\n----------------------------------------------------------")
  console.log("    DATABASE CLEANUP & BASELINE INTEGRITY VERIFICATION    ")
  console.log("----------------------------------------------------------")

  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/pethaven"
  await mongoose.connect(mongoUri)

  // 1. Delete test user created during Experiment 7
  await mongoose.connection.db.collection("users").deleteOne({ email: "exp7user@pethaven.com" })
  console.log("✓ Cleaned up temporary test user: exp7user@pethaven.com")

  // 2. Delete any leftover temporary pet (id 99 or named Exp7 Temp Pet)
  await mongoose.connection.db.collection("pets").deleteMany({ $or: [{ id: 99 }, { name: /Exp7/i }] })
  console.log("✓ Cleaned up any temporary test pets created during testing")

  // 3. Verify exact remaining pets in DB
  const currentPets = await mongoose.connection.db.collection("pets").find({}).sort({ id: 1 }).toArray()
  console.log(`\nCurrently Existing Pets in DB (${currentPets.length} total):`)
  currentPets.forEach((p) => console.log(`  - [ID: ${p.id}] ${p.name} (${p.breed}, ${p.gender}, ${p.type})`))

  const baselineNames = ["Bruno", "Luna", "Max", "Milo", "Coco"]
  const petsIntact = baselineNames.every((name) => currentPets.some((p) => p.name === name))
  console.log(`Baseline Pets Intact Check: ${petsIntact ? "PASSED (All 5 pets present)" : "FAILED"}`)

  // 4. Verify Demo Admin User in DB
  const adminUser = await mongoose.connection.db.collection("users").findOne({ email: "admin_demo@pethaven.com" })
  console.log(`Demo Admin Intact Check: ${adminUser && adminUser.role === "admin" ? "PASSED (admin_demo@pethaven.com active)" : "FAILED"}`)

  // 5. Verify Adoption Applications count
  const remainingAdoptions = await mongoose.connection.db.collection("adoptions").countDocuments()
  console.log(`Adoption Applications Remaining in DB: ${remainingAdoptions} (Cleaned up temporary applications)`)

  await mongoose.disconnect()

  // Summary
  const passedCount = testResults.filter((r) => r.passed).length
  const totalCount = testResults.length

  console.log("\n==========================================================")
  console.log(`  TEST RESULTS SUMMARY: ${passedCount} / ${totalCount} PASSED`)
  console.log("==========================================================\n")

  return { testResults, passedCount, totalCount, petsIntact, adminIntact: !!adminUser }
}

runValidationSuite().catch((err) => {
  console.error("Test Suite Execution Failed:", err)
  process.exit(1)
})
