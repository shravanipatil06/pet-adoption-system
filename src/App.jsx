import { useState } from "react"
import Navbar from "./components/Navbar"
import PetCard from "./components/PetCard"
import { pets } from "./data/pets"

function App() {
  const [search, setSearch] = useState("")
  const [selectedPet, setSelectedPet] = useState(null)
  const [category, setCategory] = useState("All")

  // Search + Category Filter
  const filteredPets = pets.filter((pet) => {
    const matchesSearch =
      pet.name.toLowerCase().includes(search.toLowerCase()) ||
      pet.breed.toLowerCase().includes(search.toLowerCase())

    const matchesCategory =
      category === "All" || pet.type === category

    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-violet-100">

      {/* ================= NAVBAR ================= */}
      <Navbar />


      {/* ================= HERO SECTION ================= */}
      <section
        id="home"
        className="relative overflow-hidden"
      >

        {/* Decorative Paw Prints */}
        <div className="absolute top-20 right-10 text-purple-200 text-6xl rotate-12">
          🐾
        </div>

        <div className="absolute bottom-10 left-10 text-purple-100 text-5xl -rotate-12">
          🐾
        </div>


        <div className="max-w-7xl mx-auto px-6 py-20 md:py-28">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-5 py-2 rounded-full font-medium mb-8">
            🐾 Find your perfect companion
          </div>


          {/* Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-800 leading-tight max-w-4xl">

            Give a Pet a{" "}

            <span className="text-purple-600">
              Forever Home
            </span>

          </h1>


          {/* Description */}
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mt-6 leading-relaxed">

            Browse loving pets waiting for adoption and find a companion
            who is ready to become a part of your family.

          </p>


          {/* Hero Buttons */}
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
      <section
        id="why-us"
        className="bg-white py-20"
      >

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


            {/* Loving Companions */}
            <div className="bg-purple-50 rounded-2xl p-8 text-center border border-purple-100 hover:shadow-lg hover:-translate-y-1 transition">

              <div className="text-4xl mb-4">
                ❤️
              </div>

              <h3 className="text-xl font-bold text-slate-800">
                Loving Companions
              </h3>

              <p className="text-slate-500 mt-3">
                Discover friendly pets looking for a loving forever home.
              </p>

            </div>


            {/* Trusted Shelters */}
            <div className="bg-purple-50 rounded-2xl p-8 text-center border border-purple-100 hover:shadow-lg hover:-translate-y-1 transition">

              <div className="text-4xl mb-4">
                🏠
              </div>

              <h3 className="text-xl font-bold text-slate-800">
                Trusted Shelters
              </h3>

              <p className="text-slate-500 mt-3">
                Connect with shelters and learn more about available pets.
              </p>

            </div>


            {/* Easy Adoption */}
            <div className="bg-purple-50 rounded-2xl p-8 text-center border border-purple-100 hover:shadow-lg hover:-translate-y-1 transition">

              <div className="text-4xl mb-4">
                🤝
              </div>

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
      <section
        id="process"
        className="bg-purple-50 py-20"
      >

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


            {/* Step 1 */}
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


            {/* Step 2 */}
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


            {/* Step 3 */}
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


            {/* Step 4 */}
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
      <section
        id="pets"
        className="max-w-7xl mx-auto px-6 py-20"
      >

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

            <PetCard
              key={pet.id}
              name={pet.name}
              breed={pet.breed}
              age={pet.age}
              gender={pet.gender}
              image={pet.image}
              onViewDetails={() => setSelectedPet(pet)}
            />

          ))}

        </div>


        {/* No Results */}
        {filteredPets.length === 0 && (

          <div className="text-center py-12">

            <div className="text-5xl mb-4">
              🐾
            </div>

            <p className="text-slate-500">
              No pets found. Try another name, breed or category.
            </p>

          </div>

        )}


        {/* Pet Details */}
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

            </div>


            <button
              onClick={() => setSelectedPet(null)}
              className="mt-6 bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition"
            >
              Close Details
            </button>

          </div>

        )}

      </section>



      {/* ================= ADOPTION CTA ================= */}
      <section className="px-6 pb-20">

        <div className="max-w-6xl mx-auto bg-gradient-to-r from-purple-600 to-violet-600 rounded-3xl px-8 py-14 md:px-16 text-center text-white shadow-xl">

          <div className="text-4xl mb-4">
            🐾
          </div>

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

                <a
                  href="#home"
                  className="hover:text-white transition"
                >
                  Home
                </a>

                <a
                  href="#pets"
                  className="hover:text-white transition"
                >
                  Browse Pets
                </a>

                <a
                  href="#why-us"
                  className="hover:text-white transition"
                >
                  About
                </a>

              </div>

            </div>


            {/* For Shelters */}
            <div>

              <h4 className="font-semibold text-lg mb-4">
                For Shelters
              </h4>

              <div className="flex flex-col gap-3 text-purple-200 text-sm">

                <a
                  href="#"
                  className="hover:text-white transition"
                >
                  Partner With Us
                </a>

                <a
                  href="#"
                  className="hover:text-white transition"
                >
                  Shelter Information
                </a>

                <a
                  href="#"
                  className="hover:text-white transition"
                >
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

                <p>
                  📧 pet@pethaven.com
                </p>

                <p>
                  📞 +91 98765 43210
                </p>

                <p>
                  📍 Mumbai, India
                </p>

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