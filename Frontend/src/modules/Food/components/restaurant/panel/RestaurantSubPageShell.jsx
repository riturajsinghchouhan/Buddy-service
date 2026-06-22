import BottomNavOrders from "@food/components/restaurant/BottomNavOrders"
import RestaurantPanelHeader from "./RestaurantPanelHeader"
import RestaurantSubPageHeader from "../RestaurantSubPageHeader"

export default function RestaurantSubPageShell({
  title,
  subtitle,
  backTo,
  children,
  showBottomNav = false,
  headerRight = null,
  className = "",
  contentClassName = "",
}) {
  return (
    <div className={`rt-panel-bg min-h-screen ${showBottomNav ? "pb-24 lg:pb-8" : "pb-8"} ${className}`}>
      <div className="lg:hidden">
        <RestaurantSubPageHeader title={title} backTo={backTo} rightAction={headerRight} />
      </div>

      <div className="hidden lg:block">
        <RestaurantPanelHeader title={title} subtitle={subtitle} />
      </div>

      <div className={`mx-auto max-w-6xl px-4 py-4 lg:px-6 lg:py-6 ${contentClassName}`}>
        {children}
      </div>

      {showBottomNav ? <BottomNavOrders /> : null}
    </div>
  )
}
