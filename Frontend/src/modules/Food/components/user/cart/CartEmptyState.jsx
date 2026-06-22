import { Link } from "react-router-dom"
import { ArrowLeft, ShoppingBag } from "lucide-react"
import { Button } from "@food/components/ui/button"
import AnimatedPage from "@food/components/user/AnimatedPage"

export default function CartEmptyState({ onBack }) {
  return (
    <AnimatedPage className="min-h-screen bg-[#FAFAFA] dark:bg-[#0a0a0a]">
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/90 backdrop-blur-xl dark:border-gray-800 dark:bg-[#0a0a0a]/90">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-11 w-11 rounded-2xl border border-gray-200 dark:border-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="text-base font-extrabold text-gray-900 dark:text-white">Your cart</span>
        </div>
      </div>

      <div className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-green-50 dark:bg-green-950/30">
          <ShoppingBag className="h-10 w-10 text-[#16A34A]" />
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Cart is empty</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
          Add dishes from a restaurant to start your order.
        </p>
        <Link to="/food/user" className="mt-8">
          <Button className="rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white px-8 h-12 font-bold shadow-lg shadow-green-600/20">
            Browse restaurants
          </Button>
        </Link>
      </div>
    </AnimatedPage>
  )
}
