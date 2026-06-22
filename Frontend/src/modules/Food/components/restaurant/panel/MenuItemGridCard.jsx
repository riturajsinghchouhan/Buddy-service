import { Pencil, ThumbsUp } from "lucide-react"
import { Switch } from "@food/components/ui/switch"

export default function MenuItemGridCard({
  item,
  category,
  approvalMeta,
  isRejectedItem,
  onEdit,
  onRecommendToggle,
  onToggleStock,
}) {
  return (
    <article className="rt-panel-surface flex h-full flex-col overflow-hidden p-0 transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-[4/3] bg-[var(--rt-surface-muted)]">
        {item.image ? (
          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-xs font-medium text-gray-400">
            {item.name}
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-1.5">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
              item.isVeg ? "bg-green-600 text-white" : "bg-red-500 text-white"
            }`}
          >
            {item.isVeg ? "Veg" : "Non-veg"}
          </span>
          {!item.inStock ? (
            <span className="rounded-full bg-gray-900/80 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
              Paused
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h4 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold text-gray-900">{item.name}</h4>
        <p className="mt-1 text-lg font-bold text-[var(--rt-primary-strong)]">
          ₹{Number(item.price || 0).toFixed(0)}
        </p>
        <span className={`mt-2 inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold ${approvalMeta.className}`}>
          {approvalMeta.label}
        </span>

        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <button
            type="button"
            onClick={() => onRecommendToggle(category.id, item.id)}
            className={`rounded-xl border p-2 ${
              item.isRecommended
                ? "border-blue-200 bg-blue-50 text-blue-600"
                : "border-[var(--rt-border)] text-gray-400"
            }`}
            aria-label="Recommend item"
          >
            <ThumbsUp className="h-4 w-4" />
          </button>

          <Switch
            checked={item.inStock}
            onCheckedChange={(checked) => onToggleStock(category.id, item.id, checked)}
            className="data-[state=checked]:bg-[var(--rt-primary-strong)]"
          />

          <button
            type="button"
            onClick={() => onEdit(category, item)}
            className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold ${
              isRejectedItem
                ? "bg-red-600 text-white"
                : "bg-[var(--rt-primary-soft)] text-[var(--rt-primary-strong)]"
            }`}
          >
            <Pencil className="h-3.5 w-3.5" />
            {isRejectedItem ? "Fix" : "Edit"}
          </button>
        </div>
      </div>
    </article>
  )
}
