import { useState, useContext } from "react"
import { AuthContext } from "../context/AuthContext"

function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [localError, setLocalError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const { login, register, error: authError } = useContext(AuthContext)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError("")
    setSubmitting(true)

    if (isLogin) {
      if (!email || !password) {
        setLocalError("Please enter both email and password")
        setSubmitting(false)
        return
      }
      const res = await login(email, password)
      if (res.success) {
        onClose()
      } else {
        setLocalError(res.message)
      }
    } else {
      if (!name || !email || !password) {
        setLocalError("Please fill in all fields")
        setSubmitting(false)
        return
      }
      if (password.length < 6) {
        setLocalError("Password must be at least 6 characters")
        setSubmitting(false)
        return
      }
      const res = await register(name, email, password)
      if (res.success) {
        onClose()
      } else {
        setLocalError(res.message)
      }
    }
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-purple-100 p-7 relative animate-fade-in">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-purple-600 text-xl font-bold transition"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🐾</div>
          <h2 className="text-2xl font-bold text-slate-800">
            {isLogin ? "Welcome Back to Pet Haven" : "Create a Pet Haven Account"}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {isLogin
              ? "Sign in to save favorites and apply for adoptions"
              : "Join our community of loving pet adopters"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-purple-50 p-1 rounded-xl mb-6 border border-purple-100">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true)
              setLocalError("")
            }}
            className={`flex-1 py-2 rounded-lg font-medium text-sm transition ${
              isLogin
                ? "bg-purple-600 text-white shadow-sm"
                : "text-purple-700 hover:bg-purple-100"
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false)
              setLocalError("")
            }}
            className={`flex-1 py-2 rounded-lg font-medium text-sm transition ${
              !isLogin
                ? "bg-purple-600 text-white shadow-sm"
                : "text-purple-700 hover:bg-purple-100"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Alert */}
        {(localError || authError) && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl">
            ⚠️ {localError || authError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-purple-50/50 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="e.g. user@pethaven.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-purple-50/50 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-purple-50/50 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {!isLogin && (
            <div className="bg-purple-50 p-3 rounded-xl text-xs text-purple-700 border border-purple-100 flex items-start gap-2">
              <span>ℹ️</span>
              <span>
                Public registration creates a standard <strong>User (Adopter)</strong> account. Admin roles are granted securely by shelter management.
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-purple-600 text-white font-semibold py-3 rounded-xl hover:bg-purple-700 transition shadow-lg shadow-purple-200 disabled:opacity-50 mt-2"
          >
            {submitting
              ? "Please wait..."
              : isLogin
              ? "Log In to Pet Haven"
              : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AuthModal
