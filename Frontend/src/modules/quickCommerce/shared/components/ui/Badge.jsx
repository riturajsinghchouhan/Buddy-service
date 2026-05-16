import * as React from "react"
import { cva } from "class-variance-authority";
import { cn } from "@qc/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold transition-all duration-300 focus:outline-none uppercase tracking-tight",
  {
    variants: {
      variant: {
        default: "border-transparent bg-slate-900 text-white shadow-sm",
        outline: "border-slate-200 text-slate-600 bg-transparent",
        pending: "bg-amber-50 text-amber-600 border-amber-200",
        confirmed: "bg-blue-50 text-blue-600 border-blue-200",
        processing: "bg-indigo-50 text-indigo-600 border-indigo-200",
        shipped: "bg-purple-50 text-purple-600 border-purple-200",
        delivered: "bg-emerald-50 text-emerald-600 border-emerald-200",
        cancelled: "bg-rose-50 text-rose-600 border-rose-200",
        returned: "bg-slate-100 text-slate-600 border-slate-300",
        brand: "bg-primary text-white border-transparent shadow-md shadow-primary/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  // Map common backend status to badge variants
  const statusMap = {
    'pending': 'pending',
    'confirmed': 'confirmed',
    'processing': 'processing',
    'out-for-delivery': 'shipped',
    'delivered': 'delivered',
    'cancelled': 'cancelled',
    'returned': 'returned'
  };

  const resolvedVariant = statusMap[variant] || variant;

  return (<div className={cn(badgeVariants({ variant: resolvedVariant }), className)} {...props} />);
}

export { Badge, badgeVariants }
export default Badge;
