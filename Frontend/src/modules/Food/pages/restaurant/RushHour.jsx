import { useState, useEffect } from "react"
import useRestaurantBackNavigation from "@food/hooks/useRestaurantBackNavigation"
import Lenis from "lenis"
import { Zap } from "lucide-react"
import RestaurantSubPageShell from "@food/components/restaurant/panel/RestaurantSubPageShell"
import { PanelSurface } from "@food/components/restaurant/panel/panelUi"
import { RESTAURANT_BASE } from "@food/utils/restaurantNavConfig"
import { RadioGroup, RadioGroupItem } from "@food/components/ui/radio-group"
import { Label } from "@food/components/ui/label"
const debugLog = (...args) => {}
const debugWarn = (...args) => {}
const debugError = (...args) => {}


export default function RushHour() {
  const goBack = useRestaurantBackNavigation()
  const [selectedTime, setSelectedTime] = useState("30")

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  const handleConfirm = () => {
    debugLog("Rush hour confirmed for:", selectedTime, "minutes")
    goBack()
  }

  const timeOptions = [
    { value: "30", label: "30 minutes" },
    { value: "60", label: "1 hour" },
    { value: "90", label: "1 hour 30 minutes" },
    { value: "120", label: "2 hours" },
  ]

  return (
    <RestaurantSubPageShell
      title="Rush in kitchen"
      subtitle="Add extra prep time during busy periods"
      backTo={`${RESTAURANT_BASE}/explore`}
      contentClassName="flex flex-col"
    >
      <PanelSurface className="mb-6 flex items-start gap-4 border-blue-100 bg-blue-50 p-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--rt-primary-strong)]">
          <Zap className="h-7 w-7 text-white" strokeWidth={2.5} fill="white" />
        </div>
        <p className="flex-1 pt-1 text-sm leading-relaxed text-gray-900">
          Inform us when your kitchen is in rush and you need more time to manage orders
        </p>
      </PanelSurface>

      <PanelSurface className="mb-6 p-4">
        <h2 className="mb-4 text-base font-bold text-gray-900">How this helps you</h2>
        <div className="space-y-3">
          {[
            "Get more time to prepare food",
            "Show correct delivery time to customers",
            "Avoid crowding of riders at your restaurant",
          ].map((benefit, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200">
                <span className="text-xs font-semibold text-gray-700">{index + 1}</span>
              </div>
              <p className="text-sm text-gray-900">{benefit}</p>
            </div>
          ))}
        </div>
      </PanelSurface>

      <PanelSurface className="mb-6 p-4">
        <h2 className="mb-4 text-base font-bold text-gray-900">
          Increase food preparation time for the next
        </h2>
        <RadioGroup value={selectedTime} onValueChange={setSelectedTime} className="space-y-4">
          {timeOptions.map((option) => (
            <div key={option.value} className="flex items-center gap-3">
              <RadioGroupItem value={option.value} id={option.value} className="h-5 w-5" />
              <Label
                htmlFor={option.value}
                className="flex-1 cursor-pointer text-sm font-normal text-gray-900"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </PanelSurface>

      <button
        type="button"
        onClick={handleConfirm}
        className="rt-btn-primary w-full rounded-2xl py-3 font-semibold"
      >
        Confirm
      </button>
    </RestaurantSubPageShell>
  )
}
