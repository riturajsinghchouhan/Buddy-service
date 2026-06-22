import useMediaQuery from "./useMediaQuery"

const DESKTOP_QUERY = "(min-width: 1024px)"

export default function useRestaurantLayout() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)

  return {
    isDesktop,
    hideBottomNav: isDesktop,
    showSidebar: isDesktop,
  }
}
