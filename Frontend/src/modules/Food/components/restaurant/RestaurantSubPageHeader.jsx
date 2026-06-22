import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import useRestaurantBackNavigation from "@food/hooks/useRestaurantBackNavigation"

export default function RestaurantSubPageHeader({
  title,
  backTo,
  rightAction = null,
  className = "",
}) {
  const navigate = useNavigate()
  const defaultGoBack = useRestaurantBackNavigation()

  const goBack = () => {
    if (backTo) {
      navigate(backTo)
      return
    }
    defaultGoBack()
  }

  return (
    <header
      className={`sticky top-0 z-50 border-b border-gray-200 bg-white px-4 py-3 ${className}`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={goBack}
            className="rounded-lg p-1.5 transition-colors hover:bg-gray-100"
            aria-label="Go back"
          >
            <ArrowLeft className="h-6 w-6 text-gray-900" />
          </button>
          {title ? (
            <h1 className="truncate text-lg font-bold text-gray-900">{title}</h1>
          ) : null}
        </div>
        {rightAction ? <div className="flex-shrink-0">{rightAction}</div> : null}
      </div>
    </header>
  )
}
