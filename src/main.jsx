import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.jsx"
import { SiteProvider } from "./context/SiteContext"
import { FavoritesProvider } from "./context/FavoritesContext"
import { AuthProvider } from "./context/AuthContext"
import { SocketProvider } from "./context/SocketContext"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <SocketProvider>
        <SiteProvider>
          <FavoritesProvider>
            <App />
          </FavoritesProvider>
        </SiteProvider>
      </SocketProvider>
    </AuthProvider>
  </StrictMode>,
)