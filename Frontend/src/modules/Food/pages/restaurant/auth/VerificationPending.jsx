import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { AlertCircle, Clock3, ShieldCheck } from "lucide-react"
import { Button } from "@food/components/ui/button"
import { useCompanyName } from "@food/hooks/useCompanyName"
import { restaurantAPI } from "@food/api"
import {
  clearRestaurantPendingPhone,
  getModuleToken,
  getRestaurantPendingPhone,
} from "@food/utils/auth"
import { resolveRestaurantOnboardingStatus } from "@food/utils/onboardingUtils"
import RestaurantAuthLayout from "@food/components/restaurant/auth/RestaurantAuthLayout"

export default function VerificationPending() {
  const companyName = useCompanyName()
  const navigate = useNavigate()
  const location = useLocation()
  const isRejected = location.state?.isRejected || false
  const rejectionReason = location.state?.rejectionReason || ""
  const [checkingStatus, setCheckingStatus] = useState(true)
  const [onboardingStatus, setOnboardingStatus] = useState("SUBMITTED")

  const pendingPhone = useMemo(() => {
    return (
      location.state?.phone ||
      getRestaurantPendingPhone() ||
      ""
    )
  }, [location.state?.phone])

  useEffect(() => {
    let cancelled = false

    const checkApprovalStatus = async () => {
      // If we already know it's rejected from the login/otp flow state, don't poll yet
      if (isRejected && !checkingStatus) return

      const token = getModuleToken("restaurant")
      // Since rejected/pending users might not have tokens yet (returned early in auth service),
      // we might rely on the state passed from OTP.
      if (!token) {
        if (!cancelled) setCheckingStatus(false)
        return
      }

      try {
        const response = await restaurantAPI.getOnboardingProgress()
        const onboarding =
          response?.data?.data?.onboarding || response?.data?.onboarding

        if (cancelled) return

        const status = resolveRestaurantOnboardingStatus(onboarding)
        setOnboardingStatus(status)

        if (status === "APPROVED") {
          clearRestaurantPendingPhone()
          navigate("/food/restaurant", { replace: true })
          return
        }

        if (status === "REJECTED") {
          navigate(`/food/restaurant/onboarding?step=${onboarding?.currentStep || onboarding?.rejectionStep || 1}`, {
            replace: true,
            state: {
              isRejected: true,
              rejectionReason: onboarding?.adminRemarks || "",
            },
          })
          return
        }

        if (status === "IN_PROGRESS" || status === "NOT_STARTED") {
          navigate(`/food/restaurant/onboarding?step=${onboarding?.currentStep || 1}`, {
            replace: true,
          })
        }
      } catch (_) {
        try {
          const response = await restaurantAPI.getCurrentRestaurant()
          const restaurant =
            response?.data?.data?.restaurant ||
            response?.data?.restaurant ||
            response?.data?.data?.user ||
            response?.data?.user

          if (cancelled) return

          if (String(restaurant?.status || "").toLowerCase() === "approved") {
            clearRestaurantPendingPhone()
            navigate("/food/restaurant", { replace: true })
          }
        } catch {
          // Keep the pending screen visible if the status check fails.
        }
      } finally {
        if (!cancelled) setCheckingStatus(false)
      }
    }

    checkApprovalStatus()

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        checkApprovalStatus()
      }
    }

    window.addEventListener("focus", handleVisibilityOrFocus)
    document.addEventListener("visibilitychange", handleVisibilityOrFocus)

    return () => {
      cancelled = true
      window.removeEventListener("focus", handleVisibilityOrFocus)
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus)
    }
  }, [navigate, isRejected, checkingStatus])

  return (
    <RestaurantAuthLayout
      title={isRejected ? "Action Required" : "Under Review"}
      subtitle={
        isRejected
          ? "Your restaurant registration was not approved. Please review the reason below and try again."
          : "Your restaurant profile has been submitted successfully. Our team is reviewing your documents and information. Please wait until verification is completed."
      }
    >
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="flex justify-center">
          {isRejected ? (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500 shadow-sm">
              <AlertCircle className="h-8 w-8" />
            </div>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 shadow-sm">
              <Clock3 className="h-8 w-8 animate-pulse" />
            </div>
          )}
        </div>

        <div className="w-full space-y-4">
          {!isRejected ? (
            <div className="text-center">
              <p className="text-sm font-semibold text-amber-600">
                Status: {onboardingStatus === "UNDER_REVIEW" ? "Under Review" : "Pending Review"}
              </p>
              {checkingStatus && (
                <p className="mt-1 text-xs text-gray-400">
                  Checking approval status...
                </p>
              )}
            </div>
          ) : null}

          {isRejected && rejectionReason && (
            <div className="rounded-xl bg-red-50 border border-red-100 p-4">
              <p className="text-xs font-semibold uppercase text-red-600 mb-1">Rejection Reason</p>
              <p className="text-sm font-medium text-red-900">
                "{rejectionReason}"
              </p>
            </div>
          )}

          {!isRejected && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="text-sm text-gray-600">
                  <p className="font-semibold text-gray-900">What's next?</p>
                  <p className="mt-1">We'll notify you via SMS/Email once verified.</p>
                  {pendingPhone ? (
                    <p className="mt-2 text-xs font-medium text-gray-400">
                      ID: <span className="text-gray-600">{pendingPhone}</span>
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          <div className="pt-2 space-y-3">
            {isRejected ? (
              <Button
                className="h-11 w-full rounded-xl bg-primary-orange text-sm font-semibold text-white shadow-md transition-colors hover:bg-primary-orange/90"
                onClick={() => navigate("/food/restaurant/onboarding", { replace: true })}
              >
                Retry Registration
              </Button>
            ) : (
              <Button
                className="h-11 w-full rounded-xl bg-primary-orange text-sm font-semibold text-white shadow-md transition-colors hover:bg-primary-orange/90"
                onClick={() => {
                  clearRestaurantPendingPhone()
                  navigate("/food/restaurant/login", { replace: true })
                }}
              >
                Back to Login
              </Button>
            )}

            {isRejected && (
              <button
                className="w-full text-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                onClick={() => {
                  clearRestaurantPendingPhone()
                  navigate("/food/restaurant/login", { replace: true })
                }}
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      </div>
    </RestaurantAuthLayout>
  )
}

