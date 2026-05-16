import * as React from "react"
import { cn } from "@qc/lib/utils"

const Card = React.forwardRef(({ className, title, subtitle, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("rounded-3xl border border-slate-100 bg-white text-card-foreground shadow-sm overflow-hidden", className)}
    {...props}>
    {(title || subtitle) && (
      <CardHeader>
        {title && <CardTitle>{title}</CardTitle>}
        {subtitle && <CardDescription>{subtitle}</CardDescription>}
      </CardHeader>
    )}
    <CardContent className={cn((title || subtitle) ? "" : "pt-4")}>
      {children}
    </CardContent>
  </div>
))
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-4", className)}
    {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-base font-bold leading-none tracking-tight text-slate-900", className)}
    {...props} />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-[11px] font-semibold text-slate-400 uppercase tracking-wider", className)}
    {...props} />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-4 pt-0", className)}
    {...props} />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
export default Card;
