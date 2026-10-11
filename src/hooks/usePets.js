import { useState, useEffect, useCallback } from "react"
import { pets as fallbackPets } from "../data/pets"
import { API_BASE_URL } from "../config/api"

function usePets() {
  const [pets, setPets] = useState(fallbackPets)
  const [loading, setLoading] = useState(true)

  const fetchPets = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/pets`)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const data = await response.json()
      const petList = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : null)
      if (petList && petList.length > 0) {
        setPets(petList)
      }
    } catch (error) {
      console.warn(
        "Backend REST API unavailable. Using fallback pet data from src/data/pets.js:",
        error.message
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPets()
  }, [fetchPets])

  // Create pet (Admin only)
  const createPet = async (petData, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(petData),
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        const errorMsg = data.errors ? data.errors.join(", ") : (data.message || "Failed to create pet")
        return { success: false, message: errorMsg }
      }

      await fetchPets()
      return { success: true, message: data.message, data: data.data }
    } catch (err) {
      return { success: false, message: err.message || "Network error" }
    }
  }

  // Update pet (Admin only)
  const updatePet = async (petData, petId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pets/${petId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(petData),
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        const errorMsg = data.errors ? data.errors.join(", ") : (data.message || "Failed to update pet")
        return { success: false, message: errorMsg }
      }

      await fetchPets()
      return { success: true, message: data.message, data: data.data }
    } catch (err) {
      return { success: false, message: err.message || "Network error" }
    }
  }

  // Delete pet (Admin only)
  const deletePet = async (petId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pets/${petId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        return { success: false, message: data.message || "Failed to delete pet" }
      }

      await fetchPets()
      return { success: true, message: data.message }
    } catch (err) {
      return { success: false, message: err.message || "Network error" }
    }
  }

  return {
    pets,
    loading,
    refetchPets: fetchPets,
    createPet,
    updatePet,
    deletePet,
  }
}

export default usePets