import { Minus, Plus } from "lucide-react"
import VegIndicator from "@food/components/user/restaurant-details/VegIndicator"

const FOOD_IMAGE_FALLBACK = "https://picsum.photos/seed/cart-food/200/200"

export default function CartItemsCard({ items, rupeeSymbol, onUpdateQuantity, onAddMore }) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden dark:border-gray-800 dark:bg-[#141414]">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#1a1a1a]">
        <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">
          Your items ({items.length})
        </h2>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {items.map((item) => {
          const isVeg = item.isVeg === true || item.foodType === "Veg"
          const lineTotal = ((item.price || 0) * (item.quantity || 1)).toFixed(0)

          return (
            <div key={item.id} className="flex gap-3 p-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = FOOD_IMAGE_FALLBACK
                    }}
                  />
                ) : null}
                <div className="absolute top-1 left-1">
                  <VegIndicator isVeg={isVeg} size="sm" />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white text-[15px] leading-snug line-clamp-2">
                  {item.name}
                </h3>
                {item.variantName && (
                  <p className="mt-1 inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[11px] font-semibold text-gray-500">
                    {item.variantName}
                  </p>
                )}
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-base font-extrabold text-gray-900 dark:text-white">
                    {rupeeSymbol}{lineTotal}
                  </span>
                  <div className="flex items-center bg-[#16A34A] rounded-xl overflow-hidden shadow-sm shadow-green-600/15">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="px-2.5 py-1.5 text-white hover:bg-[#15803D] transition-colors"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-2 text-sm font-bold text-white tabular-nums min-w-[1.25rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="px-2.5 py-1.5 text-white hover:bg-[#15803D] transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={onAddMore}
        className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold text-[#16A34A] border-t border-gray-100 dark:border-gray-800 hover:bg-green-50/50 dark:hover:bg-green-950/10 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add more items
      </button>
    </div>
  )
}

export function CartSection({ children, className = "" }) {
  return (
    <div className={`rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-[#141414] ${className}`}>
      {children}
    </div>
  )
}
