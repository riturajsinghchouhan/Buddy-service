import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@food/components/ui/button"
import { RD } from "./restaurantDetailsTheme"

export default function RestaurantBottomSheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxHeight = "max-h-[85vh]",
  width = "md:max-w-lg",
  showHandle = true,
}) {
  if (typeof window === "undefined") return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[9999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className={`fixed left-0 right-0 bottom-0 md:left-1/2 md:right-auto md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 z-[10000] ${RD.sheet} shadow-2xl ${maxHeight} md:max-h-[90vh] ${width} w-full md:w-auto flex flex-col`}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.25, type: "spring", damping: 32, stiffness: 380 }}
            onClick={(e) => e.stopPropagation()}
          >
            {showHandle && (
              <div className="flex justify-center pt-3 pb-1 md:hidden">
                <div className="h-1 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
              </div>
            )}
            {(title || subtitle) && (
              <div className="px-5 pt-2 pb-4 border-b border-gray-100 dark:border-gray-800">
                {subtitle && (
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">{subtitle}</p>
                )}
                {title && <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>}
              </div>
            )}
            <div className="flex-1 overflow-y-auto">{children}</div>
            {footer}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}

export function SheetCloseBar({ onClose, label = "Close", applyLabel, onApply, applyCount }) {
  return (
    <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-4 bg-white dark:bg-[#141414] flex items-center justify-between gap-3">
      {onApply ? (
        <>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            Cancel
          </button>
          <Button className={`${RD.btnPrimary} px-6 rounded-xl font-bold`} onClick={onApply}>
            {applyLabel}
            {applyCount > 0 ? ` (${applyCount})` : ""}
          </Button>
        </>
      ) : (
        <Button className={`w-full ${RD.btnPrimary} py-5 rounded-2xl font-bold gap-2`} onClick={onClose}>
          <X className="h-4 w-4" />
          {label}
        </Button>
      )}
    </div>
  )
}
