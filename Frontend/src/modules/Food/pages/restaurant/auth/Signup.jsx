import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Phone, User, AlertCircle, Loader2 } from "lucide-react"
import { restaurantAPI } from "@food/api"
import { Button } from "@food/components/ui/button"
import { Input } from "@food/components/ui/input"
import { Label } from "@food/components/ui/label"
import RestaurantAuthLayout from "@food/components/restaurant/auth/RestaurantAuthLayout"

const DEFAULT_COUNTRY_CODE = "+91"

export default function RestaurantSignup() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    phone: "",
    name: "",
  })
  const [errors, setErrors] = useState({
    phone: "",
    name: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState("")

  const validatePhone = (phone) => {
    if (!phone.trim()) return "Phone number is required"
    const cleanPhone = phone.replace(/\D/g, "")
    if (cleanPhone.length !== 10) return "Phone number must be 10 digits"
    if (!["6", "7", "8", "9"].includes(cleanPhone[0])) {
      return "Enter a valid Indian mobile number"
    }
    return ""
  }

  const validateName = (name) => {
    if (!name.trim()) return "Restaurant name is required"
    if (name.trim().length < 2) return "Restaurant name must be at least 2 characters"
    if (name.trim().length > 50) return "Restaurant name must be less than 50 characters"
    return ""
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    const nextValue =
      name === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }))

    if (name === "phone") {
      setErrors((prev) => ({ ...prev, phone: validatePhone(nextValue) }))
    } else if (name === "name") {
      setErrors((prev) => ({ ...prev, name: validateName(nextValue) }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setApiError("")

    const phoneError = validatePhone(formData.phone)
    const nameError = validateName(formData.name)
    setErrors({ phone: phoneError, name: nameError })

    if (phoneError || nameError) {
      setIsLoading(false)
      return
    }

    const fullPhone = `${DEFAULT_COUNTRY_CODE} ${formData.phone}`.trim()

    try {
      await restaurantAPI.sendOTP(fullPhone, "register")

      const authData = {
        method: "phone",
        phone: fullPhone,
        name: formData.name.trim(),
        isSignUp: true,
        module: "restaurant",
      }
      sessionStorage.setItem("restaurantAuthData", JSON.stringify(authData))
      sessionStorage.setItem("restaurantLoginPhone", formData.phone)
      navigate("/food/restaurant/otp")
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to send OTP. Please try again."
      setApiError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <RestaurantAuthLayout
      title="Register Restaurant"
      subtitle="Enter your restaurant details to get started"
      onBack={() => navigate("/food/restaurant/login")}
    >
      <form onSubmit={handleSubmit} className="w-full space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
            Restaurant name
          </Label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
              <User className="h-4 w-4" />
            </span>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Enter restaurant name"
              value={formData.name}
              onChange={handleChange}
                className={`h-11 border-2 pl-9 shadow-none transition-colors placeholder:text-gray-400 focus-visible:border-primary-orange focus-visible:ring-2 focus-visible:ring-primary-orange/20 rounded-xl ${errors.name ? "border-red-500" : "border-gray-200"}`}
              required
            />
          </div>
          {errors.name ? (
            <div className="flex items-center gap-1 text-xs text-red-600 sm:text-sm">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.name}</span>
            </div>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
            Phone number
          </Label>
          <div className="flex gap-2">
            <div className="flex h-11 w-16 shrink-0 items-center justify-center rounded-md border border-gray-300 bg-gray-50 text-sm font-semibold text-gray-700">
              +91
            </div>
            <div className="relative min-w-0 flex-1">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                <Phone className="h-4 w-4" />
              </span>
              <Input
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                placeholder="10-digit number"
                value={formData.phone}
                onChange={handleChange}
                maxLength={10}
                className={`h-11 border-2 pl-9 shadow-none transition-colors placeholder:text-gray-400 focus-visible:border-primary-orange focus-visible:ring-2 focus-visible:ring-primary-orange/20 rounded-xl ${errors.phone ? "border-red-500" : "border-gray-200"}`}
                required
              />
            </div>
          </div>
          {errors.phone ? (
            <div className="flex items-center gap-1 text-xs text-red-600 sm:text-sm">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.phone}</span>
            </div>
          ) : null}
          {apiError && !errors.phone ? (
            <div className="mt-1 flex items-center gap-1 text-xs text-red-600 sm:text-sm">
              <AlertCircle className="h-3 w-3" />
              <span>{apiError}</span>
            </div>
          ) : null}
        </div>

        <Button
          type="submit"
          className="h-11 w-full rounded-xl bg-primary-orange text-sm font-semibold text-white shadow-md transition-colors hover:bg-primary-orange/90"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending OTP...
            </>
          ) : (
            "Send OTP"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-600">Already have an account? </span>
        <button
          type="button"
          onClick={() => navigate("/food/restaurant/login")}
          className="font-medium text-primary-orange hover:underline"
        >
          Login
        </button>
      </div>
    </RestaurantAuthLayout>
  )
}
