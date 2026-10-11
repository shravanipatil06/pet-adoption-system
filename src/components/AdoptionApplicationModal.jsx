import { useState, useContext } from "react"
import { AuthContext } from "../context/AuthContext"

function AdoptionApplicationModal({ isOpen, onClose, pet, onSubmit, onOpenAuthModal }) {
  const { user, isAuthenticated } = useContext(AuthContext)

  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [reasonForAdoption, setReasonForAdoption] = useState("")
  const [previousPetExperience, setPreviousPetExperience] = useState("")
  const [livingSituation, setLivingSituation] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen)
    if (isOpen) {
      setPhone("")
      setAddress("")
      setReasonForAdoption("")
      setPreviousPetExperience("")
      setLivingSituation("")
      setError("")
    }
  }

  if (!isOpen || !pet) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    const applicationData = {
      petId: pet.id || pet._id,
      phone: phone.trim(),
      address: address.trim(),
      reasonForAdoption: reasonForAdoption.trim(),
      previousPetExperience: previousPetExperience.trim(),
      livingSituation: livingSituation.trim(),
    }

    try {
      const res = await onSubmit(applicationData)
      if (res.success) {
        onClose()
      } else {
        setError(res.message || "Failed to submit application")
      }
    } catch (err) {
      setError(err.message || "An error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-purple-100 p-7 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-purple-600 text-xl font-bold"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-purple-100">
          <img
            src={pet.image}
            alt={pet.name}
            className="w-16 h-16 object-cover rounded-xl border border-purple-200 shadow-xs"
          />
          <div>
            <div className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
              Adoption Application
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              Apply to Adopt {pet.name} 🐾
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {pet.breed} • {pet.age} years • {pet.gender}
            </p>
          </div>
        </div>

        {/* Unauthenticated State Alert */}
        {!isAuthenticated ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">🔐</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              Authentication Required
            </h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
              You must be logged in to your Pet Haven account to submit an adoption application.
            </p>
            <button
              onClick={() => {
                onClose()
                onOpenAuthModal()
              }}
              className="bg-purple-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-purple-700 transition shadow-lg shadow-purple-200"
            >
              Log In / Sign Up to Continue
            </button>
          </div>
        ) : (
          /* Application Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3.5 rounded-xl">
                ⚠️ {error}
              </div>
            )}

            {/* Applicant Static Readonly Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-purple-50/60 p-3.5 rounded-xl border border-purple-100 text-xs">
              <div>
                <span className="text-slate-500 font-medium">Applicant:</span>{" "}
                <span className="font-bold text-slate-800">{user?.name}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Email:</span>{" "}
                <span className="font-bold text-slate-800">{user?.email}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-purple-50/40 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Residence Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="Street, City, Pincode"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2.5 bg-purple-50/40 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Reason for Adoption
              </label>
              <textarea
                required
                rows={2}
                placeholder="Why do you want to adopt this pet?"
                value={reasonForAdoption}
                onChange={(e) => setReasonForAdoption(e.target.value)}
                className="w-full px-4 py-2.5 bg-purple-50/40 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Previous Pet Experience
              </label>
              <textarea
                required
                rows={2}
                placeholder="Have you owned pets before? Describe your experience."
                value={previousPetExperience}
                onChange={(e) => setPreviousPetExperience(e.target.value)}
                className="w-full px-4 py-2.5 bg-purple-50/40 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Living Situation
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Own apartment, Fenced yard, Family with 2 kids"
                value={livingSituation}
                onChange={(e) => setLivingSituation(e.target.value)}
                className="w-full px-4 py-2.5 bg-purple-50/40 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-purple-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-purple-200 text-slate-600 font-medium hover:bg-purple-50 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 shadow-md shadow-purple-200 disabled:opacity-50 text-sm"
              >
                {submitting ? "Submitting Application..." : "Submit Application"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default AdoptionApplicationModal
