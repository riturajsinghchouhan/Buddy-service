export default function VegIndicator({ isVeg, size = "sm", className = "" }) {
  const box = size === "lg" ? "h-5 w-5" : "h-4 w-4"
  const dot = size === "lg" ? "h-2.5 w-2.5" : "h-2 w-2"

  return (
    <div
      className={`${box} border-2 flex items-center justify-center rounded-sm shadow-sm flex-shrink-0 ${
        isVeg ? "border-green-600 bg-green-50" : "border-red-600 bg-red-50"
      } ${className}`}
      aria-label={isVeg ? "Vegetarian" : "Non-vegetarian"}
    >
      <div className={`${dot} rounded-full ${isVeg ? "bg-green-600" : "bg-red-600"}`} />
    </div>
  )
}
