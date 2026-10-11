import { createContext, useEffect, useReducer } from "react"

export const FavoritesContext = createContext()

// Initial state
const initialState = {
  favorites: JSON.parse(
    localStorage.getItem("pethaven-favorites")
  ) || [],
}

// Reducer
function favoritesReducer(state, action) {
  switch (action.type) {

    case "ADD_FAVORITE":
      return {
        ...state,
        favorites: [...state.favorites, action.payload],
      }

    case "REMOVE_FAVORITE":
      return {
        ...state,
        favorites: state.favorites.filter(
          (pet) => pet.id !== action.payload
        ),
      }

    case "CLEAR_FAVORITES":
      return {
        ...state,
        favorites: [],
      }

    default:
      return state
  }
}

// Provider
export function FavoritesProvider({ children }) {

  const [state, dispatch] = useReducer(
    favoritesReducer,
    initialState
  )

  // Save favorites whenever the state changes
  useEffect(() => {
    localStorage.setItem(
      "pethaven-favorites",
      JSON.stringify(state.favorites)
    )
  }, [state.favorites])

  return (
    <FavoritesContext.Provider
      value={{
        favorites: state.favorites,
        dispatch,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}