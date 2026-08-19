import { useState } from "react"

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-purple-100">

      <div className="max-w-7xl mx-auto px-6 py-4">

        {/* Main Navbar */}
        <div className="flex items-center justify-between">

          {/* Logo */}
          <a href="#home" className="flex items-center gap-2">
            <span className="text-3xl">🐾</span>

            <div>
              <h1 className="text-2xl font-bold text-purple-700">
                Pet Haven
              </h1>

              <p className="text-xs text-gray-500">
                Find a friend. Give a home.
              </p>
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-7">

            <a
              href="#home"
              className="text-gray-600 font-medium hover:text-purple-700 transition"
            >
              Home
            </a>

            <a
              href="#pets"
              className="text-gray-600 font-medium hover:text-purple-700 transition"
            >
              Browse Pets
            </a>

            <a
              href="#shelters"
              className="text-gray-600 font-medium hover:text-purple-700 transition"
            >
              Shelters
            </a>

            <a
              href="#process"
              className="text-gray-600 font-medium hover:text-purple-700 transition"
            >
              Adoption Process
            </a>

            <a
              href="#about"
              className="text-gray-600 font-medium hover:text-purple-700 transition"
            >
              About
            </a>

            <button className="text-purple-700 text-xl hover:scale-110 transition">
              ♡
            </button>

            <button className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-purple-700 hover:shadow-lg transition">
              Login
            </button>

          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-purple-700 text-3xl"
          >
            {menuOpen ? "✕" : "☰"}
          </button>

        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="md:hidden mt-5 pt-4 border-t border-purple-100">

            <div className="flex flex-col gap-4">

              <a
                href="#home"
                onClick={() => setMenuOpen(false)}
                className="text-gray-700 font-medium hover:text-purple-700"
              >
                Home
              </a>

              <a
                href="#pets"
                onClick={() => setMenuOpen(false)}
                className="text-gray-700 font-medium hover:text-purple-700"
              >
                Browse Pets
              </a>

              <a
                href="#shelters"
                onClick={() => setMenuOpen(false)}
                className="text-gray-700 font-medium hover:text-purple-700"
              >
                Shelters
              </a>

              <a
                href="#process"
                onClick={() => setMenuOpen(false)}
                className="text-gray-700 font-medium hover:text-purple-700"
              >
                Adoption Process
              </a>

              <a
                href="#about"
                onClick={() => setMenuOpen(false)}
                className="text-gray-700 font-medium hover:text-purple-700"
              >
                About
              </a>

              <button className="text-left text-purple-700 font-medium">
                ♡ Favorites
              </button>

              <button className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-purple-700">
                Login
              </button>

            </div>

          </div>
        )}

      </div>
    </nav>
  )
}

export default Navbar