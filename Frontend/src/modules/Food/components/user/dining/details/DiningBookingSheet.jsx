import { X } from "lucide-react"
import { Button } from "@food/components/ui/button"

export default function DiningBookingSheet({
  open,
  onClose,
  maxCapacity,
  occupiedSeats,
  remainingSeats,
  selectedGuests,
  onSelectGuests,
  onContinue,
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />

      <div className="absolute bottom-0 left-0 right-0 rounded-t-[28px] bg-white dark:bg-[#141414] px-4 pb-6 pt-3 shadow-2xl border-t border-gray-100 dark:border-gray-800 max-w-2xl mx-auto">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />

        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">Select guests</h3>
            <p className="mt-1 text-sm text-gray-500">
              {remainingSeats > 0
                ? `${remainingSeats} of ${maxCapacity} seats available right now`
                : "Fully booked for now — try again later"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2.5">
          {Array.from({ length: maxCapacity }, (_, index) => {
            const count = index + 1
            const isBooked = count <= occupiedSeats
            const isTooLarge = count > remainingSeats && !isBooked
            const isSelected = selectedGuests === count

            return (
              <button
                key={count}
                type="button"
                disabled={isBooked || isTooLarge}
                onClick={() => onSelectGuests(count)}
                className={`rounded-2xl border px-2 py-3.5 text-sm font-bold transition-all ${
                  isSelected
                    ? "border-[#16A34A] bg-green-50 dark:bg-green-950/30 text-[#16A34A] shadow-sm scale-[1.02]"
                    : isBooked
                      ? "border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20 text-red-400 cursor-not-allowed opacity-70"
                      : isTooLarge
                        ? "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-gray-300 cursor-not-allowed"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white hover:border-[#16A34A]/40"
                }`}
              >
                {isBooked ? (
                  <span className="flex flex-col items-center gap-0.5">
                    <span className="text-[9px] uppercase font-black tracking-tight opacity-60">Booked</span>
                    <span>{count}</span>
                  </span>
                ) : (
                  count
                )}
              </button>
            )
          })}
        </div>

        <Button
          onClick={onContinue}
          disabled={remainingSeats === 0 || selectedGuests > remainingSeats}
          className="mt-6 h-12 w-full rounded-2xl bg-[#16A34A] text-base font-bold text-white hover:bg-[#15803D] disabled:bg-gray-200 disabled:text-gray-400"
        >
          {remainingSeats === 0 ? "Fully booked" : "Continue to book"}
        </Button>
      </div>
    </div>
  )
}
