import { ArrowLeft, Bookmark, CheckCircle2, Share2, Star, UtensilsCrossed } from "lucide-react"

export default function DiningDetailHero({
  restaurantName,
  address,
  costForTwo,
  cuisines,
  openingTime,
  closingTime,
  rating,
  reviewCount,
  heroImage,
  favorite,
  onBack,
  onShare,
  onToggleFavorite,
}) {
  return (
    <div className="relative">
      <div className="relative h-[42vh] min-h-[280px] max-h-[440px] overflow-hidden bg-gray-900">
        {heroImage ? (
          <img src={heroImage} alt={restaurantName} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-amber-900/40 to-gray-950">
            <UtensilsCrossed className="h-12 w-12 text-amber-200/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/35" />

        <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-4 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-black/30 text-white backdrop-blur-md transition hover:bg-black/45"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleFavorite}
              className={`flex h-11 w-11 items-center justify-center rounded-2xl border backdrop-blur-md transition ${
                favorite
                  ? "border-red-400/40 bg-red-500/20 text-red-300"
                  : "border-white/20 bg-black/30 text-white hover:bg-black/45"
              }`}
            >
              <Bookmark className={`h-5 w-5 ${favorite ? "fill-current" : ""}`} />
            </button>
            <button
              type="button"
              onClick={onShare}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-black/30 text-white backdrop-blur-md transition hover:bg-black/45"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 -mt-12 mx-4">
        <div className="rounded-[24px] border border-gray-100 bg-white p-4 shadow-[0_8px_40px_rgba(0,0,0,0.08)] dark:border-gray-800 dark:bg-[#141414]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight line-clamp-2">
                {restaurantName}
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{address}</p>
              <p className="mt-2 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">
                {costForTwo}
                <span className="mx-1.5 text-gray-300">·</span>
                <span className="line-clamp-1">{cuisines}</span>
              </p>
            </div>
            <div className="flex flex-col items-center rounded-2xl bg-green-50 dark:bg-green-950/40 px-3 py-2 border border-green-100 dark:border-green-900/40 shrink-0">
              <div className="flex items-center gap-1 text-[#16A34A] font-extrabold text-base">
                <Star className="h-4 w-4 fill-[#16A34A]" />
                {rating}
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-0.5">
                {reviewCount} reviews
              </span>
            </div>
          </div>

          <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gray-50 dark:bg-gray-800/80 px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-300">
            <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
            <span>Open now</span>
            <span className="text-gray-300">|</span>
            <span>
              {openingTime} – {closingTime}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
