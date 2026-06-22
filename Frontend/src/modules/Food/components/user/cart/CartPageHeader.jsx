import { ArrowLeft, ChevronRight, Clock, MapPin, Share2 } from "lucide-react"
import { Button } from "@food/components/ui/button"

export default function CartPageHeader({
  restaurantName,
  deliveryTime,
  addressLabel,
  onBack,
  onShare,
  onAddressClick,
}) {
  return (
    <div className="sticky top-0 z-20 border-b border-gray-100 bg-white/90 backdrop-blur-xl dark:border-gray-800 dark:bg-[#0a0a0a]/90">
      <div className="mx-auto max-w-2xl px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-11 w-11 shrink-0 rounded-2xl border border-gray-200 dark:border-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#16A34A]">Checkout</p>
              <h1 className="text-base font-extrabold text-gray-900 dark:text-white truncate">{restaurantName}</h1>
              <button
                type="button"
                onClick={onAddressClick}
                className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-left transition hover:bg-gray-100 dark:border-gray-700 dark:bg-[#141414] dark:hover:bg-[#1a1a1a]"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  <Clock className="h-3.5 w-3.5 text-[#16A34A]" />
                  {deliveryTime || "25–35 mins"}
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-[#16A34A]" />
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{addressLabel}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-gray-400 ml-auto" />
                </div>
              </button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onShare}
            className="h-11 w-11 shrink-0 rounded-2xl border border-gray-200 dark:border-gray-700"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export function CartSavingsBanner({ amount, rupeeSymbol }) {
  if (!amount || amount <= 0) return null
  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20 border-b border-green-100 dark:border-green-900/30">
      <div className="mx-auto max-w-2xl px-4 py-2.5">
        <p className="text-sm font-bold text-[#16A34A]">
          You saved {rupeeSymbol}{amount} on this order
        </p>
      </div>
    </div>
  )
}
