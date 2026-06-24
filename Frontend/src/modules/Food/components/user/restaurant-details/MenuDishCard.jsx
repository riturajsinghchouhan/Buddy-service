import { Clock, Minus, Plus, Utensils } from "lucide-react"
import { hasFoodVariants } from "@food/utils/foodVariants"
import VegIndicator from "./VegIndicator"
import { FOOD_IMAGE_FALLBACK } from "./restaurantDetailsTheme"

function QuantityControl({ quantity, disabled, onDecrement, onIncrement, addLabel = "Add" }) {
  if (quantity > 0) {
    return (
      <div className="flex items-center bg-[#16A34A] rounded-xl px-2.5 py-1.5 gap-2 shadow-sm shadow-green-600/20 min-w-[88px] justify-between">
        <button
          type="button"
          onClick={onDecrement}
          disabled={disabled}
          className="text-white hover:opacity-80 disabled:opacity-40"
          aria-label="Decrease quantity"
        >
          <Minus size={14} />
        </button>
        <span className="text-sm font-bold text-white tabular-nums">{quantity}</span>
        <button
          type="button"
          onClick={onIncrement}
          disabled={disabled}
          className="text-white hover:opacity-80 disabled:opacity-40"
          aria-label="Increase quantity"
        >
          <Plus size={14} />
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onIncrement}
      disabled={disabled}
      className="min-w-[88px] bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-40 text-white text-xs font-bold uppercase tracking-wide px-4 py-2 rounded-xl transition-all shadow-sm shadow-green-600/20 active:scale-95"
    >
      {addLabel}
    </button>
  )
}

function ItemMetaBadges({ item, priceLabel }) {
  const variantCount = (item?.variants?.length || item?.variations?.length || 0)
  const rating = item?.rating || item?.avgRating || 4.2

  return (
    <div className="flex flex-wrap items-center gap-2 mt-2">
      <span className="text-base font-extrabold text-gray-900 dark:text-white">{priceLabel}</span>
      <span className="inline-flex items-center gap-0.5 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 px-2 py-0.5 text-[11px] font-bold text-yellow-700 dark:text-yellow-400 border border-yellow-100 dark:border-yellow-900/30">
        ★ {rating.toFixed ? (typeof rating === 'number' ? rating.toFixed(1) : rating) : rating}
      </span>
      {variantCount > 1 && (
        <span className="inline-flex rounded-lg bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-400">
          {variantCount} options
        </span>
      )}
    </div>
  )
}

/** Horizontal carousel card (recommended section) */
export function MenuDishCarouselCard({
  item,
  quantity,
  isHighlighted,
  priceLabel,
  disabled,
  cardRef,
  onClick,
  onDecrement,
  onIncrement,
  onAdd,
}) {
  const isVeg = item.foodType === "Veg"
  const customisable = hasFoodVariants(item)

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className={`w-[172px] sm:w-[190px] flex flex-col bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-all hover:shadow-md ${
        isHighlighted ? "ring-2 ring-[#16A34A] shadow-lg" : ""
      }`}
    >
      <div className="relative h-36 w-full overflow-hidden bg-gray-50 dark:bg-gray-900">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              if (e.currentTarget.src !== FOOD_IMAGE_FALLBACK) e.currentTarget.src = FOOD_IMAGE_FALLBACK
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Utensils className="h-8 w-8 text-gray-200" />
          </div>
        )}
        <div className="absolute top-2.5 left-2.5">
          <VegIndicator isVeg={isVeg} />
        </div>
      </div>
      <div className="flex-1 p-3 flex flex-col gap-2">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2 leading-snug">{item.name}</h3>
        <ItemMetaBadges item={item} priceLabel={priceLabel} />
        <div className="mt-auto pt-2 flex justify-end" onClick={(e) => e.stopPropagation()}>
          <QuantityControl
            quantity={quantity}
            disabled={disabled}
            onDecrement={onDecrement}
            onIncrement={quantity > 0 ? onIncrement : onAdd}
            addLabel={customisable ? "Choose" : "Add"}
          />
        </div>
      </div>
    </div>
  )
}

/** List row card inside a category section */
export function MenuDishListCard({
  item,
  quantity,
  isHighlighted,
  priceLabel,
  disabled,
  cardRef,
  onClick,
  onDecrement,
  onIncrement,
  onAdd,
  nested = false,
}) {
  const isVeg = item.foodType === "Veg"
  const customisable = hasFoodVariants(item)

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className={`flex gap-3 sm:gap-4 p-3 sm:p-4 transition-colors ${
        nested
          ? "hover:bg-gray-50/80 dark:hover:bg-white/[0.03]"
          : `rounded-2xl border bg-white dark:bg-[#141414] hover:shadow-md ${
              isHighlighted
                ? "border-[#16A34A] ring-2 ring-[#16A34A]/20 shadow-md"
                : "border-gray-100 dark:border-gray-800 shadow-sm"
            }`
      } ${isHighlighted && nested ? "bg-green-50/50 dark:bg-green-950/20" : ""}`}
    >
      <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              if (e.currentTarget.src !== FOOD_IMAGE_FALLBACK) e.currentTarget.src = FOOD_IMAGE_FALLBACK
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Utensils className="h-6 w-6 text-gray-200" />
          </div>
        )}
        <div className="absolute top-1.5 left-1.5">
          <VegIndicator isVeg={isVeg} size="sm" />
        </div>
      </div>

      <div className="min-w-0 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white text-[15px] sm:text-base leading-snug line-clamp-2">
              {item.name}
            </h3>
          </div>
        </div>

        <div className="flex items-end justify-between gap-3 mt-auto pt-2">
          <ItemMetaBadges item={item} priceLabel={priceLabel} />
          <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
            <QuantityControl
              quantity={quantity}
              disabled={disabled}
              onDecrement={onDecrement}
              onIncrement={quantity > 0 ? onIncrement : onAdd}
              addLabel={customisable ? "Choose" : "Add"}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
