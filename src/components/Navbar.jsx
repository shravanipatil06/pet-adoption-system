import { useState, useContext } from "react"
import { SiteContext } from "../context/SiteContext"
import { FavoritesContext } from "../context/FavoritesContext"
import { AuthContext } from "../context/AuthContext"
import NotificationDropdown from "./NotificationDropdown"

function Navbar({ onOpenAuthModal }) {
  const [menuOpen, setMenuOpen] = useState(false)

  // Contexts
  const { siteName, tagline } = useContext(SiteContext)
  const { favorites } = useContext(FavoritesContext)
  const { user, isAuthenticated, isAdmin, logout } = useContext(AuthContext)

  // Scroll to Favorites section
  const goToFavorites = () => {
    document
      .getElementById("favorites")
      ?.scrollIntoView({ behavior: "smooth" })

    setMenuOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* ================= MAIN NAVBAR ================= */}
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-2">
            <span className="text-3xl">🐾</span>
            <div>
              <h1 className="text-2xl font-bold text-purple-700">
                {siteName}
              </h1>
              <p className="text-xs text-gray-500">
                {tagline}
              </p>
            </div>
          </a>

          {/* ================= DESKTOP NAVIGATION ================= */}
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

            {/* Applications Navigation Links */}
            {isAuthenticated && !isAdmin && (
              <a
                href="#my-applications"
                className="text-purple-700 font-bold hover:text-purple-900 transition flex items-center gap-1 text-sm bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100"
              >
                📋 My Applications
              </a>
            )}

            {isAuthenticated && isAdmin && (
              <a
                href="#admin-adoptions"
                className="text-amber-800 font-bold hover:text-amber-900 transition flex items-center gap-1 text-sm bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200"
              >
                🛡️ Adoption Requests
              </a>
            )}

            {/* ================= FAVORITES ================= */}
            <button
              onClick={goToFavorites}
              className="text-purple-700 text-xl hover:scale-110 transition flex items-center gap-1"
              title="View saved favorite pets"
            >
              ♡
              <span className="text-sm font-semibold">
                {favorites.length}
              </span>
            </button>

            {/* ================= REAL-TIME NOTIFICATIONS ================= */}
            {isAuthenticated && <NotificationDropdown />}

            {/* ================= AUTHENTICATION / USER MENU ================= */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3 bg-purple-50 px-4 py-1.5 rounded-xl border border-purple-100">
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800 leading-tight">
                    {user?.name}
                  </p>
                  <span
                    className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      isAdmin
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {user?.role}
                  </span>
                </div>

                <button
                  onClick={logout}
                  className="bg-purple-600 text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition shadow-xs"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-purple-700 hover:shadow-lg transition flex items-center gap-2"
              >
                <span>👤</span> Login / Register
              </button>
            )}
          </div>

          {/* ================= MOBILE CONTROLS ================= */}
          <div className="flex md:hidden items-center gap-3">
            {isAuthenticated && <NotificationDropdown />}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-purple-700 text-3xl"
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* ================= MOBILE NAVIGATION ================= */}
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

              {/* ================= MOBILE FAVORITES ================= */}
              <button
                onClick={goToFavorites}
                className="text-left text-purple-700 font-medium"
              >
                ♡ Favorites ({favorites.length})
              </button>

              {/* ================= MOBILE AUTH ================= */}
              {isAuthenticated ? (
                <div className="pt-2 border-t border-purple-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">{user?.name}</p>
                    <p className="text-xs text-purple-600 capitalize">
                      Role: {user?.role}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      logout()
                      setMenuOpen(false)
                    }}
                    className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    onOpenAuthModal()
                  }}
                  className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-purple-700 text-center"
                >
                  Login / Register
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar