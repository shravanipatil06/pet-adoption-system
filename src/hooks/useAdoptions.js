import { useState, useCallback } from "react"
import { API_BASE_URL } from "../config/api"

function useAdoptions() {
  const [myApplications, setMyApplications] = useState([])
  const [allApplications, setAllApplications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch logged in user's adoption applications
  const fetchMyApplications = useCallback(async (token) => {
    if (!token) return
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE_URL}/api/adoptions/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setMyApplications(data.data)
      } else {
        setError(data.message || "Failed to fetch applications")
      }
    } catch (err) {
      setError(err.message || "Network error")
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch all applications (Admin only)
  const fetchAllApplications = useCallback(async (token) => {
    if (!token) return
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE_URL}/api/adoptions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setAllApplications(data.data)
      } else {
        setError(data.message || "Failed to fetch all applications")
      }
    } catch (err) {
      setError(err.message || "Network error")
    } finally {
      setLoading(false)
    }
  }, [])

  // Submit new application (User)
  const submitApplication = async (applicationData, token) => {
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/adoptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(applicationData),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        const errorMsg = data.errors ? data.errors.join(", ") : (data.message || "Submission failed")
        return { success: false, message: errorMsg }
      }
      // Refresh my applications
      await fetchMyApplications(token)
      return { success: true, message: data.message, data: data.data }
    } catch (err) {
      return { success: false, message: err.message || "Network error" }
    }
  }

  // Approve application (Admin)
  const approveApplication = async (applicationId, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/adoptions/${applicationId}/approve`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || "Approval failed" }
      }
      await fetchAllApplications(token)
      return { success: true, message: data.message, data: data.data }
    } catch (err) {
      return { success: false, message: err.message || "Network error" }
    }
  }

  // Reject application (Admin)
  const rejectApplication = async (applicationId, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/adoptions/${applicationId}/reject`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || "Rejection failed" }
      }
      await fetchAllApplications(token)
      return { success: true, message: data.message, data: data.data }
    } catch (err) {
      return { success: false, message: err.message || "Network error" }
    }
  }

  // Delete application (Admin)
  const deleteApplication = async (applicationId, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/adoptions/${applicationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || "Deletion failed" }
      }
      await fetchAllApplications(token)
      return { success: true, message: data.message }
    } catch (err) {
      return { success: false, message: err.message || "Network error" }
    }
  }

  return {
    myApplications,
    allApplications,
    loading,
    error,
    fetchMyApplications,
    fetchAllApplications,
    submitApplication,
    approveApplication,
    rejectApplication,
    deleteApplication,
  }
}

export default useAdoptions
