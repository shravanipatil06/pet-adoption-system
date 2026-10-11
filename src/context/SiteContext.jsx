import { createContext } from "react"

export const SiteContext = createContext()

export function SiteProvider({ children }) {
  const siteName = "Pet Haven"
  const tagline = "Find a friend. Give a home."

  return (
    <SiteContext.Provider value={{ siteName, tagline }}>
      {children}
    </SiteContext.Provider>
  )
}