import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Bell, Menu, Search } from "lucide-react"
import { restaurantAPI } from "@food/api"
import useNotificationInbox from "@food/hooks/useNotificationInbox"
import { RESTAURANT_BASE } from "@food/utils/restaurantNavConfig"

const extractRestaurantPayload = (response) =>
  response?.data?.data?.restaurant ||
  response?.data?.restaurant ||
  response?.data?.data ||
  null

export default function RestaurantPanelHeader({
  title,
  subtitle,
  showSearch = false,
  onMenuClick,
  className = "",
}) {
  const navigate = useNavigate()
  const [restaurantName, setRestaurantName] = useState("Your restaurant")
  const { unreadCount } = useNotificationInbox("restaurant", { limit: 20, pollMs: 60_000 })

  useEffect(() => {
    let mounted = true
    restaurantAPI
      .getCurrentRestaurant()
      .then((res) => {
        if (!mounted) return
        const data = extractRestaurantPayload(res)
        const name = data?.restaurantName || data?.name || data?.businessName
        if (name) setRestaurantName(name)
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 border-b border-[var(--rt-border)] bg-white/95 backdrop-blur-md ${className}`}
    >
      <div className="flex items-center gap-3 px-4 py-3 lg:px-6">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex rounded-xl border border-[var(--rt-border)] p-2.5 hover:bg-gray-50 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5 text-gray-700" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-gray-900 lg:text-lg">
            {title || restaurantName}
          </p>
          {subtitle ? (
            <p className="truncate text-xs text-gray-500 lg:text-sm">{subtitle}</p>
          ) : null}
        </div>

        {showSearch ? (
          <div className="hidden max-w-sm flex-1 items-center gap-2 rounded-2xl border border-[var(--rt-border)] bg-[var(--rt-surface-muted)] px-3 py-2 md:flex">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search orders, menu..."
              className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
            />
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => navigate(`${RESTAURANT_BASE}/notifications`)}
          className="relative rounded-xl border border-[var(--rt-border)] p-2.5 hover:bg-gray-50"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-gray-700" />
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </button>
      </div>
    </header>
  )
}
