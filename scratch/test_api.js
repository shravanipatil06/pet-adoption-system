
async function runTests() {
  console.log("=== STARTING REST API EXPERIMENT 5 VERIFICATION TESTS ===\n")
  let passed = 0
  let total = 0

  function assert(condition, message) {
    total++
    if (condition) {
      console.log(`✅ PASSED: ${message}`)
      passed++
    } else {
      console.error(`❌ FAILED: ${message}`)
    }
  }

  try {
    // 1. Health Check
    const resHealth = await fetch("http://localhost:5000/")
    const dataHealth = await resHealth.json()
    assert(resHealth.status === 200 && dataHealth.success === true, "Health Check Endpoint GET /")

    // Check Helmet security headers
    assert(resHealth.headers.get("x-dns-prefetch-control") !== null, "Helmet Security Header Check")

    // 2. GET /api/pets
    const resPets = await fetch("http://localhost:5000/api/pets")
    const pets = await resPets.json()
    assert(resPets.status === 200 && Array.isArray(pets) && pets.length >= 5, `GET /api/pets returned ${pets?.length} pets`)

    // Check Coco exists
    const coco = pets.find(p => p.name === "Coco" || p.id === 1)
    assert(coco !== undefined, "Original Pet 'Coco' exists in database")

    // 3. GET /api/pets/:id (valid)
    const resSingle = await fetch("http://localhost:5000/api/pets/1")
    const singlePet = await resSingle.json()
    assert(resSingle.status === 200 && (singlePet.id === 1 || singlePet.name === "Coco"), "GET /api/pets/1 returns valid pet")

    // 4. GET /api/pets/:id (non-existent)
    const resNotFound = await fetch("http://localhost:5000/api/pets/99999")
    const dataNotFound = await resNotFound.json()
    assert(resNotFound.status === 404 && dataNotFound.success === false, "GET /api/pets/99999 returns 404 Not Found")

    // 5. GET /api/invalid-route
    const resInvalidRoute = await fetch("http://localhost:5000/api/invalid-route")
    const dataInvalidRoute = await resInvalidRoute.json()
    assert(resInvalidRoute.status === 404 && dataInvalidRoute.success === false && dataInvalidRoute.message.includes("Route not found"), "Invalid API route returns 404 JSON error")

    // 6. POST invalid pet (negative age & bad gender)
    const resPostInvalid = await fetch("http://localhost:5000/api/pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "BadPet",
        breed: "Mix",
        age: -5,
        gender: "UnknownGender",
        type: "Dog",
        image: "https://example.com/pet.jpg"
      })
    })
    const dataPostInvalid = await resPostInvalid.json()
    assert(resPostInvalid.status === 400 && dataPostInvalid.success === false && dataPostInvalid.errors.length > 0, "POST with invalid input rejected with 400 Bad Request & error list")

    // 7. POST valid temporary test pet
    const tempPetId = 9999
    const resPostValid = await fetch("http://localhost:5000/api/pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: tempPetId,
        name: "TempTestPet",
        breed: "Golden Retriever",
        age: 2,
        gender: "Male",
        type: "Dog",
        image: "https://images.unsplash.com/photo-1552053831-71594a27632d"
      })
    })
    const dataPostValid = await resPostValid.json()
    assert(resPostValid.status === 201 && dataPostValid.success === true && dataPostValid.data.name === "TempTestPet", "POST with valid input creates pet (201 Created)")

    // 8. PUT invalid update on temporary pet
    const resPutInvalid = await fetch(`http://localhost:5000/api/pets/${tempPetId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gender: "InvalidGender" })
    })
    const dataPutInvalid = await resPutInvalid.json()
    assert(resPutInvalid.status === 400 && dataPutInvalid.success === false, "PUT with invalid gender rejected with 400")

    // 9. PUT valid update on temporary pet
    const resPutValid = await fetch(`http://localhost:5000/api/pets/${tempPetId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ age: 3, name: "UpdatedTempPet" })
    })
    const dataPutValid = await resPutValid.json()
    assert(resPutValid.status === 200 && dataPutValid.success === true && dataPutValid.data.age === 3, "PUT with valid input updates pet (200 OK)")

    // 10. DELETE temporary pet
    const resDelete = await fetch(`http://localhost:5000/api/pets/${tempPetId}`, {
      method: "DELETE"
    })
    const dataDelete = await resDelete.json()
    assert(resDelete.status === 200 && dataDelete.success === true, "DELETE temporary test pet (200 OK)")

    // 11. Final verification of pet count (should still have original pets)
    const resFinalPets = await fetch("http://localhost:5000/api/pets")
    const finalPets = await resFinalPets.json()
    assert(finalPets.length === pets.length, `Database pet count unchanged after cleanup (${finalPets.length} pets)`)

    console.log(`\n=== TEST SUMMARY: ${passed}/${total} TESTS PASSED ===`)
  } catch (err) {
    console.error("Test execution failed:", err)
  }
}

runTests()
