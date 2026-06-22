import { ArrowLeft, MapPin } from "lucide-react"
import { Button } from "@food/components/ui/button"

export default function DiningCategoryHeader({ cityName, onBack, onLocationClick }) {
  return (
    <div className="sticky top-0 z-30 border-b border-gray-100 bg-white/90 backdrop-blur-xl dark:border-gray-800 dark:bg-[#0a0a0a]/90">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-11 w-11 rounded-2xl border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:bg-[#141414] dark:text-white dark:hover:bg-[#1a1a1a]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <button
          type="button"
          onClick={onLocationClick}
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-left transition hover:bg-gray-100 dark:border-gray-700 dark:bg-[#141414] dark:hover:bg-[#1a1a1a]"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-50 dark:bg-green-950/40">
            <MapPin className="h-4 w-4 text-[#16A34A]" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#16A34A]">Dining in</p>
            <p className="truncate text-sm font-extrabold text-gray-900 dark:text-white">{cityName}</p>
          </div>
        </button>
      </div>
    </div>
  )
}

export function DiningCategoryHero({ title, description, count, categoryImage }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-[#141414]">
      {categoryImage && (
        <div className="absolute inset-0 opacity-20 dark:opacity-10">
          <img src={categoryImage} alt="" className="h-full w-full object-cover" />
        </div>
      )}
      <div className="relative bg-gradient-to-br from-green-50/90 via-white to-white p-5 sm:p-6 dark:from-green-950/20 dark:via-[#141414] dark:to-[#141414]">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#16A34A] mb-2">Dining category</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">{title}</h1>
            <p className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
          </div>
          <div className="inline-flex shrink-0 items-center gap-2 self-start rounded-2xl border border-green-100 bg-green-50 px-4 py-2.5 text-sm font-bold text-[#16A34A] dark:border-green-900/40 dark:bg-green-950/30">
            <span className="text-lg font-black">{count}</span>
            <span>{count === 1 ? "place" : "places"}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DiningCategoryEmpty({ title }) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-white px-6 py-16 text-center dark:border-gray-800 dark:bg-[#141414]">
      <p className="text-lg font-extrabold text-gray-900 dark:text-white">No restaurants yet</p>
      <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
        {title ? `No ${title.toLowerCase()} spots are listed in your area right now.` : "Check back soon for new dining spots."}
      </p>
    </div>
  )
}
