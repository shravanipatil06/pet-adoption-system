import { useContext } from "react"
import { FavoritesContext } from "../context/FavoritesContext"

function PetCard({
  id,
  name,
  breed,
  age,
  gender,
  image,
  onViewDetails,
  onApply,
}) {
  // Get favorites and dispatch from Context API
  const { favorites, dispatch } = useContext(FavoritesContext)

  // Check whether this pet is already a favorite
  const isFavorite = favorites.some(
    (pet) => pet.id === id || pet._id === id
  )

  // Add or remove favorite using reducer
  const handleFavorite = () => {
    if (isFavorite) {
      dispatch({
        type: "REMOVE_FAVORITE",
        payload: id,
      })
    } else {
      dispatch({
        type: "ADD_FAVORITE",
        payload: {
          id,
          name,
          breed,
          age,
          gender,
          image,
        },
      })
    }
  }

  return (
    <div className="relative bg-white rounded-2xl shadow-md overflow-hidden border border-purple-100 hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col justify-between">
      {/* Pet Image */}
      <div className="relative">
        <img
          src={image}
          alt={name}
          className="w-full h-56 object-cover"
        />

        {/* Favorite Button */}
        <button
          onClick={handleFavorite}
          className="absolute top-4 right-4 bg-white/90 rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:scale-110 transition text-xl"
          aria-label={
            isFavorite
              ? `Remove ${name} from favorites`
              : `Add ${name} to favorites`
          }
        >
          {isFavorite ? "❤️" : "♡"}
        </button>
      </div>

      {/* Pet Information */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-800">
            {name}
          </h3>

          <p className="text-purple-600 font-medium mt-1">
            {breed}
          </p>

          <p className="text-slate-500 text-sm mt-1">
            {age} years • {gender}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex gap-2">
          <button
            onClick={onViewDetails}
            className="flex-1 bg-purple-50 text-purple-700 border border-purple-200 py-2.5 rounded-xl font-medium text-sm hover:bg-purple-100 transition"
          >
            Details
          </button>
          
          <button
            onClick={onApply}
            className="flex-1 bg-purple-600 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-purple-700 shadow-sm transition flex items-center justify-center gap-1"
          >
            <span>🐾</span> Apply
          </button>
        </div>
      </div>
    </div>
  )
}

export default PetCard