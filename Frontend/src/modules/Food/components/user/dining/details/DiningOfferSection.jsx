import { Percent, Ticket } from "lucide-react"

export default function DiningOfferSection({ isDiningEnabled, onBookClick }) {
  return (
    <section id="dining-offers" className="scroll-mt-28 space-y-3">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Pre-book offers</h2>
        <p className="text-sm text-[#16A34A] font-semibold mt-0.5">Reserve early & save on your table</p>
      </div>

      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#16A34A] to-[#15803D] text-white shadow-lg shadow-green-600/20">
        <div className="flex items-start justify-between gap-4 p-5">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide mb-3">
              <Percent className="h-3.5 w-3.5" />
              Dining offer
            </div>
            <p className="text-2xl font-black leading-tight">Flat 50% OFF</p>
            <p className="mt-1.5 text-sm text-white/80">On pre-booked tables · limited slots</p>
          </div>
          <button
            type="button"
            disabled={!isDiningEnabled}
            onClick={onBookClick}
            className="shrink-0 rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-[#16A34A] shadow-sm disabled:opacity-50"
          >
            Book now
          </button>
        </div>
        <div className="border-t border-white/15 px-5 py-2.5 flex items-center gap-2 text-xs text-white/75">
          <Ticket className="h-3.5 w-3.5" />
          Walk-in offers also available at the restaurant
        </div>
      </div>
    </section>
  )
}
