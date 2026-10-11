import { useState, useRef, useEffect, useContext } from "react"
import { SocketContext } from "../context/SocketContext"
import { AuthContext } from "../context/AuthContext"

function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const {
    notifications,
    unreadCount,
    isConnected,
    markAllAsRead,
    markAsRead,
    clearNotifications,
  } = useContext(SocketContext)

  const { isAdmin } = useContext(AuthContext)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen && unreadCount > 0) {
            markAllAsRead()
          }
        }}
        className="relative p-2 rounded-xl text-gray-600 hover:text-purple-700 hover:bg-purple-50 transition flex items-center justify-center"
        title={isConnected ? "Real-time notifications connected" : "WebSocket connecting..."}
        aria-label="Real-time notifications"
      >
        <span className="text-xl">🔔</span>

        {/* Live connection dot */}
        <span
          className={`absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
            isConnected ? "bg-emerald-500" : "bg-amber-400 animate-pulse"
          }`}
          title={isConnected ? "WebSocket Live" : "Connecting..."}
        />

        {/* Unread Badge Counter */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-xs animate-bounce">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-purple-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-800">
                Notifications
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                  isConnected
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : "bg-amber-100 text-amber-800 border border-amber-200"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isConnected ? "bg-emerald-500 animate-ping" : "bg-amber-500"
                  }`}
                />
                {isConnected ? "Live WS" : "Connecting"}
              </span>
            </div>

            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="text-xs text-slate-500 hover:text-purple-700 transition font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-purple-50">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`p-3.5 hover:bg-purple-50/60 transition cursor-pointer flex gap-3 items-start ${
                    !notif.read ? "bg-purple-50/30" : ""
                  }`}
                >
                  <div className="text-2xl mt-0.5">
                    {notif.type === "new_application" ? "🐾" : notif.status === "Approved" ? "🎉" : "📋"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(notif.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="mt-1.5 flex items-center gap-2">
                      {notif.status && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            notif.status === "Approved"
                              ? "bg-emerald-100 text-emerald-800"
                              : notif.status === "Rejected"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {notif.status}
                        </span>
                      )}

                      {isAdmin && notif.type === "new_application" && (
                        <a
                          href="#admin-adoptions"
                          onClick={() => setIsOpen(false)}
                          className="text-[11px] text-purple-700 font-semibold hover:underline"
                        >
                          View Request →
                        </a>
                      )}

                      {!isAdmin && notif.type === "status_update" && (
                        <a
                          href="#my-applications"
                          onClick={() => setIsOpen(false)}
                          className="text-[11px] text-purple-700 font-semibold hover:underline"
                        >
                          View Status →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400">
                <div className="text-3xl mb-2">🔔</div>
                <p className="text-xs font-medium text-slate-600">No notifications yet</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {isAdmin
                    ? "New adoption applications submitted by users will appear here live."
                    : "Application approvals and updates will appear here live."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown
