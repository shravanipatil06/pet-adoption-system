import { useState, useEffect, useContext } from "react"
import Navbar from "./components/Navbar"
import PetCard from "./components/PetCard"
import usePets from "./hooks/usePets"
import useAdoptions from "./hooks/useAdoptions"
import { FavoritesContext } from "./context/FavoritesContext"
import { AuthContext } from "./context/AuthContext"
import { SocketContext } from "./context/SocketContext"
import AuthModal from "./components/AuthModal"
import AdminPetModal from "./components/AdminPetModal"
import AdoptionApplicationModal from "./components/AdoptionApplicationModal"
import AdminAdoptionsView from "./components/AdminAdoptionsView"
import NotificationToast from "./components/NotificationToast"

function App() {
  const [search, setSearch] = useState("")
  const [selectedPet, setSelectedPet] = useState(null)
  const [category, setCategory] = useState("All")

  // Auth & Admin state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isAdminPetModalOpen, setIsAdminPetModalOpen] = useState(false)
  const [editingPet, setEditingPet] = useState(null)
  const [actionNotice, setActionNotice] = useState(null)

  // Adoption Modal & Application state
  const [isAdoptionModalOpen, setIsAdoptionModalOpen] = useState(false)
  const [selectedPetForAdoption, setSelectedPetForAdoption] = useState(null)

  // Context API
  const { favorites, dispatch } = useContext(FavoritesContext)
  const { token, isAuthenticated, isAdmin, user } = useContext(AuthContext)
  const { lastEvent } = useContext(SocketContext)

  // Custom Hooks
  const { pets, createPet, updatePet, deletePet } = usePets()
  const {
    myApplications,
    allApplications,
    fetchMyApplications,
    fetchAllApplications,
    submitApplication,
    approveApplication,
    rejectApplication,
    deleteApplication,
  } = useAdoptions()

  // Fetch adoption applications when auth state changes
  useEffect(() => {
    if (token) {
      if (isAdmin) {
        fetchAllApplications(token)
      } else {
        fetchMyApplications(token)
      }
    }
  }, [token, isAdmin, fetchMyApplications, fetchAllApplications])

  // Auto-refresh applications when real-time WebSocket event arrives
  useEffect(() => {
    if (!lastEvent || !token) return
    if (lastEvent.type === "new_application" && isAdmin) {
      fetchAllApplications(token)
    } else if (lastEvent.type === "status_update" && !isAdmin) {
      fetchMyApplications(token)
    }
  }, [lastEvent, token, isAdmin, fetchAllApplications, fetchMyApplications])

  // Update browser tab title
  useEffect(() => {
    if (selectedPet) {
      document.title = `${selectedPet.name} | Pet Haven 🐾`
    } else {
      document.title = "Pet Haven 🐾"
    }
  }, [selectedPet])

  // Search + Category Filter
  const filteredPets = pets.filter((pet) => {
    const matchesSearch =
      pet.name.toLowerCase().includes(search.toLowerCase()) ||
      pet.breed.toLowerCase().includes(search.toLowerCase())

    const matchesCategory =
      category === "All" || pet.type === category

    return matchesSearch && matchesCategory
  })

  // Handle Admin Save (Create or Update Pet)
  const handleSavePet = async (petData, petId) => {
    if (!isAdmin || !token) {
      return { success: false, message: "Unauthorized: Admin privileges required" }
    }

    let res
    if (petId) {
      res = await updatePet(petData, petId, token)
    } else {
      res = await createPet(petData, token)
    }

    if (res.success) {
      setActionNotice({
        type: "success",
        text: petId ? "Pet listing updated successfully!" : "New pet listing added successfully!",
      })
      setTimeout(() => setActionNotice(null), 4000)
    }
    return res
  }

  // Handle Admin Delete Pet
  const handleDeletePet = async (petId, petName) => {
    if (!isAdmin || !token) return
    if (window.confirm(`Are you sure you want to delete ${petName}?`)) {
      const res = await deletePet(petId, token)
      if (res.success) {
        setActionNotice({
          type: "success",
          text: `Pet "${petName}" was deleted successfully.`,
        })
        if (selectedPet?.id === petId || selectedPet?._id === petId) {
          setSelectedPet(null)
        }
        setTimeout(() => setActionNotice(null), 4000)
      } else {
        setActionNotice({
          type: "error",
          text: res.message || "Failed to delete pet.",
        })
      }
    }
  }

  // Handle User Submit Adoption Application
  const handleSubmitAdoption = async (applicationData) => {
    if (!token) {
      return { success: false, message: "Please log in to submit an adoption application." }
    }
    const res = await submitApplication(applicationData, token)
    if (res.success) {
      setActionNotice({
        type: "success",
        text: `Adoption application for ${selectedPetForAdoption?.name} submitted successfully! Status: Pending.`,
      })
      setTimeout(() => setActionNotice(null), 5000)
    }
    return res
  }

  // Handle Admin Approve Application
  const handleAdminApproveApp = async (appId) => {
    if (!token || !isAdmin) return
    const res = await approveApplication(appId, token)
    if (res.success) {
      setActionNotice({
        type: "success",
        text: "Adoption application approved successfully!",
      })
      setTimeout(() => setActionNotice(null), 4000)
    } else {
      setActionNotice({
        type: "error",
        text: res.message || "Failed to approve application.",
      })
    }
  }

  // Handle Admin Reject Application
  const handleAdminRejectApp = async (appId) => {
    if (!token || !isAdmin) return
    const res = await rejectApplication(appId, token)
    if (res.success) {
      setActionNotice({
        type: "success",
        text: "Adoption application rejected.",
      })
      setTimeout(() => setActionNotice(null), 4000)
    } else {
      setActionNotice({
        type: "error",
        text: res.message || "Failed to reject application.",
      })
    }
  }

  // Handle Admin Delete Application
  const handleAdminDeleteApp = async (appId) => {
    if (!token || !isAdmin) return
    const res = await deleteApplication(appId, token)
    if (res.success) {
      setActionNotice({
        type: "success",
        text: "Adoption application permanently deleted.",
      })
      setTimeout(() => setActionNotice(null), 4000)
    } else {
      setActionNotice({
        type: "error",
        text: res.message || "Failed to delete application.",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-violet-100">
      {/* Real-time Notification Toast Banner */}
      <NotificationToast />

      {/* ================= NAVBAR ================= */}
      <Navbar onOpenAuthModal={() => setIsAuthModalOpen(true)} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Admin Add/Edit Pet Modal */}
      <AdminPetModal
        isOpen={isAdminPetModalOpen}
        onClose={() => {
          setIsAdminPetModalOpen(false)
          setEditingPet(null)
        }}
        petToEdit={editingPet}
        onSave={handleSavePet}
      />

      {/* Adoption Application Modal */}
      <AdoptionApplicationModal
        isOpen={isAdoptionModalOpen}
        onClose={() => {
          setIsAdoptionModalOpen(false)
          setSelectedPetForAdoption(null)
        }}
        pet={selectedPetForAdoption}
        onSubmit={handleSubmitAdoption}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Global Notification Banner */}
      {actionNotice && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div
            className={`p-4 rounded-2xl flex items-center justify-between font-medium shadow-sm ${
              actionNotice.type === "success"
                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            <span>{actionNotice.type === "success" ? "✅" : "⚠️"} {actionNotice.text}</span>
            <button
              onClick={() => setActionNotice(null)}
              className="text-sm opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ================= HERO SECTION ================= */}
      <section id="home" className="relative overflow-hidden">
        <div className="absolute top-20 right-10 text-purple-200 text-6xl rotate-12">
          🐾
        </div>
        <div className="absolute bottom-10 left-10 text-purple-100 text-5xl -rotate-12">
          🐾
        </div>

        <div className="max-w-7xl mx-auto px-6 py-20 md:py-28">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-5 py-2 rounded-full font-medium mb-8">
            🐾 Find your perfect companion
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-800 leading-tight max-w-4xl">
            Give a Pet a{" "}
            <span className="text-purple-600">
              Forever Home
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mt-6 leading-relaxed">
            Browse loving pets waiting for adoption and find a companion
            who is ready to become a part of your family.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              onClick={() =>
                document
                  .getElementById("pets")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="bg-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-purple-700 transition shadow-lg shadow-purple-200"
            >
              Browse Pets →
            </button>

            <button
              onClick={() =>
                document
                  .getElementById("process")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold border border-purple-200 hover:bg-purple-50 transition"
            >
              How Adoption Works
            </button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mt-14">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-purple-100">
              <h3 className="text-3xl font-bold text-purple-600">
                50+
              </h3>
              <p className="text-slate-500 mt-1">
                Pets Available
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-purple-100">
              <h3 className="text-3xl font-bold text-purple-600">
                20+
              </h3>
              <p className="text-slate-500 mt-1">
                Happy Adoptions
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-purple-100">
              <h3 className="text-3xl font-bold text-purple-600">
                10+
              </h3>
              <p className="text-slate-500 mt-1">
                Trusted Shelters
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHY PET HAVEN ================= */}
      <section id="why-us" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-purple-600 font-semibold mb-2">
              WHY PET HAVEN?
            </p>

            <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
              Making Pet Adoption Easier
            </h2>

            <p className="text-slate-500 mt-3">
              Everything you need to find your new best friend.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-purple-50 rounded-2xl p-8 text-center border border-purple-100 hover:shadow-lg hover:-translate-y-1 transition">
              <div className="text-4xl mb-4">❤️</div>
              <h3 className="text-xl font-bold text-slate-800">
                Loving Companions
              </h3>
              <p className="text-slate-500 mt-3">
                Discover friendly pets looking for a loving forever home.
              </p>
            </div>

            <div className="bg-purple-50 rounded-2xl p-8 text-center border border-purple-100 hover:shadow-lg hover:-translate-y-1 transition">
              <div className="text-4xl mb-4">🏠</div>
              <h3 className="text-xl font-bold text-slate-800">
                Trusted Shelters
              </h3>
              <p className="text-slate-500 mt-3">
                Connect with shelters and learn more about available pets.
              </p>
            </div>

            <div className="bg-purple-50 rounded-2xl p-8 text-center border border-purple-100 hover:shadow-lg hover:-translate-y-1 transition">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-bold text-slate-800">
                Easy Adoption
              </h3>
              <p className="text-slate-500 mt-3">
                Browse pets and easily explore the details of each one.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW ADOPTION WORKS ================= */}
      <section id="process" className="bg-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-purple-600 font-semibold mb-2">
              SIMPLE & EASY
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
              How Adoption Works 🐾
            </h2>
            <p className="text-slate-500 mt-3">
              A simple journey towards bringing your new friend home.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-7 text-center shadow-sm border border-purple-100">
              <div className="w-12 h-12 mx-auto bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-lg">
                01
              </div>
              <h3 className="text-lg font-bold text-slate-800 mt-5">
                Browse Pets
              </h3>
              <p className="text-slate-500 text-sm mt-2">
                Explore pets that are looking for a forever home.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-7 text-center shadow-sm border border-purple-100">
              <div className="w-12 h-12 mx-auto bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-lg">
                02
              </div>
              <h3 className="text-lg font-bold text-slate-800 mt-5">
                Choose a Pet
              </h3>
              <p className="text-slate-500 text-sm mt-2">
                View the details and find a companion that suits you.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-7 text-center shadow-sm border border-purple-100">
              <div className="w-12 h-12 mx-auto bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-lg">
                03
              </div>
              <h3 className="text-lg font-bold text-slate-800 mt-5">
                Apply
              </h3>
              <p className="text-slate-500 text-sm mt-2">
                Submit an adoption application for your chosen pet.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-7 text-center shadow-sm border border-purple-100">
              <div className="w-12 h-12 mx-auto bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-lg">
                04
              </div>
              <h3 className="text-lg font-bold text-slate-800 mt-5">
                Welcome Home
              </h3>
              <p className="text-slate-500 text-sm mt-2">
                Give your new companion a loving forever home.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PETS SECTION ================= */}
      <section id="pets" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-10">
          <p className="text-purple-600 font-semibold mb-2">
            MEET YOUR NEW FRIEND
          </p>

          <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
            Meet Our Lovely Pets 🐾
          </h2>

          <p className="text-slate-500 mt-3">
            These adorable pets are waiting for their forever home.
          </p>
        </div>

        {/* ADMIN CONTROLS BAR */}
        {isAdmin && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🛡️</span>
              <div>
                <h4 className="font-bold text-amber-900">
                  Shelter Admin Mode Active
                </h4>
                <p className="text-xs text-amber-700">
                  Authenticated as <strong>{user?.name}</strong> (Role: Admin). Manage pet listings or review adoption applications below.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingPet(null)
                setIsAdminPetModalOpen(true)
              }}
              className="bg-amber-600 text-white font-medium px-5 py-2.5 rounded-xl hover:bg-amber-700 transition shadow-sm shrink-0 flex items-center gap-2"
            >
              <span>➕</span> Add New Pet (Admin)
            </button>
          </div>
        )}

        {/* Search */}
        <div className="max-w-xl mx-auto mb-7">
          <input
            type="text"
            placeholder="🔍 Search pets by name or breed..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-5 py-4 bg-white border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {["All", "Dog", "Cat", "Other"].map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`px-6 py-2.5 rounded-full font-medium transition ${
                category === item
                  ? "bg-purple-600 text-white shadow-md"
                  : "bg-white text-purple-600 border border-purple-200 hover:bg-purple-50"
              }`}
            >
              {item === "All" && "🐾 "}
              {item === "Dog" && "🐶 "}
              {item === "Cat" && "🐱 "}
              {item === "Other" && "🐰 "}

              {item === "All"
                ? "All Pets"
                : item === "Other"
                ? "Others"
                : `${item}s`}
            </button>
          ))}
        </div>

        {/* Pet Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPets.map((pet) => (
            <div key={pet.id || pet._id} className="relative group flex flex-col">
              <PetCard
                id={pet.id || pet._id}
                name={pet.name}
                breed={pet.breed}
                age={pet.age}
                gender={pet.gender}
                image={pet.image}
                onViewDetails={() => setSelectedPet(pet)}
                onApply={() => {
                  setSelectedPetForAdoption(pet)
                  setIsAdoptionModalOpen(true)
                }}
              />

              {/* Admin Overlay Actions on Pet Card */}
              {isAdmin && (
                <div className="mt-2 flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setEditingPet(pet)
                      setIsAdminPetModalOpen(true)
                    }}
                    className="text-xs bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1.5 rounded-lg font-semibold hover:bg-amber-200 transition"
                  >
                    ✏️ Edit (Admin)
                  </button>
                  <button
                    onClick={() => handleDeletePet(pet.id || pet._id, pet.name)}
                    className="text-xs bg-red-100 text-red-700 border border-red-300 px-3 py-1.5 rounded-lg font-semibold hover:bg-red-200 transition"
                  >
                    🗑️ Delete (Admin)
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredPets.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🐾</div>
            <p className="text-slate-500">
              No pets found. Try another name, breed or category.
            </p>
          </div>
        )}

        {/* Pet Details Modal */}
        {selectedPet && (
          <div className="mt-12 max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-purple-100 p-8">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-purple-600 font-semibold">
                  Pet Details
                </p>
                <h3 className="text-3xl font-bold text-slate-800 mt-1">
                  {selectedPet.name}
                </h3>
              </div>

              <button
                onClick={() => setSelectedPet(null)}
                className="text-slate-400 hover:text-purple-600 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-2 text-slate-600">
              <p>
                <strong>Breed:</strong> {selectedPet.breed}
              </p>
              <p>
                <strong>Age:</strong> {selectedPet.age} years
              </p>
              <p>
                <strong>Gender:</strong> {selectedPet.gender}
              </p>
              <p>
                <strong>Type:</strong> {selectedPet.type}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedPet(null)}
                  className="bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl hover:bg-slate-200 transition text-sm font-medium"
                >
                  Close
                </button>

                <button
                  onClick={() => {
                    const targetPet = selectedPet
                    setSelectedPet(null)
                    setSelectedPetForAdoption(targetPet)
                    setIsAdoptionModalOpen(true)
                  }}
                  className="bg-purple-600 text-white px-6 py-2.5 rounded-xl hover:bg-purple-700 transition text-sm font-semibold flex items-center gap-1.5 shadow-md shadow-purple-200"
                >
                  <span>🐾</span> Apply for Adoption
                </button>
              </div>

              {isAdmin && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingPet(selectedPet)
                      setIsAdminPetModalOpen(true)
                    }}
                    className="bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-medium hover:bg-amber-600"
                  >
                    ✏️ Edit Listing
                  </button>
                  <button
                    onClick={() => handleDeletePet(selectedPet.id || selectedPet._id, selectedPet.name)}
                    className="bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-medium hover:bg-red-600"
                  >
                    🗑️ Delete Listing
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ================= USER MY APPLICATIONS SECTION ================= */}
      {isAuthenticated && !isAdmin && (
        <section id="my-applications" className="max-w-7xl mx-auto px-6 py-12">
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-purple-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-purple-100">
              <div>
                <span className="text-purple-600 font-semibold text-xs uppercase tracking-wider">
                  Adopter Dashboard
                </span>
                <h2 className="text-3xl font-bold text-slate-800 mt-1">
                  My Adoption Applications 📋
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Track the status of your submitted adoption requests.
                </p>
              </div>

              <button
                onClick={() => fetchMyApplications(token)}
                className="bg-purple-50 text-purple-700 border border-purple-200 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-purple-100 transition"
              >
                🔄 Refresh My Statuses
              </button>
            </div>

            {myApplications.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myApplications.map((app) => (
                  <div
                    key={app._id}
                    className="bg-purple-50/50 rounded-2xl p-5 border border-purple-100 hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                            app.status === "Pending"
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : app.status === "Approved"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-red-100 text-red-800 border border-red-300"
                          }`}
                        >
                          {app.status === "Pending" && "⏳ "}
                          {app.status === "Approved" && "✅ "}
                          {app.status === "Rejected" && "❌ "}
                          {app.status}
                        </span>

                        <span className="text-[11px] text-slate-400">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-purple-100 mb-3">
                        <img
                          src={app.pet?.image || "https://via.placeholder.com/80"}
                          alt={app.pet?.name || "Pet"}
                          className="w-14 h-14 object-cover rounded-lg"
                        />
                        <div>
                          <h4 className="font-bold text-slate-800">
                            {app.pet?.name || "Pet"}
                          </h4>
                          <p className="text-xs text-purple-600 font-medium">
                            {app.pet?.breed}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {app.pet?.age} years • {app.pet?.gender}
                          </p>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 space-y-1 bg-white/60 p-3 rounded-xl border border-purple-100/50">
                        <p><strong>Phone:</strong> {app.phone}</p>
                        <p><strong>Address:</strong> {app.address}</p>
                        <p className="line-clamp-2"><strong>Reason:</strong> {app.reasonForAdoption}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-purple-100 text-right">
                      <span className="text-[11px] text-slate-400">
                        Status: <strong className="text-slate-700">{app.status}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-purple-50/40 rounded-2xl border border-purple-100">
                <div className="text-4xl mb-3">🐾</div>
                <h4 className="font-bold text-slate-700">No Applications Submitted Yet</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Browse our pets above and click <strong>"Apply"</strong> to submit an adoption request!
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ================= ADMIN ADOPTION PORTAL ================= */}
      {isAuthenticated && isAdmin && (
        <section id="admin-adoptions" className="max-w-7xl mx-auto px-6">
          <AdminAdoptionsView
            applications={allApplications}
            onApprove={handleAdminApproveApp}
            onReject={handleAdminRejectApp}
            onDelete={handleAdminDeleteApp}
            onRefresh={() => fetchAllApplications(token)}
          />
        </section>
      )}

      {/* ================= FAVORITES SECTION ================= */}
      <section id="favorites" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-purple-600 font-semibold mb-2">
              YOUR SAVED PETS
            </p>

            <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
              My Favorites ❤️
            </h2>

            <p className="text-slate-500 mt-3">
              Pets you have saved for later.
            </p>
          </div>

          {/* Clear All Favorites */}
          {favorites.length > 0 && (
            <div className="flex justify-end mb-6">
              <button
                onClick={() =>
                  dispatch({
                    type: "CLEAR_FAVORITES",
                  })
                }
                className="px-5 py-2.5 rounded-xl border border-red-200 text-red-600 font-medium hover:bg-red-50 transition"
              >
                Clear All Favorites
              </button>
            </div>
          )}

          {/* Favorite Pets */}
          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {favorites.map((pet) => (
                <div
                  key={pet.id || pet._id}
                  className="bg-purple-50 rounded-2xl p-5 border border-purple-100 flex flex-col justify-between"
                >
                  <div>
                    <img
                      src={pet.image}
                      alt={pet.name}
                      className="w-full h-48 object-cover rounded-xl"
                    />

                    <h3 className="text-xl font-bold text-slate-800 mt-4">
                      {pet.name}
                    </h3>

                    <p className="text-purple-600 font-medium mt-1">
                      {pet.breed}
                    </p>

                    <p className="text-slate-500 mt-1 text-sm">
                      {pet.age} years • {pet.gender}
                    </p>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedPetForAdoption(pet)
                        setIsAdoptionModalOpen(true)
                      }}
                      className="flex-1 bg-purple-600 text-white py-2.5 rounded-xl font-medium text-xs hover:bg-purple-700"
                    >
                      Apply Now
                    </button>
                    <button
                      onClick={() =>
                        dispatch({
                          type: "REMOVE_FAVORITE",
                          payload: pet.id || pet._id,
                        })
                      }
                      className="px-3 py-2.5 border border-purple-200 text-purple-700 rounded-xl font-medium text-xs hover:bg-purple-100 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-purple-50 rounded-2xl border border-purple-100">
              <div className="text-5xl mb-4">🐾</div>
              <h3 className="text-xl font-semibold text-slate-700">
                No Favorite Pets Yet
              </h3>
              <p className="text-slate-500 mt-2">
                Click the heart on a pet to add it to your favorites.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ================= ADOPTION CTA ================= */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto bg-gradient-to-r from-purple-600 to-violet-600 rounded-3xl px-8 py-14 md:px-16 text-center text-white shadow-xl">
          <div className="text-4xl mb-4">🐾</div>

          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Find Your New Best Friend?
          </h2>

          <p className="text-purple-100 max-w-2xl mx-auto mt-4">
            Start exploring our adorable pets and take the first step
            towards giving one of them a loving forever home.
          </p>

          <button
            onClick={() =>
              document
                .getElementById("pets")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="mt-7 bg-white text-purple-700 px-8 py-3 rounded-xl font-semibold hover:bg-purple-50 transition shadow-md"
          >
            Browse Available Pets →
          </button>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-purple-950 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Brand */}
            <div>
              <h3 className="text-2xl font-bold">
                🐾 Pet Haven
              </h3>
              <p className="text-purple-200 mt-4 text-sm leading-relaxed">
                Helping loving pets find caring families and
                forever homes.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-lg mb-4">
                Quick Links
              </h4>

              <div className="flex flex-col gap-3 text-purple-200 text-sm">
                <a href="#home" className="hover:text-white transition">
                  Home
                </a>
                <a href="#pets" className="hover:text-white transition">
                  Browse Pets
                </a>
                <a href="#why-us" className="hover:text-white transition">
                  About
                </a>
                <a href="#favorites" className="hover:text-white transition">
                  Favorites
                </a>
              </div>
            </div>

            {/* For Shelters */}
            <div>
              <h4 className="font-semibold text-lg mb-4">
                For Shelters
              </h4>

              <div className="flex flex-col gap-3 text-purple-200 text-sm">
                <a href="#" className="hover:text-white transition">
                  Partner With Us
                </a>
                <a href="#" className="hover:text-white transition">
                  Shelter Information
                </a>
                <a href="#" className="hover:text-white transition">
                  Contact Our Team
                </a>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-lg mb-4">
                Contact
              </h4>

              <div className="text-purple-200 text-sm space-y-3">
                <p>📧 pet@pethaven.com</p>
                <p>📞 +91 98765 43210</p>
                <p>📍 Mumbai, India</p>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-purple-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-purple-300 text-sm">
              © 2026 Pet Haven. All rights reserved.
            </p>
            <p className="text-purple-300 text-sm">
              Made with ❤️ for pets
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App