import { ArrowLeft, UtensilsCrossed } from "lucide-react"
import { useCompanyName } from "@food/hooks/useCompanyName"

export default function RestaurantAuthLayout({
  title,
  subtitle,
  children,
  onBack,
  footer,
}) {
  const companyName = useCompanyName() || "Foodelo"

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-[#f7f8fa]">
      <div className="relative flex shrink-0 items-center justify-center px-6 pb-4 pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-10">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="absolute left-6 flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 sm:left-10"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : null}

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-orange text-white shadow-lg">
            <UtensilsCrossed className="h-6 w-6" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-xl font-bold tracking-wide text-primary-orange sm:text-2xl">
              {companyName}
            </span>
            <span className="text-xs font-medium text-gray-500">Restaurant Panel</span>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-6 pb-8 sm:px-10">
        <div className="mb-6 w-full max-w-md text-center">
          <h2 className="text-2xl font-semibold text-gray-900 sm:text-3xl">{title}</h2>
          {subtitle ? <div className="mt-2 text-sm text-gray-500">{subtitle}</div> : null}
        </div>

        <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          {children}
        </div>

        {footer ? <div className="mt-6 w-full max-w-md">{footer}</div> : null}
      </div>
    </div>
  )
}
