import { useContext } from "react"
import { SocketContext } from "../context/SocketContext"
import { AuthContext } from "../context/AuthContext"

function NotificationToast() {
  const { activeToast, dismissToast } = useContext(SocketContext)
  const { isAdmin } = useContext(AuthContext)

  if (!activeToast) return null

  return (
    <div className="fixed top-20 right-6 z-50 max-w-sm w-full bg-white rounded-2xl shadow-2xl border border-purple-200 p-4 animate-in slide-in-from-top-4 duration-200 transition">
      <div className="flex items-start gap-3">
        <div className="text-2xl mt-0.5">
          {activeToast.type === "new_application"
            ? "🐾"
            : activeToast.status === "Approved"
            ? "🎉"
            : "📋"}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-slate-800">
              {activeToast.title}
            </h4>
            <button
              onClick={dismissToast}
              className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              title="Dismiss"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {activeToast.message}
          </p>

          <div className="mt-2.5 flex items-center justify-between">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeToast.status === "Approved"
                  ? "bg-emerald-100 text-emerald-800"
                  : activeToast.status === "Rejected"
                  ? "bg-rose-100 text-rose-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {activeToast.status || "Real-time Event"}
            </span>

            {isAdmin && activeToast.type === "new_application" && (
              <a
                href="#admin-adoptions"
                onClick={dismissToast}
                className="text-xs text-purple-700 font-semibold hover:underline"
              >
                View in Portal →
              </a>
            )}

            {!isAdmin && activeToast.type === "status_update" && (
              <a
                href="#my-applications"
                onClick={dismissToast}
                className="text-xs text-purple-700 font-semibold hover:underline"
              >
                View Status →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationToast
