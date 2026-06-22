export function PanelPill({ active, children, className = "", ...props }) {
  return (
    <button
      type="button"
      className={`
        shrink-0 rounded-[16px] border px-4 py-2.5 text-sm font-semibold transition
        ${active ? "rt-pill-active shadow-sm" : "border-[var(--rt-border)] bg-white text-gray-700 hover:bg-gray-50"}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}

export function PanelSurface({ children, className = "", as: Tag = "div", ...props }) {
  return (
    <Tag className={`rt-panel-surface ${className}`} {...props}>
      {children}
    </Tag>
  )
}
