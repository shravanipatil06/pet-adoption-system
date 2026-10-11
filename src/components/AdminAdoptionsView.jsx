import { useState } from "react"

function AdminAdoptionsView({ applications, onApprove, onReject, onDelete, onRefresh }) {
  const [filter, setFilter] = useState("All")
  const [selectedApp, setSelectedApp] = useState(null)
  const [processingId, setProcessingId] = useState(null)

  const filteredApps = applications.filter((app) => {
    if (filter === "All") return true
    return app.status === filter
  })

  const handleApprove = async (appId) => {
    if (window.confirm("Are you sure you want to APPROVE this adoption application?")) {
      setProcessingId(appId)
      await onApprove(appId)
      setProcessingId(null)
      setSelectedApp(null)
    }
  }

  const handleReject = async (appId) => {
    if (window.confirm("Are you sure you want to REJECT this adoption application?")) {
      setProcessingId(appId)
      await onReject(appId)
      setProcessingId(null)
      setSelectedApp(null)
    }
  }

  const handleDelete = async (appId) => {
    if (window.confirm("Are you sure you want to delete this adoption application? This action cannot be undone.")) {
      setProcessingId(appId)
      await onDelete(appId)
      setProcessingId(null)
      setSelectedApp(null)
    }
  }

  return (
    <div className="bg-white rounded-3xl p-7 shadow-xl border border-purple-100 my-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-purple-100">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full mb-2 border border-amber-200 uppercase">
            🛡️ Shelter Admin Portal
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800">
            Adoption Applications Review 📋
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Review applicant information, verify living conditions, update statuses, or delete request records.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="self-start md:self-auto bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium px-4 py-2 rounded-xl text-sm border border-purple-200 transition flex items-center gap-1.5"
        >
          🔄 Refresh Requests
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["All", "Pending", "Approved", "Rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
              filter === status
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-purple-50 text-purple-700 border border-purple-100 hover:bg-purple-100"
            }`}
          >
            {status === "All" ? "All Requests" : status} ({
              status === "All"
                ? applications.length
                : applications.filter((a) => a.status === status).length
            })
          </button>
        ))}
      </div>

      {/* Applications Grid */}
      {filteredApps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredApps.map((app) => (
            <div
              key={app._id}
              className="bg-purple-50/60 rounded-2xl p-6 border border-purple-100 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Top Banner: Status + Date */}
                <div className="flex items-center justify-between gap-2 mb-4">
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

                  <span className="text-xs text-slate-400">
                    {new Date(app.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {/* Pet & Applicant Preview */}
                <div className="flex gap-4 items-center mb-4 bg-white p-3 rounded-xl border border-purple-100">
                  <img
                    src={app.pet?.image || "https://via.placeholder.com/80"}
                    alt={app.pet?.name || "Pet"}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div>
                    <h4 className="font-bold text-slate-800 text-base">
                      {app.pet?.name || "Unknown Pet"}
                    </h4>
                    <p className="text-xs text-purple-600 font-medium">
                      {app.pet?.breed} • {app.pet?.type}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Applicant: <strong>{app.applicantName}</strong> ({app.applicantEmail})
                    </p>
                  </div>
                </div>

                {/* Key Applicant Details */}
                <div className="space-y-1 text-xs text-slate-600 bg-white/70 p-3 rounded-xl border border-purple-100/50 mb-4">
                  <p>
                    <strong>Phone:</strong> {app.phone}
                  </p>
                  <p>
                    <strong>Address:</strong> {app.address}
                  </p>
                  <p>
                    <strong>Living Situation:</strong> {app.livingSituation}
                  </p>
                  <p className="line-clamp-2">
                    <strong>Reason:</strong> {app.reasonForAdoption}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-purple-100">
                <button
                  onClick={() => setSelectedApp(app)}
                  className="text-xs text-purple-700 font-semibold hover:underline"
                >
                  🔍 View Full Details
                </button>

                <div className="flex gap-1.5">
                  {app.status === "Pending" && (
                    <>
                      <button
                        onClick={() => handleReject(app._id)}
                        disabled={processingId === app._id}
                        className="text-xs bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg font-bold hover:bg-red-100 transition disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(app._id)}
                        disabled={processingId === app._id}
                        className="text-xs bg-emerald-600 text-white px-3.5 py-1.5 rounded-lg font-bold hover:bg-emerald-700 shadow-xs transition disabled:opacity-50"
                      >
                        Approve
                      </button>
                    </>
                  )}

                  {/* Delete Button (Visible ONLY to Admin for ALL application statuses) */}
                  <button
                    onClick={() => handleDelete(app._id)}
                    disabled={processingId === app._id}
                    className="text-xs bg-rose-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-rose-700 transition shadow-xs disabled:opacity-50 flex items-center gap-1"
                    title="Permanently delete application record (Admin)"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-purple-50/50 rounded-2xl border border-purple-100">
          <div className="text-4xl mb-2">📋</div>
          <h4 className="font-bold text-slate-700">No Applications Found</h4>
          <p className="text-xs text-slate-500 mt-1">
            No adoption requests match the selected status filter ({filter}).
          </p>
        </div>
      )}

      {/* Detailed Modal View */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-purple-100 p-7 relative">
            <button
              onClick={() => setSelectedApp(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-purple-600 text-xl font-bold"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold text-slate-800 mb-4">
              Full Application Details
            </h3>

            <div className="space-y-3 text-sm text-slate-700">
              <div className="p-3 bg-purple-50 rounded-xl">
                <p><strong>Applicant Name:</strong> {selectedApp.applicantName}</p>
                <p><strong>Email:</strong> {selectedApp.applicantEmail}</p>
                <p><strong>Phone:</strong> {selectedApp.phone}</p>
                <p><strong>Address:</strong> {selectedApp.address}</p>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl">
                <p><strong>Target Pet:</strong> {selectedApp.pet?.name} ({selectedApp.pet?.breed})</p>
                <p><strong>Current Status:</strong> <span className="font-bold uppercase">{selectedApp.status}</span></p>
              </div>

              <div>
                <strong className="block text-xs uppercase text-slate-500 mb-1">Reason for Adoption:</strong>
                <p className="bg-slate-50 p-3 rounded-xl text-xs">{selectedApp.reasonForAdoption}</p>
              </div>

              <div>
                <strong className="block text-xs uppercase text-slate-500 mb-1">Previous Pet Experience:</strong>
                <p className="bg-slate-50 p-3 rounded-xl text-xs">{selectedApp.previousPetExperience}</p>
              </div>

              <div>
                <strong className="block text-xs uppercase text-slate-500 mb-1">Living Situation:</strong>
                <p className="bg-slate-50 p-3 rounded-xl text-xs">{selectedApp.livingSituation}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-purple-100">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-5 py-2.5 rounded-xl border border-purple-200 text-slate-600 font-medium text-xs"
              >
                Close
              </button>

              <div className="flex gap-2">
                {selectedApp.status === "Pending" && (
                  <>
                    <button
                      onClick={() => handleReject(selectedApp._id)}
                      className="px-3.5 py-2 bg-red-100 text-red-700 rounded-xl font-bold text-xs hover:bg-red-200"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(selectedApp._id)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 shadow-sm"
                    >
                      Approve
                    </button>
                  </>
                )}

                <button
                  onClick={() => handleDelete(selectedApp._id)}
                  className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold text-xs hover:bg-rose-700 shadow-sm flex items-center gap-1"
                >
                  🗑️ Delete Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminAdoptionsView
