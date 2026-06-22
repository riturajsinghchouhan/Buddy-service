import { ChevronDown, Clock, Utensils } from "lucide-react"
import { getFoodPriceLabel } from "@food/utils/foodVariants"
import VegIndicator from "@food/components/user/restaurant-details/VegIndicator"
import { FOOD_IMAGE_FALLBACK } from "./diningDetailsTheme"

function MenuItemRow({ item }) {
  const isVeg = item.foodType === "Veg"
  const priceLabel = getFoodPriceLabel(item)
  const variantCount = (item?.variants?.length || item?.variations?.length || 0)

  return (
    <div className="flex gap-3 p-3 sm:p-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-900">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              if (e.currentTarget.src !== FOOD_IMAGE_FALLBACK) e.currentTarget.src = FOOD_IMAGE_FALLBACK
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Utensils className="h-5 w-5 text-gray-200" />
          </div>
        )}
        <div className="absolute top-1.5 left-1.5">
          <VegIndicator isVeg={isVeg} size="sm" />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="font-bold text-gray-900 dark:text-white text-[15px] leading-snug">{item.name}</h4>
        {item.description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{item.description}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-sm font-extrabold text-gray-900 dark:text-white">{priceLabel}</span>
          {item.preparationTime && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[11px] font-semibold text-gray-500">
              <Clock className="h-3 w-3" />
              {item.preparationTime}
            </span>
          )}
          {variantCount > 1 && (
            <span className="rounded-lg bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-400">
              {variantCount} options
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DiningMenuSections({ menuSections, expandedSections, onToggleSection }) {
  const sections = Array.isArray(menuSections) ? menuSections : []

  if (sections.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-green-200/60 bg-white dark:bg-[#141414] px-6 py-12 text-center">
        <Utensils className="mx-auto h-8 w-8 text-[#16A34A] mb-3" />
        <p className="font-extrabold text-gray-900 dark:text-white">Menu coming soon</p>
        <p className="text-sm text-gray-500 mt-1">This restaurant is updating their dining menu.</p>
      </div>
    )
  }

  const totalItems = sections.reduce((sum, section) => {
    const direct = Array.isArray(section.items) ? section.items.length : 0
    const sub = Array.isArray(section.subsections)
      ? section.subsections.reduce((s, sub) => s + (Array.isArray(sub.items) ? sub.items.length : 0), 0)
      : 0
    return sum + direct + sub
  }, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Menu</h2>
          <p className="text-sm text-gray-500 mt-0.5">{totalItems} dishes across {sections.length} categories</p>
        </div>
      </div>

      <div className="space-y-4">
        {sections.map((section, index) => {
          const items = Array.isArray(section.items) ? section.items : []
          const itemCount = section.itemCount ?? items.length
          const isExpanded = expandedSections.has(index)
          const sectionImage = section.image || items.find((i) => i?.image)?.image || ""

          return (
            <div
              key={section.id || section.categoryId || index}
              id={`dining-menu-${index}`}
              className="scroll-mt-28 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#141414] shadow-sm overflow-hidden"
            >
              <button
                type="button"
                onClick={() => onToggleSection(index)}
                className="w-full flex items-center gap-3 p-4 text-left bg-gradient-to-r from-gray-50/80 to-white dark:from-[#1a1a1a] dark:to-[#141414] border-b border-gray-100 dark:border-gray-800"
              >
                {sectionImage ? (
                  <img src={sectionImage} alt="" className="h-12 w-12 rounded-2xl object-cover border border-gray-200 dark:border-gray-700 shrink-0" />
                ) : (
                  <div className="h-12 w-12 rounded-2xl bg-green-50 dark:bg-green-950/30 flex items-center justify-center shrink-0">
                    <Utensils className="h-5 w-5 text-[#16A34A]" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-extrabold text-gray-900 dark:text-white truncate">{section.name || "Category"}</h3>
                  <p className="text-xs font-semibold text-gray-500 mt-0.5">
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                  </p>
                </div>
                <ChevronDown className={`h-5 w-5 text-gray-400 shrink-0 transition-transform ${isExpanded ? "" : "-rotate-90"}`} />
              </button>

              {isExpanded && items.length > 0 && (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {items.map((item) => (
                    <MenuItemRow key={item.id || item._id || item.name} item={item} />
                  ))}
                </div>
              )}

              {isExpanded && items.length === 0 && (
                <p className="py-6 text-center text-sm text-gray-500">No items listed</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
