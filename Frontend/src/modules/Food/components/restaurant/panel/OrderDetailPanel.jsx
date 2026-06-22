import ResendNotificationButton from "@food/components/restaurant/ResendNotificationButton"

export default function OrderDetailPanel({ order, onClose, className = "" }) {
  if (!order) return null

  const status = String(order.status || "").toLowerCase()
  const isReady = status === "ready"
  const isPreparing = status === "preparing"

  const rawPayment = order.paymentMethod
  const normalizedPayment =
    rawPayment != null ? String(rawPayment).toLowerCase().trim() : ""
  const isCod = normalizedPayment === "cash" || normalizedPayment === "cod"

  return (
    <div className={`flex h-full flex-col ${className}`}>
      <div className="border-b border-[var(--rt-border)] px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-lg font-bold text-gray-900">Order #{order.orderId}</p>
            <p className="mt-1 text-sm text-gray-600">{order.customerName}</p>
            <p className="mt-0.5 text-xs text-gray-500">
              {order.type}
              {order.tableOrToken ? ` • ${order.tableOrToken}` : ""}
            </p>
          </div>
          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${
              isReady
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-gray-200 bg-gray-50 text-gray-800"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${isReady ? "bg-green-500" : "bg-gray-700"}`}
            />
            {order.status}
          </span>
        </div>
        <p className="mt-2 text-xs text-gray-500">{order.timePlaced}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <section className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Items
          </p>
          <p className="rounded-2xl bg-[var(--rt-surface-muted)] px-3 py-3 text-sm text-gray-700">
            {order.itemsSummary}
          </p>
        </section>

        <div className="mb-4 grid grid-cols-2 gap-3 text-xs">
          {!isReady && order.eta ? (
            <div className="rounded-2xl border border-[var(--rt-border)] px-3 py-2.5">
              <p className="text-gray-500">ETA</p>
              <p className="mt-1 font-semibold text-gray-900">{order.eta}</p>
            </div>
          ) : null}
          <div className="rounded-2xl border border-[var(--rt-border)] px-3 py-2.5">
            <p className="text-gray-500">Payment</p>
            <p className={`mt-1 font-semibold ${isCod ? "text-amber-700" : "text-gray-900"}`}>
              {isCod ? "Cash on delivery" : "Paid online"}
            </p>
          </div>
        </div>

        {status === "cancelled" && order.cancellationReason ? (
          <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-3 py-3">
            <p className="text-[10px] font-bold uppercase text-red-500">Cancellation reason</p>
            <p className="mt-1 text-sm text-red-700">{order.cancellationReason}</p>
          </div>
        ) : null}

        {status === "rejected" && order.rejectionReason ? (
          <div className="mb-4 rounded-2xl border border-amber-100 bg-amber-50 px-3 py-3">
            <p className="text-[10px] font-bold uppercase text-amber-600">Rejection reason</p>
            <p className="mt-1 text-sm text-amber-700">{order.rejectionReason}</p>
          </div>
        ) : null}

        {order.restaurantNote ? (
          <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 px-3 py-3">
            <p className="text-[10px] font-bold uppercase text-blue-600">Note for restaurant</p>
            <p className="mt-1 text-sm text-blue-700">{order.restaurantNote}</p>
          </div>
        ) : null}

        {(isPreparing || isReady) && !order.deliveryPartnerId ? (
          <ResendNotificationButton
            orderId={order.orderId}
            mongoId={order.mongoId}
            onSuccess={onClose}
          />
        ) : null}
      </div>

      {onClose ? (
        <div className="border-t border-[var(--rt-border)] p-4">
          <button
            type="button"
            onClick={onClose}
            className="rt-btn-primary w-full py-3 text-sm"
          >
            Close
          </button>
        </div>
      ) : null}
    </div>
  )
}
