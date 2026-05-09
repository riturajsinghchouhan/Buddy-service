import { Link, useLocation } from "react-router-dom"
import { Tag, User, Truck, UtensilsCrossed } from "lucide-react"
import { useState, useEffect } from "react"
import api from "@food/api"

export default function BottomNavigation() {
  const location = useLocation()
  const pathname = location.pathname
  const [under250PriceLimit, setUnder250PriceLimit] = useState(250)

  // Fetch landing settings to get dynamic price limit
  useEffect(() => {
    let cancelled = false
    api.get('/food/landing/settings/public')
      .then((res) => {
        if (cancelled) return
        const settings = res?.data?.data
        if (settings && typeof settings.under250PriceLimit === 'number') {
          setUnder250PriceLimit(settings.under250PriceLimit)
        }
      })
      .catch(() => {
        if (!cancelled) setUnder250PriceLimit(250)
      })
    return () => { cancelled = true }
  }, [])

  // Check active routes - support both /user/* and /* paths
  const isDining = pathname === "/food/dining" || pathname.startsWith("/food/user/dining")
  const isUnder250 = pathname === "/food/under-250" || pathname.startsWith("/food/user/under-250")
  const isProfile = pathname.startsWith("/food/profile") || pathname.startsWith("/food/user/profile")
  const isDelivery =
    !isDining &&
    !isUnder250 &&
    !isProfile &&
    (pathname === "/" ||
      pathname === "/food" ||
      pathname === "/food/" ||
      pathname === "/food/user" ||
      pathname === "/food/user/" ||
      (pathname.startsWith("/food/user") &&
        !pathname.includes("/dining") &&
        !pathname.includes("/under-250") &&
        !pathname.includes("/profile")))

  return (
    <div
      className="md:hidden fixed bottom-6 left-4 right-4 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-xl rounded-full shadow-[0_15px_45px_rgba(26,37,23,0.15)] border border-gray-200/50 dark:border-gray-800 z-50 p-1.5"
    >
      <div className="flex items-center justify-between h-auto">
        {/* Delivery Tab */}
        <Link
          to="/"
          className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-full transition-all duration-300 relative ${isDelivery
              ? "bg-[#acc8a2] text-[#1a2517] shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
            }`}
        >
          <Truck className={`h-4.5 w-4.5 ${isDelivery ? "text-[#1a2517] fill-[#1a2517]/10" : "text-gray-500"}`} strokeWidth={isDelivery ? 2.5 : 2} />
          <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${isDelivery ? "text-[#1a2517]" : "text-gray-500"}`}>
            Delivery
          </span>
        </Link>

        {/* Dining Tab */}
        <Link
          to="/food/user/dining"
          className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-full transition-all duration-300 relative ${isDining
              ? "bg-[#acc8a2] text-[#1a2517] shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
            }`}
        >
          <UtensilsCrossed className={`h-4.5 w-4.5 ${isDining ? "text-[#1a2517]" : "text-gray-500"}`} strokeWidth={isDining ? 2.5 : 2} />
          <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${isDining ? "text-[#1a2517]" : "text-gray-500"}`}>
            Dining
          </span>
        </Link>

        {/* Under 250 Tab */}
        <Link
          to="/food/user/under-250"
          className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-full transition-all duration-300 relative ${isUnder250
              ? "bg-[#acc8a2] text-[#1a2517] shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
            }`}
        >
          <Tag className={`h-4.5 w-4.5 ${isUnder250 ? "text-[#1a2517] fill-[#1a2517]/10" : "text-gray-500"}`} strokeWidth={isUnder250 ? 2.5 : 2} />
          <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${isUnder250 ? "text-[#1a2517]" : "text-gray-500"}`}>
            ₹{under250PriceLimit}
          </span>
        </Link>

        {/* Profile Tab */}
        <Link
          to="/food/user/profile"
          className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-full transition-all duration-300 relative ${isProfile
              ? "bg-[#acc8a2] text-[#1a2517] shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
            }`}
        >
          <User className={`h-4.5 w-4.5 ${isProfile ? "text-[#1a2517] fill-[#1a2517]/10" : "text-gray-500"}`} strokeWidth={isProfile ? 2.5 : 2} />
          <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${isProfile ? "text-[#1a2517]" : "text-gray-500"}`}>
            Profile
          </span>
        </Link>
      </div>
    </div>
  )
}

