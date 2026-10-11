import { io } from "socket.io-client"

const BASE_URL = "http://localhost:5000"

async function runExp8Tests() {
  console.log("==================================================================")
  console.log("      PET HAVEN — EXPERIMENT 8 WEBSOCKET REAL-TIME TEST SUITE     ")
  console.log("==================================================================\n")

  const results = []
  const record = (testName, passed, details = "") => {
    results.push({ testName, passed, details })
    const status = passed ? "✓ PASS" : "✗ FAIL"
    console.log(`[${status}] ${testName}`)
    if (details) console.log(`       Details: ${details}`)
  }

  // 1. Health check
  try {
    const res = await fetch(`${BASE_URL}/`)
    const data = await res.json()
    record("1. Backend Health Check (GET /)", res.status === 200 && data.success === true, data.message)
  } catch (err) {
    record("1. Backend Health Check (GET /)", false, err.message)
  }

  // 2. Unauthenticated WebSocket Connection Rejection
  await new Promise((resolve) => {
    const unauthSocket = io(BASE_URL, {
      transports: ["websocket"],
      reconnection: false,
      timeout: 3000,
    })

    unauthSocket.on("connect", () => {
      record("2. Security: Reject Unauthenticated WebSocket Connection", false, "Unexpectedly connected without token")
      unauthSocket.disconnect()
      resolve()
    })

    unauthSocket.on("connect_error", (err) => {
      const isAuthError = err.message.toLowerCase().includes("authentication error") || err.message.toLowerCase().includes("token required")
      record("2. Security: Reject Unauthenticated WebSocket Connection", isAuthError, `Correctly rejected: ${err.message}`)
      unauthSocket.disconnect()
      resolve()
    })
  })

  // 3. Invalid Token WebSocket Connection Rejection
  await new Promise((resolve) => {
    const invalidSocket = io(BASE_URL, {
      auth: { token: "invalid.jwt.token123" },
      transports: ["websocket"],
      reconnection: false,
      timeout: 3000,
    })

    invalidSocket.on("connect", () => {
      record("3. Security: Reject Invalid Token WebSocket Connection", false, "Unexpectedly connected with fake token")
      invalidSocket.disconnect()
      resolve()
    })

    invalidSocket.on("connect_error", (err) => {
      const isAuthError = err.message.toLowerCase().includes("authentication error") || err.message.toLowerCase().includes("invalid")
      record("3. Security: Reject Invalid Token WebSocket Connection", isAuthError, `Correctly rejected: ${err.message}`)
      invalidSocket.disconnect()
      resolve()
    })
  })

  // 4. Authenticate User & Admin via REST
  let user1Token = ""
  let user1Id = ""
  let user2Token = ""
  let user2Id = ""
  let adminToken = ""

  try {
    // Register/Login User 1
    let user1Res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "exp7user@pethaven.com", password: "User@12345" }),
    })
    let user1Data = await user1Res.json()
    if (!user1Res.ok) {
      const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Exp7 Test User",
          email: "exp7user@pethaven.com",
          password: "User@12345",
        }),
      })
      user1Data = await regRes.json()
    }
    user1Token = user1Data.token
    user1Id = user1Data.user?._id
    record("4.1 User 1 REST Authentication (Applicant)", !!user1Token, `User ID: ${user1Id}`)

    // Register/Login User 2 (for room isolation test)
    let user2Res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "user2_isolated@pethaven.com", password: "User@12345" }),
    })
    let user2Data = await user2Res.json()
    if (!user2Res.ok) {
      const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Isolated User 2",
          email: "user2_isolated@pethaven.com",
          password: "User@12345",
        }),
      })
      user2Data = await regRes.json()
    }
    user2Token = user2Data.token
    user2Id = user2Data.user?._id
    record("4.2 User 2 REST Authentication (Third-party)", !!user2Token, `User ID: ${user2Id}`)

    // Login Admin
    const adminRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin_demo@pethaven.com", password: "Admin@12345" }),
    })
    const adminData = await adminRes.json()
    adminToken = adminData.token
    record("4.3 Admin REST Authentication", !!adminToken, `Admin Role: ${adminData.user?.role}`)
  } catch (err) {
    record("4. REST Authentication Setup", false, err.message)
    return
  }

  // 5. Connect Valid Sockets
  let user1Socket = null
  let user2Socket = null
  let adminSocket = null

  const connectSocket = (token, label) => {
    return new Promise((resolve, reject) => {
      const s = io(BASE_URL, {
        auth: { token },
        transports: ["websocket"],
        reconnection: false,
        timeout: 4000,
      })
      s.on("connect", () => resolve(s))
      s.on("connect_error", (err) => reject(new Error(`${label} connection failed: ${err.message}`)))
    })
  }

  try {
    user1Socket = await connectSocket(user1Token, "User 1")
    record("5.1 User 1 WebSocket Connected with JWT", user1Socket.connected, `Socket ID: ${user1Socket.id}`)

    user2Socket = await connectSocket(user2Token, "User 2")
    record("5.2 User 2 WebSocket Connected with JWT", user2Socket.connected, `Socket ID: ${user2Socket.id}`)

    adminSocket = await connectSocket(adminToken, "Admin")
    record("5.3 Admin WebSocket Connected with JWT", adminSocket.connected, `Socket ID: ${adminSocket.id}`)
  } catch (err) {
    record("5. Authenticated WebSocket Connections", false, err.message)
    if (user1Socket) user1Socket.disconnect()
    if (user2Socket) user2Socket.disconnect()
    if (adminSocket) adminSocket.disconnect()
    return
  }

  // Fetch a pet to apply for
  const petsRes = await fetch(`${BASE_URL}/api/pets`)
  const petsData = await petsRes.json()
  const targetPet = Array.isArray(petsData) ? petsData[0] : (petsData.data ? petsData.data[0] : petsData)
  const targetPetId = targetPet.id || targetPet._id

  let createdAppId = ""

  // 6. Feature A: Real-Time Adoption Notifications to Admin
  await new Promise(async (resolve) => {
    let adminReceived = false
    let user1Received = false

    // Set up listeners
    adminSocket.on("new_adoption_application", (data) => {
      adminReceived = true
      record(
        "6.1 Feature A: Admin Receives 'new_adoption_application' Event",
        true,
        `Pet: ${data.petName}, Applicant: ${data.applicantName}, App ID: ${data.applicationId}`
      )
      checkDone()
    })

    user1Socket.on("new_adoption_application", () => {
      user1Received = true
      record(
        "6.2 Security: Normal User MUST NOT receive Admin-only Adoption Event",
        false,
        "Normal user leaked into admin room!"
      )
    })

    const checkDone = () => {
      setTimeout(() => {
        if (!user1Received) {
          record(
            "6.2 Security: Normal User Isolated from Admin-Only Broadcasts",
            true,
            "User 1 did NOT receive Admin-only new_adoption_application event"
          )
        }
        resolve()
      }, 500)
    }

    // Submit adoption application via REST API
    try {
      const submitRes = await fetch(`${BASE_URL}/api/adoptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user1Token}`,
        },
        body: JSON.stringify({
          petId: targetPetId,
          phone: "9876543210",
          address: "123 WS Test Street",
          reasonForAdoption: "Loving home for WS testing",
          previousPetExperience: "Yes, 3 years",
          livingSituation: "Apartment with balcony",
        }),
      })

      const submitData = await submitRes.json()
      if (submitRes.status === 201) {
        createdAppId = submitData.data._id
        record("6.0 REST API: Create Adoption Application", true, `Created App ID: ${createdAppId}`)
      } else {
        record("6.0 REST API: Create Adoption Application", false, submitData.message)
        resolve()
      }
    } catch (err) {
      record("6.0 REST API: Create Adoption Application", false, err.message)
      resolve()
    }
  })

  // 7. Feature B: Real-Time Application Status Updates (Approval & Rejection)
  if (createdAppId) {
    // 7.1 Test Approval Notification
    await new Promise(async (resolve) => {
      let user1Received = false
      let user2Received = false

      user1Socket.once("adoption_status_updated", (data) => {
        user1Received = true
        record(
          "7.1 Feature B: Applicant Receives Real-Time Approval Notification",
          data.status === "Approved" && data.applicationId === createdAppId,
          `Status: ${data.status}, Pet: ${data.petName}`
        )
      })

      user2Socket.once("adoption_status_updated", () => {
        user2Received = true
        record(
          "7.2 Security: User 2 MUST NOT receive User 1 Status Notification",
          false,
          "Third-party user received private notification!"
        )
      })

      // Admin approves via REST
      const approveRes = await fetch(`${BASE_URL}/api/adoptions/${createdAppId}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      const approveData = await approveRes.json()
      record("7.0 REST API: Approve Application", approveRes.status === 200, approveData.message)

      setTimeout(() => {
        if (!user2Received) {
          record(
            "7.2 Security: Private Room Isolation Between Users Verified",
            true,
            "User 2 received 0 events for User 1 status change"
          )
        }
        resolve()
      }, 500)
    })

    // 7.2 Test Rejection Notification
    await new Promise(async (resolve) => {
      user1Socket.once("adoption_status_updated", (data) => {
        record(
          "7.3 Feature B: Applicant Receives Real-Time Rejection Notification",
          data.status === "Rejected" && data.applicationId === createdAppId,
          `Status: ${data.status}, Pet: ${data.petName}`
        )
        resolve()
      })

      // Admin rejects via REST
      const rejectRes = await fetch(`${BASE_URL}/api/adoptions/${createdAppId}/reject`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      const rejectData = await rejectRes.json()
      record("7.2.1 REST API: Reject Application", rejectRes.status === 200, rejectData.message)
    })

    // 8. Clean up created test application
    const delRes = await fetch(`${BASE_URL}/api/adoptions/${createdAppId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    record("8. Clean up Test Adoption Application", delRes.status === 200, `Deleted App ID: ${createdAppId}`)
  }

  // Disconnect sockets cleanly
  if (user1Socket) user1Socket.disconnect()
  if (user2Socket) user2Socket.disconnect()
  if (adminSocket) adminSocket.disconnect()

  console.log("\n==================================================================")
  console.log("                        TEST RESULTS SUMMARY                      ")
  console.log("==================================================================")
  const passedCount = results.filter((r) => r.passed).length
  const failedCount = results.filter((r) => !r.passed).length
  console.log(`TOTAL TESTS:  ${results.length}`)
  console.log(`PASSED:       ${passedCount}`)
  console.log(`FAILED:       ${failedCount}`)
  console.log("==================================================================")

  if (failedCount > 0) {
    process.exit(1)
  }
}

runExp8Tests().catch((err) => {
  console.error("Test execution failed:", err)
  process.exit(1)
})
