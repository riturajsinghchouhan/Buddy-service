import { useState } from "react"
import useRestaurantBackNavigation from "@food/hooks/useRestaurantBackNavigation"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2 } from "lucide-react"
import RestaurantSubPageShell from "@food/components/restaurant/panel/RestaurantSubPageShell"
import { PanelSurface } from "@food/components/restaurant/panel/panelUi"
import { RESTAURANT_BASE } from "@food/utils/restaurantNavConfig"
import { API_ENDPOINTS } from "@food/api/config"
import api from "@food/api"
import { toast } from "sonner"
import { useCompanyName } from "@food/hooks/useCompanyName"
const debugLog = (...args) => {}
const debugWarn = (...args) => {}
const debugError = (...args) => {}


export default function ShareFeedback() {
  const companyName = useCompanyName()
  const goBack = useRestaurantBackNavigation()
  const [rating, setRating] = useState(null)
  const [showThanks, setShowThanks] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const numbers = Array.from({ length: 11 }, (_, i) => i)

  const handleContinue = async () => {
    if (rating === null) return
    
    try {
      setIsSubmitting(true)
      // Save feedback experience to backend
      const response = await api.post(API_ENDPOINTS.ADMIN.FEEDBACK_EXPERIENCE_CREATE, {
        rating: Math.ceil(rating / 2) || 1, // Convert 0-10 to 1-5 for backend
        module: 'restaurant',
        comment: `User rated ${rating}/10 overall experience`
      })
      
      if (response.data?.success) {
        setShowThanks(true)
      } else {
        throw new Error(response.data?.message || 'Failed to submit')
      }
    } catch (error) {
      debugError('Error submitting feedback:', error)
      toast.error(error.message || 'Failed to save feedback')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <RestaurantSubPageShell
      title="Share your feedback"
      subtitle={`Rate your experience with ${companyName.toLowerCase()}`}
      backTo={`${RESTAURANT_BASE}/explore`}
    >
      <PanelSurface className="mb-6 p-4">
        <p className="mb-1 text-sm text-gray-700">Tell us about your</p>
        <p className="text-lg font-semibold text-gray-900">
          Overall experience with {companyName.toLowerCase()}
        </p>
      </PanelSurface>

      <PanelSurface className="mb-6 p-4">
        <div className="mb-3 grid grid-cols-11 gap-1 overflow-hidden rounded-xl border border-gray-300 bg-white">
            {numbers.map((num) => {
              const isActive = rating === num
              const intensity =
                rating === null ? 0 : Math.abs(num - rating)
              const scale = isActive ? 1.05 : intensity === 1 ? 1.02 : 1

              return (
                <motion.button
                  key={num}
                  type="button"
                  onClick={() => setRating(num)}
                  whileTap={{ scale: 0.96 }}
                  animate={{ scale }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className={`py-2 text-xs font-medium border-l border-gray-200 first:border-l-0 focus:outline-none ${
                    isActive
                      ? "bg-black text-white"
                      : "bg-white text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {num}
                </motion.button>
              )
            })}
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-red-500">Very Bad</span>
            <span className="text-xs text-green-600">Very Good</span>
          </div>
          {rating !== null && (
            <motion.p
              className="mt-3 text-xs text-gray-600"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              key={rating}
            >
              You rated your experience{" "}
              <span className="font-semibold text-gray-900">
                {rating}/10
              </span>
              .
            </motion.p>
          )}
      </PanelSurface>

      <div className="mt-6 flex items-center justify-center">
        <div className="flex h-48 w-full max-w-xs items-end justify-center rounded-3xl bg-gradient-to-r from-indigo-100 via-pink-100 to-yellow-100 px-6 pb-6">
          <div className="flex w-full items-end justify-between gap-2">
            <div className="h-20 w-10 rounded-full bg-indigo-300" />
            <div className="h-32 w-10 rounded-full bg-pink-300" />
            <div className="h-24 w-10 rounded-full bg-purple-300" />
            <div className="h-28 w-10 rounded-full bg-green-300" />
            <div className="h-22 w-10 rounded-full bg-yellow-300" />
          </div>
        </div>
      </div>

      <motion.button
        type="button"
        onClick={handleContinue}
        disabled={rating === null || isSubmitting}
        className={`mt-6 w-full rounded-2xl py-3 text-sm font-semibold transition-colors ${
          rating === null || isSubmitting
            ? "cursor-not-allowed bg-gray-200 text-gray-500"
            : "rt-btn-primary"
        }`}
        whileTap={rating !== null ? { scale: 0.98 } : undefined}
      >
        {isSubmitting ? "Submitting..." : "Continue"}
      </motion.button>

      {/* Thank you popup */}
      <AnimatePresence>
        {showThanks && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowThanks(false)
              goBack()
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 10, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm rounded-3xl bg-white px-5 pt-5 pb-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-green-600" />
                </div>
                <h2 className="text-base font-semibold text-gray-900 mb-1">
                  Thanks for your feedback
                </h2>
                <p className="text-xs text-gray-600 mb-4">
                  It helps us improve your experience with {companyName.toLowerCase()}.
                </p>
                <button
                  type="button"
                  className="w-full py-2.5 rounded-full bg-black text-white text-sm font-medium"
                  onClick={() => {
                    setShowThanks(false)
                    goBack()
                  }}
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </RestaurantSubPageShell>
  )
}


