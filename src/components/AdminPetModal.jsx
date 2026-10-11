import { useState, useEffect } from "react"

function AdminPetModal({ isOpen, onClose, petToEdit, onSave }) {
  const [name, setName] = useState("")
  const [breed, setBreed] = useState("")
  const [age, setAge] = useState("")
  const [gender, setGender] = useState("Male")
  const [type, setType] = useState("Dog")
  const [image, setImage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (petToEdit) {
      setName(petToEdit.name || "")
      setBreed(petToEdit.breed || "")
      setAge(petToEdit.age !== undefined ? String(petToEdit.age) : "")
      setGender(petToEdit.gender || "Male")
      setType(petToEdit.type || "Dog")
      setImage(petToEdit.image || "")
    } else {
      setName("")
      setBreed("")
      setAge("")
      setGender("Male")
      setType("Dog")
      setImage("https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&q=80")
    }
    setError("")
  }, [petToEdit, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    const petData = {
      name: name.trim(),
      breed: breed.trim(),
      age: Number(age),
      gender,
      type,
      image: image.trim(),
    }

    try {
      const result = await onSave(petData, petToEdit?.id || petToEdit?._id)
      if (result.success) {
        onClose()
      } else {
        setError(result.message || "Failed to save pet listing")
      }
    } catch (err) {
      setError(err.message || "An error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-purple-100 p-7 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-purple-600 text-xl font-bold"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">🛡️</span>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {petToEdit ? "Edit Pet Listing (Admin)" : "Add New Pet (Admin)"}
            </h2>
            <p className="text-slate-500 text-xs">
              Shelter Management Portal • Protected Endpoint
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Pet Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Buddy"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-purple-50/50 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Breed
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Golden Retriever"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full px-4 py-2.5 bg-purple-50/50 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Age (Years)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                placeholder="e.g. 2"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-4 py-2.5 bg-purple-50/50 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-2.5 bg-purple-50/50 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2.5 bg-purple-50/50 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Image URL / Path
            </label>
            <input
              type="text"
              required
              placeholder="https://..."
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full px-4 py-2.5 bg-purple-50/50 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-purple-200 text-slate-600 font-medium hover:bg-purple-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 shadow-md shadow-purple-200 disabled:opacity-50"
            >
              {submitting ? "Saving..." : petToEdit ? "Update Pet" : "Add Pet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminPetModal
