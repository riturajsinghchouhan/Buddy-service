import { useNavigate } from "react-router-dom"
import { clearModuleAuth } from "@food/utils/auth"
import { restaurantAPI } from "@food/api"
import { firebaseAuth, ensureFirebaseInitialized } from "@food/firebase"

export default function useRestaurantLogout() {
  const navigate = useNavigate()

  const logout = async () => {
    try {
      try {
        await restaurantAPI.logout()
      } catch {
        // Continue with local cleanup if API fails
      }

      try {
        const { signOut } = await import("firebase/auth")
        ensureFirebaseInitialized({ enableAuth: true, enableRealtimeDb: false })
        if (firebaseAuth.currentUser) {
          await signOut(firebaseAuth)
        }
      } catch {
        // Ignore Firebase sign-out errors
      }

      clearModuleAuth("restaurant")
      localStorage.removeItem("restaurant_onboarding")
      localStorage.removeItem("restaurant_accessToken")
      localStorage.removeItem("restaurant_authenticated")
      localStorage.removeItem("restaurant_user")
      sessionStorage.removeItem("restaurantAuthData")
      window.dispatchEvent(new Event("restaurantAuthChanged"))
      navigate("/food/restaurant/login", { replace: true })
    } catch {
      clearModuleAuth("restaurant")
      sessionStorage.removeItem("restaurantAuthData")
      window.dispatchEvent(new Event("restaurantAuthChanged"))
      navigate("/food/restaurant/login", { replace: true })
    }
  }

  return { logout }
}
